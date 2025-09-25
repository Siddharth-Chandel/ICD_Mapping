from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Header, Depends
from typing import Any, List
from .ingest import ingest_csv_file
from .fhir import build_codesystem, build_conceptmap
from .storage import terminology_store
from .who_api import who_client
from .snomed_loinc import snomed_service, loinc_service, get_semantic_coding
from .fhir_resources import (
    create_problem_list_entry, create_encounter, create_patient, 
    create_practitioner, create_consent, create_audit_event, create_provenance
)
from .iso_22600 import check_resource_access, load_consent_from_fhir, access_control
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import json

router = APIRouter()


def _ensure_loaded() -> None:
    # Auto-load default dataset if store is empty
    if len(terminology_store.namaste) == 0:
        data_path = Path(__file__).resolve().parents[1] / 'data' / 'namaste_200.csv'
        if data_path.exists():
            try:
                ingest_csv_file(data_path.read_bytes())
            except Exception:
                pass


@router.post('/ingest-csv')
async def ingest_csv(file: UploadFile = File(...)) -> Any:
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail='Only CSV files are supported')
    content = await file.read()
    try:
        count = ingest_csv_file(content)
    except Exception as exc:  # keep broad for hackathon demo
        raise HTTPException(status_code=400, detail=str(exc))
    return {'ingested': count}


@router.get('/codesystem')
def get_codesystem() -> Any:
    _ensure_loaded()
    return build_codesystem()


@router.get('/conceptmap')
def get_conceptmap() -> Any:
    _ensure_loaded()
    return build_conceptmap()


@router.get('/search')
def search_terms(q: str = Query(..., min_length=1)) -> Any:
    _ensure_loaded()
    return terminology_store.search(q)


@router.get('/translate')
async def translate(code: str = Query(...), system: str = Query(..., pattern='^(namaste|icd11)$')) -> Any:
    _ensure_loaded()
    raw = terminology_store.translate(code, system)
    # Normalize, de-duplicate and enrich with titles
    def norm_icd(c: str) -> str:
        return c.replace('ICD-11:', '').strip()

    # Basic demo title map (would come from WHO API/cache in production)
    title_map = {
        'TM2-AY134': 'Acid dyspepsia (TM2)',
        'K29.7': 'Gastritis, unspecified',
        '5A11': 'Type 2 diabetes mellitus',
        'TM2-AY999': 'Vata imbalance (TM2)'
    }

    matches = raw.get('matches', [])
    if system == 'namaste':
        # Return ICD targets with titles
        seen: set[str] = set()
        targets: list[dict[str, Any]] = []
        for m in matches:
            code_only = norm_icd(m.get('code', ''))
            if not code_only or code_only in seen:
                continue
            seen.add(code_only)
            targets.append({
                'code': code_only,
                'title': title_map.get(code_only, code_only),
                'system': 'ICD-11'
            })
        # Try to enrich using WHO mock data if still missing titles
        if any(t['title'] == t['code'] for t in targets):
            tm2 = await who_client.get_tm2_entities()
            bio = await who_client.get_biomedicine_entities()
            full = {e['id']: e.get('title') for e in tm2}
            full.update({e['id']: e.get('title') for e in bio})
            for t in targets:
                if t['title'] == t['code'] and t['code'] in full:
                    t['title'] = full[t['code']]
        return { 'targets': targets }
    else:
        # system == icd11 → return NAMASTE codes with labels
        seen: set[str] = set()
        targets: list[dict[str, Any]] = []
        for m in matches:
            c = m.get('code')
            if not c or c in seen:
                continue
            seen.add(c)
            term = terminology_store.namaste.get(c)
            targets.append({
                'code': c,
                'title': term.label if term else c,
                'system': 'NAMASTE'
            })
        return { 'targets': targets }


@router.get('/suggest')
def suggest(q: str = Query(..., min_length=1)) -> Any:
    _ensure_loaded()
    return terminology_store.suggest_with_confidence(q)


# --- Mock ABHA OAuth ---
@router.post('/auth')
def auth(abha_id: str = Query(...)) -> Any:
    if not abha_id or len(abha_id) < 6:
        raise HTTPException(status_code=400, detail='Invalid ABHA ID')
    # simple mock token
    token = f"mock.{abha_id}.token"
    exp = int(datetime.utcnow().timestamp()) + 3600
    return {'access_token': token, 'token_type': 'bearer', 'expires_at': exp}


