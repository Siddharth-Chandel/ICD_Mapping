"""
SNOMED CT and LOINC Integration
Implements semantic support for clinical observations and lab tests
"""
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


@dataclass
class SNOMEDConcept:
    code: str
    display: str
    system: str = "http://snomed.info/sct"
    category: str = "clinical-finding"


@dataclass
class LOINCCode:
    code: str
    display: str
    system: str = "http://loinc.org"
    category: str = "laboratory"


class SNOMEDCTService:
    """SNOMED CT service for clinical findings and procedures"""
    
    def __init__(self):
        self.concepts = {
            # Clinical findings
            "finding": SNOMEDConcept("404684003", "Clinical finding", category="clinical-finding"),
            "disease": SNOMEDConcept("64572001", "Disease", category="clinical-finding"),
            "disorder": SNOMEDConcept("362981000", "Qualifier value", category="clinical-finding"),
            
            # Ayurvedic findings (mock mappings)
            "amlapitta": SNOMEDConcept("22253000", "Pain in stomach", category="clinical-finding"),
            "prameha": SNOMEDConcept("73211009", "Diabetes mellitus", category="clinical-finding"),
            "shwasa": SNOMEDConcept("13645005", "Cough", category="clinical-finding"),
            "jwara": SNOMEDConcept("386661006", "Fever", category="clinical-finding"),
        }
    
    def get_concept(self, term: str) -> Optional[SNOMEDConcept]:
        """Get SNOMED concept for a term"""
        return self.concepts.get(term.lower())
    
    def search_concepts(self, query: str) -> List[SNOMEDConcept]:
        """Search SNOMED concepts"""
        results = []
        query_lower = query.lower()
        for term, concept in self.concepts.items():
            if query_lower in term or query_lower in concept.display.lower():
                results.append(concept)
        return results


class LOINCService:
    """LOINC service for laboratory tests and observations"""
    
    def __init__(self):
        self.codes = {
            # Lab tests
            "glucose": LOINCCode("33747-0", "Glucose [Mass/volume] in Blood", category="laboratory"),
            "hemoglobin": LOINCCode("718-7", "Hemoglobin [Mass/volume] in Blood", category="laboratory"),
            "cholesterol": LOINCCode("2093-3", "Cholesterol [Mass/volume] in Serum or Plasma", category="laboratory"),
            "blood_pressure": LOINCCode("85354-9", "Blood pressure panel", category="vital-signs"),
            "temperature": LOINCCode("8310-5", "Body temperature", category="vital-signs"),
            "pulse": LOINCCode("8867-4", "Heart rate", category="vital-signs"),
            
            # Ayurvedic observations (mock mappings)
            "prakriti": LOINCCode("LA33-6", "Constitutional type", category="observation"),
            "dosha": LOINCCode("LA34-4", "Dosha imbalance", category="observation"),
        }
    
    def get_code(self, term: str) -> Optional[LOINCCode]:
        """Get LOINC code for a term"""
        return self.codes.get(term.lower())
    
    def search_codes(self, query: str) -> List[LOINCCode]:
        """Search LOINC codes"""
        results = []
        query_lower = query.lower()
        for term, code in self.codes.items():
            if query_lower in term or query_lower in code.display.lower():
                results.append(code)
        return results


# Global service instances
snomed_service = SNOMEDCTService()
loinc_service = LOINCService()


def get_semantic_coding(term: str, category: str = "clinical") -> Dict[str, Any]:
    """
    Get appropriate semantic coding (SNOMED CT or LOINC) for a term
    Based on India's EHR Standards requirements
    """
    result = {
        "snomed": None,
        "loinc": None,
        "category": category
    }
    
    if category in ["clinical", "finding", "disease", "disorder"]:
        # Use SNOMED CT for clinical findings
        snomed_concept = snomed_service.get_concept(term)
        if snomed_concept:
            result["snomed"] = {
                "system": snomed_concept.system,
                "code": snomed_concept.code,
                "display": snomed_concept.display
            }
    
    elif category in ["laboratory", "test", "observation", "vital-signs"]:
        # Use LOINC for lab tests and observations
        loinc_code = loinc_service.get_code(term)
        if loinc_code:
            result["loinc"] = {
                "system": loinc_code.system,
                "code": loinc_code.code,
                "display": loinc_code.display
            }
    
    return result

