from typing import Dict, Any, List
from .storage import terminology_store


BASE_URL = 'http://example.com'
NAMASTE_CS_URL = f'{BASE_URL}/CodeSystem/namaste'
ICD11_URL = 'http://id.who.int/icd11'


def build_codesystem() -> Dict[str, Any]:
    concepts: List[Dict[str, Any]] = []
    for term in terminology_store.namaste.values():
        concept: Dict[str, Any] = {
            'code': term.code,
            'display': term.label,
        }
        if term.synonyms:
            concept['designation'] = [{'value': s} for s in term.synonyms]
        concepts.append(concept)
    return {
        'resourceType': 'CodeSystem',
        'id': 'namaste',
        'url': NAMASTE_CS_URL,
        'version': '1.0.0',
        'name': 'NAMASTE',
        'status': 'active',
        'content': 'complete',
        'concept': concepts,
    }


def build_conceptmap() -> Dict[str, Any]:
    elements: List[Dict[str, Any]] = []
    for term in terminology_store.namaste.values():
        targets = []
        for icd in term.icd11_tm2_codes:
            code_only = icd.replace('ICD-11:', '').strip()
            targets.append({'code': code_only, 'equivalence': 'equivalent'})
        elements.append({'code': term.code, 'target': targets})
    return {
        'resourceType': 'ConceptMap',
        'id': 'namaste-to-icd11',
        'url': f'{BASE_URL}/ConceptMap/namaste-to-icd11',
        'sourceUri': NAMASTE_CS_URL,
        'targetUri': ICD11_URL,
        'group': [{
            'source': NAMASTE_CS_URL,
            'target': ICD11_URL,
            'element': elements,
        }],
    }