def _require_auth(authorization: str | None) -> None:
    if not authorization or not authorization.startswith('Bearer mock.'):
        raise HTTPException(status_code=401, detail='Unauthorized')


# --- FHIR Bundle ingest with Audit/Provenance ---
AUDIT_LOG: list[dict[str, Any]] = []
PROV_LOG: list[dict[str, Any]] = []


@router.post('/ingest-bundle')
def ingest_bundle(bundle: dict[str, Any], authorization: str | None = Header(default=None)) -> Any:
    _require_auth(authorization)
    if bundle.get('resourceType') != 'Bundle':
        raise HTTPException(status_code=400, detail='Invalid Bundle')
    entries = bundle.get('entry') or []
    has_condition = any((e.get('resource') or {}).get('resourceType') == 'Condition' for e in entries)
    if not has_condition:
        raise HTTPException(status_code=400, detail='Bundle missing Condition resource')

    now = datetime.utcnow().isoformat() + 'Z'
    AUDIT_LOG.append({
        'resourceType': 'AuditEvent',
        'type': {'code': 'rest'},
        'action': 'C',
        'recorded': now,
        'outcome': '0',
        'agent': [{'requestor': True}],
        'source': {'site': 'ayush-fhir'},
    })
    PROV_LOG.append({
        'resourceType': 'Provenance',
        'recorded': now,
        'agent': [{'type': {'text': 'system'}, 'who': {'display': 'ayush-fhir'}}],
        'target': [{'reference': 'Bundle/new'}],
    })
    return {'status': 'accepted'}


@router.get('/audit')
def get_audit() -> Any:
    return {'entries': AUDIT_LOG}


@router.get('/provenance')
def get_provenance() -> Any:
    return {'entries': PROV_LOG}


# --- Simple stats for dashboard ---
@router.get('/stats/top-terms')
def top_terms() -> Any:
    # frequency based on presence; in real apps, count occurrences. Here, return top 5 by code order
    items = [
        {'code': t.code, 'label': t.label, 'count': 1}
        for t in list(terminology_store.namaste.values())[:5]
    ]
    return {'items': items}


@router.get('/stats/dual-coding-rate')
def dual_coding_rate() -> Any:
    total = len(terminology_store.namaste)
    dual = sum(1 for t in terminology_store.namaste.values() if t.icd11_tm2_codes)
    rate = (dual / total * 100.0) if total else 0.0
    return {'total_terms': total, 'dual_coded_terms': dual, 'rate_percent': round(rate, 2)}


@router.post('/ingest-default')
def ingest_default() -> Any:
    # Load the default 200-record CSV from data/namaste_200.csv
    data_path = Path(__file__).resolve().parents[1] / 'data' / 'namaste_200.csv'
    if not data_path.exists():
        raise HTTPException(status_code=404, detail='Default dataset not found')
    content = data_path.read_bytes()
    count = ingest_csv_file(content)
    return {'ingested': count, 'source': str(data_path.name)}


