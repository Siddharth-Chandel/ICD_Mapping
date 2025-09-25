"""
ISO 22600 Access Control Implementation
Implements privilege management and access control per India's EHR Standards
"""
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime


class Action(Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    SEARCH = "search"


class Purpose(Enum):
    TREATMENT = "TREATMENT"
    PAYMENT = "PAYMENT"
    HEALTHCARE_OPERATIONS = "HEALTHCARE_OPERATIONS"
    RESEARCH = "RESEARCH"
    PUBLIC_HEALTH = "PUBLIC_HEALTH"


@dataclass
class Subject:
    """Subject (who) in access control"""
    id: str
    type: str  # "practitioner", "patient", "system"
    roles: List[str]
    organization: Optional[str] = None


@dataclass
class Resource:
    """Resource (what) in access control"""
    id: str
    type: str  # "Patient", "Condition", "Encounter", etc.
    owner: Optional[str] = None  # Patient ID for patient-owned resources


@dataclass
class AccessRequest:
    """Access control request"""
    subject: Subject
    action: Action
    resource: Resource
    purpose: Purpose
    context: Optional[Dict[str, Any]] = None


@dataclass
class ConsentRule:
    """Consent rule from FHIR Consent resource"""
    patient_id: str
    purpose: Purpose
    action: Action
    resource_type: str
    allow: bool
    conditions: Optional[Dict[str, Any]] = None


class ISO22600AccessControl:
    """ISO 22600 compliant access control system"""
    
    def __init__(self):
        self.consent_rules: List[ConsentRule] = []
        self.role_permissions: Dict[str, List[Action]] = {
            "doctor": [Action.READ, Action.WRITE, Action.SEARCH],
            "nurse": [Action.READ, Action.SEARCH],
            "patient": [Action.READ],
            "system": [Action.READ, Action.WRITE, Action.SEARCH, Action.DELETE],
            "researcher": [Action.READ, Action.SEARCH]
        }
    
    def add_consent_rule(self, rule: ConsentRule) -> None:
        """Add consent rule"""
        self.consent_rules.append(rule)
    
    def check_access(self, request: AccessRequest) -> Tuple[bool, str]:
        """
        Check if access is allowed per ISO 22600
        Returns (allowed, reason)
        """
        # Check role-based permissions
        if not self._check_role_permissions(request):
            return False, "Insufficient role permissions"
        
        # Check consent rules
        if not self._check_consent_rules(request):
            return False, "Consent not granted"
        
        # Check purpose limitation
        if not self._check_purpose_limitation(request):
            return False, "Purpose not allowed"
        
        # Check data minimization
        if not self._check_data_minimization(request):
            return False, "Data minimization violation"
        
        return True, "Access granted"
    
    def _check_role_permissions(self, request: AccessRequest) -> bool:
        """Check if subject's role allows the action"""
        for role in request.subject.roles:
            if role in self.role_permissions:
                if request.action in self.role_permissions[role]:
                    return True
        return False
    
    def _check_consent_rules(self, request: AccessRequest) -> bool:
        """Check consent rules"""
        # Find applicable consent rules
        applicable_rules = [
            rule for rule in self.consent_rules
            if (rule.purpose == request.purpose and
                rule.action == request.action and
                (rule.resource_type == request.resource.type or rule.resource_type == "*"))
        ]
        
        if not applicable_rules:
            # No specific consent rules - check default
            return self._check_default_consent(request)
        
        # Check if any rule allows access
        for rule in applicable_rules:
            if rule.allow:
                return True
        
        return False
    
    def _check_default_consent(self, request: AccessRequest) -> bool:
        """Check default consent rules"""
        # Default: allow treatment-related access for healthcare providers
        if (request.purpose == Purpose.TREATMENT and
            "doctor" in request.subject.roles and
            request.action in [Action.READ, Action.WRITE]):
            return True
        
        # Default: allow patients to read their own data
        if (request.subject.type == "patient" and
            request.action == Action.READ and
            request.resource.owner == request.subject.id):
            return True
        
        return False
    
    def _check_purpose_limitation(self, request: AccessRequest) -> bool:
        """Check purpose limitation principle"""
        # Treatment purpose is generally allowed
        if request.purpose == Purpose.TREATMENT:
            return True
        
        # Research requires explicit consent
        if request.purpose == Purpose.RESEARCH:
            return any(
                rule.purpose == Purpose.RESEARCH and rule.allow
                for rule in self.consent_rules
            )
        
        # Payment and operations require appropriate roles
        if request.purpose in [Purpose.PAYMENT, Purpose.HEALTHCARE_OPERATIONS]:
            return "doctor" in request.subject.roles or "system" in request.subject.roles
        
        return True
    
    def _check_data_minimization(self, request: AccessRequest) -> bool:
        """Check data minimization principle"""
        # System actions are generally allowed
        if request.subject.type == "system":
            return True
        
        # Patients can access their own data
        if (request.subject.type == "patient" and
            request.resource.owner == request.subject.id):
            return True
        
        # Healthcare providers can access patient data for treatment
        if (request.purpose == Purpose.TREATMENT and
            "doctor" in request.subject.roles):
            return True
        
        return False
    
    def create_consent_from_fhir(self, consent_resource: Dict[str, Any]) -> List[ConsentRule]:
        """Create consent rules from FHIR Consent resource"""
        rules = []
        
        patient_ref = consent_resource.get("patient", {}).get("reference", "")
        patient_id = patient_ref.replace("Patient/", "") if patient_ref else ""
        
        provision = consent_resource.get("provision", {})
        provision_type = provision.get("type", "permit")
        allow = provision_type == "permit"
        
        # Extract purpose
        purposes = provision.get("purpose", [])
        for purpose_coding in purposes:
            purpose_code = purpose_coding.get("code", "")
            purpose = Purpose(purpose_code) if purpose_code in [p.value for p in Purpose] else Purpose.TREATMENT
            
            # Extract actions
            actions = provision.get("action", [])
            for action_coding in actions:
                action_code = action_coding.get("code", "")
                action = Action(action_code) if action_code in [a.value for a in Action] else Action.READ
                
                # Extract resource types
                resource_types = provision.get("class", [])
                if not resource_types:
                    resource_types = [{"code": "*"}]  # Default to all resources
                
                for resource_type_coding in resource_types:
                    resource_type = resource_type_coding.get("code", "*")
                    
                    rule = ConsentRule(
                        patient_id=patient_id,
                        purpose=purpose,
                        action=action,
                        resource_type=resource_type,
                        allow=allow
                    )
                    rules.append(rule)
        
        return rules


# Global access control instance
access_control = ISO22600AccessControl()


def check_resource_access(
    subject_id: str,
    subject_type: str,
    subject_roles: List[str],
    action: str,
    resource_type: str,
    resource_id: str,
    purpose: str = "TREATMENT",
    patient_id: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Check access to a resource
    Returns (allowed, reason)
    """
    subject = Subject(
        id=subject_id,
        type=subject_type,
        roles=subject_roles
    )
    
    resource = Resource(
        id=resource_id,
        type=resource_type,
        owner=patient_id
    )
    
    request = AccessRequest(
        subject=subject,
        action=Action(action),
        resource=resource,
        purpose=Purpose(purpose)
    )
    
    return access_control.check_access(request)


def load_consent_from_fhir(consent_resource: Dict[str, Any]) -> None:
    """Load consent rules from FHIR Consent resource"""
    rules = access_control.create_consent_from_fhir(consent_resource)
    for rule in rules:
        access_control.add_consent_rule(rule)

