"""
FHIR R4 Resources for NAMASTE-ICD-11 Integration
Implements proper FHIR resources per India's 2016 EHR Standards
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
from .storage import terminology_store
from .snomed_loinc import get_semantic_coding


def create_problem_list_entry(
    namaste_code: str,
    icd11_codes: List[str],
    patient_id: str = "patient-001",
    practitioner_id: str = "practitioner-001",
    encounter_id: str = "encounter-001"
) -> Dict[str, Any]:
    """
    Create FHIR ProblemList entry with dual coding (NAMASTE + ICD-11)
    Complies with ICD-11 coding rules for multiple codings
    """
    term = terminology_store.namaste.get(namaste_code)
    if not term:
        raise ValueError(f"NAMASTE code {namaste_code} not found")
    
    # Get semantic coding (SNOMED CT for clinical findings)
    semantic = get_semantic_coding(term.label, "clinical")
    
    # Build coding array with multiple systems
    codings = []
    
    # NAMASTE coding
    codings.append({
        "system": "http://example.com/CodeSystem/namaste",
        "code": namaste_code,
        "display": term.label
    })
    
    # ICD-11 TM2 codings
    for icd_code in icd11_codes:
        if icd_code.startswith("TM2-"):
            codings.append({
                "system": "http://id.who.int/icd11",
                "code": icd_code,
                "display": f"{icd_code} (TM2)"
            })
        else:
            # ICD-11 Biomedicine
            codings.append({
                "system": "http://id.who.int/icd11",
                "code": icd_code,
                "display": f"{icd_code} (Biomedicine)"
            })
    
    # SNOMED CT coding (if available)
    if semantic.get("snomed"):
        codings.append(semantic["snomed"])
    
    condition = {
        "resourceType": "Condition",
        "id": f"condition-{uuid.uuid4().hex[:8]}",
        "meta": {
            "profile": ["http://hl7.org/fhir/StructureDefinition/Condition"]
        },
        "identifier": [
            {
                "system": "http://example.com/conditions",
                "value": f"COND-{uuid.uuid4().hex[:8]}"
            }
        ],
        "clinicalStatus": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    "code": "active",
                    "display": "Active"
                }
            ]
        },
        "verificationStatus": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                    "code": "confirmed",
                    "display": "Confirmed"
                }
            ]
        },
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                        "code": "encounter-diagnosis",
                        "display": "Encounter Diagnosis"
                    }
                ]
            }
        ],
        "code": {
            "coding": codings,
            "text": term.label
        },
        "subject": {
            "reference": f"Patient/{patient_id}",
            "display": "Patient"
        },
        "encounter": {
            "reference": f"Encounter/{encounter_id}",
            "display": "Encounter"
        },
        "recordedDate": datetime.now().isoformat() + "Z",
        "recorder": {
            "reference": f"Practitioner/{practitioner_id}",
            "display": "Practitioner"
        },
        "note": [
            {
                "text": f"Dual-coded condition: {term.label} (NAMASTE: {namaste_code})"
            }
        ]
    }
    
    return condition


def create_encounter(
    patient_id: str = "patient-001",
    practitioner_id: str = "practitioner-001",
    encounter_type: str = "outpatient"
) -> Dict[str, Any]:
    """Create FHIR Encounter resource"""
    return {
        "resourceType": "Encounter",
        "id": f"encounter-{uuid.uuid4().hex[:8]}",
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
        },
        "type": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/encounter-type",
                        "code": encounter_type,
                        "display": encounter_type.title()
                    }
                ]
            }
        ],
        "subject": {
            "reference": f"Patient/{patient_id}",
            "display": "Patient"
        },
        "participant": [
            {
                "individual": {
                    "reference": f"Practitioner/{practitioner_id}",
                    "display": "Practitioner"
                }
            }
        ],
        "period": {
            "start": datetime.now().isoformat() + "Z",
            "end": datetime.now().isoformat() + "Z"
        }
    }


def create_patient(
    patient_id: str = "patient-001",
    abha_id: str = "12345678901234"
) -> Dict[str, Any]:
    """Create FHIR Patient resource with ABHA ID"""
    return {
        "resourceType": "Patient",
        "id": patient_id,
        "identifier": [
            {
                "system": "https://abdm.gov.in/abha",
                "value": abha_id,
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                            "code": "ABHA",
                            "display": "ABHA ID"
                        }
                    ]
                }
            }
        ],
        "name": [
            {
                "use": "official",
                "text": "Demo Patient",
                "family": "Patient",
                "given": ["Demo"]
            }
        ],
        "gender": "other",
        "birthDate": "1990-01-01"
    }


def create_practitioner(
    practitioner_id: str = "practitioner-001",
    name: str = "Dr. Demo Practitioner"
) -> Dict[str, Any]:
    """Create FHIR Practitioner resource"""
    return {
        "resourceType": "Practitioner",
        "id": practitioner_id,
        "identifier": [
            {
                "system": "http://example.com/practitioners",
                "value": f"PRAC-{practitioner_id}"
            }
        ],
        "name": [
            {
                "use": "official",
                "text": name,
                "family": "Practitioner",
                "given": ["Demo", "Dr."]
            }
        ],
        "qualification": [
            {
                "code": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0360",
                            "code": "MD",
                            "display": "Doctor of Medicine"
                        }
                    ]
                }
            }
        ]
    }


def create_consent(
    patient_id: str = "patient-001",
    purpose: str = "TREATMENT"
) -> Dict[str, Any]:
    """Create FHIR Consent resource per ISO 22600"""
    return {
        "resourceType": "Consent",
        "id": f"consent-{uuid.uuid4().hex[:8]}",
        "status": "active",
        "scope": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                    "code": "patient-privacy",
                    "display": "Patient Privacy"
                }
            ]
        },
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes",
                        "code": "INFAO",
                        "display": "Information Access"
                    }
                ]
            }
        ],
        "patient": {
            "reference": f"Patient/{patient_id}",
            "display": "Patient"
        },
        "dateTime": datetime.now().isoformat() + "Z",
        "policyRule": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/consentpolicycodes",
                    "code": "OPTIN",
                    "display": "Opt In"
                }
            ]
        },
        "provision": {
            "type": "permit",
            "purpose": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-PurposeOfUse",
                    "code": purpose,
                    "display": purpose.title()
                }
            ],
            "action": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/consentaction",
                            "code": "access",
                            "display": "Access"
                        }
                    ]
                }
            ]
        }
    }


def create_audit_event(
    action: str = "C",
    outcome: str = "0",
    agent_name: str = "System",
    resource_type: str = "Condition"
) -> Dict[str, Any]:
    """Create FHIR AuditEvent resource per EHR Standards"""
    return {
        "resourceType": "AuditEvent",
        "id": f"audit-{uuid.uuid4().hex[:8]}",
        "type": {
            "system": "http://terminology.hl7.org/CodeSystem/audit-event-type",
            "code": "rest",
            "display": "RESTful Operation"
        },
        "subtype": [
            {
                "system": "http://hl7.org/fhir/restful-interaction",
                "code": "create" if action == "C" else "read",
                "display": "Create" if action == "C" else "Read"
            }
        ],
        "action": action,
        "recorded": datetime.now().isoformat() + "Z",
        "outcome": outcome,
        "outcomeDesc": "Success" if outcome == "0" else "Failure",
        "agent": [
            {
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/audit-agent-type",
                            "code": "1",
                            "display": "User Device"
                        }
                    ]
                },
                "requestor": True,
                "name": agent_name
            }
        ],
        "source": {
            "site": "ayush-fhir-service",
            "observer": {
                "reference": "Device/ayush-fhir-device"
            }
        },
        "entity": [
            {
                "type": {
                    "system": "http://terminology.hl7.org/CodeSystem/audit-entity-type",
                    "code": "2",
                    "display": "System Object"
                },
                "role": {
                    "system": "http://terminology.hl7.org/CodeSystem/object-role",
                    "code": "4",
                    "display": "Domain Resource"
                },
                "what": {
                    "reference": f"{resource_type}/example"
                }
            }
        ]
    }


def create_provenance(
    target_reference: str,
    agent_name: str = "Ayush FHIR Service"
) -> Dict[str, Any]:
    """Create FHIR Provenance resource"""
    return {
        "resourceType": "Provenance",
        "id": f"provenance-{uuid.uuid4().hex[:8]}",
        "target": [
            {
                "reference": target_reference
            }
        ],
        "recorded": datetime.now().isoformat() + "Z",
        "agent": [
            {
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                            "code": "author",
                            "display": "Author"
                        }
                    ]
                },
                "who": {
                    "display": agent_name
                }
            }
        ],
        "activity": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
                    "code": "CREATE",
                    "display": "Create"
                }
            ]
        }
    }