# --- WHO ICD-11 API Integration ---
@router.get('/who/tm2/search')
async def search_tm2(
    q: str | None = Query(default=None),
    query: str | None = Query(default=None)
) -> Any:
    """Search WHO ICD-11 TM2 entities"""
    _ensure_loaded()
    term = q or query
    if not term:
        raise HTTPException(status_code=422, detail="Missing ?q= or ?query=")
    
    try:
        entities = await who_client.get_tm2_entities()
        # Filter by query
        filtered = [
            e for e in entities 
            if term.lower() in e.get('title', '').lower() or 
               term.lower() in ' '.join(e.get('synonyms', [])).lower()
        ]
        return {'entities': filtered, 'count': len(filtered)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WHO API error: {str(e)}")


@router.get('/who/biomedicine/search')
async def search_biomedicine(query: str = Query(..., min_length=1)) -> Any:
    """Search WHO ICD-11 Biomedicine entities"""
    _ensure_loaded()
    try:
        entities = await who_client.get_biomedicine_entities(query)
        return {'entities': entities, 'count': len(entities)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WHO API error: {str(e)}")


# --- SNOMED CT / LOINC Integration ---
@router.get('/snomed/search')
def search_snomed(
    q: str | None = Query(default=None),
    query: str | None = Query(default=None),
) -> Any:
    """Search SNOMED CT concepts"""
    _ensure_loaded()
    term = q or query
    if not term:
        raise HTTPException(status_code=422, detail="Missing ?q= or ?query=")
    concepts = snomed_service.search_concepts(term)
    return {
        'concepts': [
            {'code': c.code, 'display': c.display, 'system': c.system, 'category': c.category}
            for c in concepts
        ],
        'count': len(concepts)
    }

@router.get('/loinc/search')
def search_loinc(
    q: str | None = Query(default=None),
    query: str | None = Query(default=None),
) -> Any:
    """Search LOINC codes"""
    _ensure_loaded()
    term = q or query
    if not term:
        raise HTTPException(status_code=422, detail="Missing ?q= or ?query=")
    codes = loinc_service.search_codes(term)
    return {
        'codes': [
            {'code': c.code, 'display': c.display, 'system': c.system, 'category': c.category}
            for c in codes
        ],
        'count': len(codes)
    }
# --- FHIR Problem List with Dual Coding ---
@router.post('/fhir/problem-list')
def create_problem_list(
    namaste_code: str = Query(...),
    patient_id: str = Query(default="patient-001"),
    practitioner_id: str = Query(default="practitioner-001"),
    encounter_id: str = Query(default="encounter-001"),
    authorization: str | None = Header(default=None)
) -> Any:
    """Create FHIR Problem List entry with dual coding"""
    _ensure_loaded()
    _require_auth(authorization)
    
    # Get ICD-11 codes for the NAMASTE term
    term = terminology_store.namaste.get(namaste_code)
    if not term:
        raise HTTPException(status_code=404, detail=f"NAMASTE code {namaste_code} not found")
    
    icd11_codes = term.icd11_tm2_codes
    
    try:
        # Create Problem List entry
        condition = create_problem_list_entry(
            namaste_code=namaste_code,
            icd11_codes=icd11_codes,
            patient_id=patient_id,
            practitioner_id=practitioner_id,
            encounter_id=encounter_id
        )
        
        # Create audit event
        audit_event = create_audit_event(
            action="C",
            outcome="0",
            agent_name="Ayush FHIR Service",
            resource_type="Condition"
        )
        
        # Create provenance
        provenance = create_provenance(
            target_reference=f"Condition/{condition['id']}",
            agent_name="Ayush FHIR Service"
        )
        
        return {
            'condition': condition,
            'audit_event': audit_event,
            'provenance': provenance,
            'dual_coding': {
                'namaste': {
                    'code': namaste_code,
                    'display': term.label
                },
                'icd11': [
                    {
                        'code': code,
                        'display': f"{code} (TM2)" if code.startswith("TM2-") else f"{code} (Biomedicine)"
                    }
                    for code in icd11_codes
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating problem list: {str(e)}")


# --- ISO 22600 Access Control ---
@router.post('/consent')
def create_consent_resource(
    patient_id: str = Query(...),
    purpose: str = Query(default="TREATMENT"),
    authorization: str | None = Header(default=None)
) -> Any:
    """Create FHIR Consent resource"""
    _require_auth(authorization)
    
    consent = create_consent(patient_id=patient_id, purpose=purpose)
    
    # Load consent rules into access control
    load_consent_from_fhir(consent)
    
    return consent


@router.post('/access-check')
def check_access(
    subject_id: str = Query(...),
    subject_type: str = Query(...),
    subject_roles: str = Query(...),  # Comma-separated roles
    action: str = Query(...),
    resource_type: str = Query(...),
    resource_id: str = Query(...),
    purpose: str = Query(default="TREATMENT"),
    patient_id: str | None = Query(default=None),
    authorization: str | None = Header(default=None)
) -> Any:
    """Check resource access per ISO 22600"""
    _require_auth(authorization)
    
    roles = [role.strip() for role in subject_roles.split(',')]
    
    allowed, reason = check_resource_access(
        subject_id=subject_id,
        subject_type=subject_type,
        subject_roles=roles,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        purpose=purpose,
        patient_id=patient_id
    )
    
    return {
        'allowed': allowed,
        'reason': reason,
        'request': {
            'subject_id': subject_id,
            'subject_type': subject_type,
            'subject_roles': roles,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'purpose': purpose,
            'patient_id': patient_id
        }
    }



