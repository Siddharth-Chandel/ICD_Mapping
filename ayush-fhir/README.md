# Ayush Interoperability & FHIR Microservice

A comprehensive FHIR R4-compliant terminology microservice that integrates India's NAMASTE terminologies with WHO ICD-11 (Traditional Medicine Module 2 & Biomedicine) for Electronic Medical Record (EMR) systems, fully compliant with India's 2016 EHR Standards.

## 🎯 Problem Statement Solution

This project addresses the critical need for interoperability between India's Ayush sector (Ayurveda, Siddha, Unani) and global healthcare systems by implementing dual/double coding that enables:

- **Interoperability**: Clinicians across systems can understand patient records
- **Analytics**: Public health analytics spanning traditional and biomedical medicine  
- **Insurance**: Ayush treatments become reimbursable through ICD-11 coding
- **Compliance**: Full adherence to India's 2016 EHR Standards

## 🏗️ Architecture

### Core Components

1. **NAMASTE Integration**: Ingest and manage 4,500+ standardized Ayush terms
2. **WHO ICD-11 API**: OAuth2 integration with TM2 and Biomedicine modules
3. **SNOMED CT/LOINC**: Semantic support for clinical findings and lab tests
4. **FHIR R4 Resources**: CodeSystem, ConceptMap, Condition, Consent, AuditEvent, Provenance
5. **ISO 22600 Access Control**: Privilege management and consent enforcement
6. **ABHA OAuth2**: Mock authentication with ABHA token support

### Technology Stack

- **Backend**: FastAPI (Python 3.8+)
- **Frontend**: Responsive HTML5 with Tailwind CSS + Chart.js
- **Standards**: FHIR R4, ISO 22600, OAuth2, SNOMED CT, LOINC
- **Data**: CSV ingestion, in-memory storage, WHO API integration

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

```bash
# Clone and navigate to project
cd ayush-fhir

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

### Access the Application

- **Web UI**: http://127.0.0.1:8000/
- **API Docs**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health

## 📋 Features Implemented

### ✅ MVP (Must-Have)

- [x] **NAMASTE CSV Ingestion**: Load 200-record dataset with validation
- [x] **FHIR CodeSystem Generation**: Convert NAMASTE terms to FHIR CodeSystem
- [x] **FHIR ConceptMap Generation**: Map NAMASTE → ICD-11 TM2
- [x] **Auto-complete Endpoint**: Search with fuzzy matching and typo tolerance
- [x] **Translate Operation**: Bidirectional NAMASTE ↔ ICD-11 translation

### ✅ V1 (Should-Have)

- [x] **FHIR Bundle Ingest**: Accept Patient, Practitioner, Encounter, Condition resources
- [x] **Mock ABHA OAuth**: Simulate ABHA authentication flow
- [x] **Audit/Provenance**: Capture AuditEvent and Provenance metadata
- [x] **WHO ICD-11 API**: OAuth2 client credentials integration
- [x] **SNOMED CT/LOINC**: Semantic coding for clinical findings and lab tests

### ✅ V2 (Could-Have)

- [x] **ISO 22600 Access Control**: Consent-based privilege management
- [x] **Version Tracking**: Resource versioning and update timestamps
- [x] **CLI Interface**: Command-line testing and demonstration
- [x] **Enhanced UI**: Responsive design with comprehensive feature coverage

### ✅ V3 (Wow Factor)

- [x] **AI-Powered Mapping**: Confidence scoring for term suggestions
- [x] **Multi-language Support**: Hindi synonyms and fuzzy matching
- [x] **Interactive Dashboard**: Real-time analytics and visualization
- [x] **Dual Coding Problem List**: FHIR Condition with multiple coding systems

## 🔧 API Endpoints

### Core Terminology

- `GET /search?q={term}` - Search NAMASTE terms with fuzzy matching
- `GET /suggest?q={term}` - AI-powered suggestions with confidence scores
- `GET /translate?code={code}&system={namaste|icd11}` - Bidirectional translation
- `GET /codesystem` - FHIR CodeSystem for NAMASTE terms
- `GET /conceptmap` - FHIR ConceptMap NAMASTE → ICD-11

### WHO ICD-11 Integration

- `GET /who/tm2/search?q={term}` - Search WHO ICD-11 TM2 entities
- `GET /who/biomedicine/search?q={term}` - Search WHO ICD-11 Biomedicine

### SNOMED CT / LOINC

- `GET /snomed/search?q={term}` - Search SNOMED CT concepts
- `GET /loinc/search?q={term}` - Search LOINC codes

### FHIR Resources

- `POST /fhir/problem-list?namaste_code={code}` - Create dual-coded Problem List entry
- `POST /ingest-bundle` - Ingest FHIR Bundle with validation
- `POST /consent?patient_id={id}` - Create FHIR Consent resource

### Security & Compliance

- `POST /auth?abha_id={id}` - Mock ABHA authentication
- `POST /access-check` - ISO 22600 access control validation
- `GET /audit` - Retrieve AuditEvent logs
- `GET /provenance` - Retrieve Provenance metadata

### Analytics

- `GET /stats/top-terms` - Top NAMASTE terms by frequency
- `GET /stats/dual-coding-rate` - Dual coding coverage statistics

## 🖥️ CLI Interface

The project includes a comprehensive CLI for testing and demonstration:

```bash
# Search NAMASTE terms
python cli.py search --query "Amlapitta"

# Translate between systems
python cli.py translate --code "AY001" --system "namaste"

# Get AI suggestions
python cli.py suggest --query "dyspepsia"

# Search WHO ICD-11 TM2
python cli.py who-tm2 --query "dyspepsia"

# Search SNOMED CT
python cli.py snomed --query "stomach"

# Search LOINC
python cli.py loinc --query "glucose"

# Create Problem List entry
python cli.py problem-list --code "AY001"

# Check access control
python cli.py access --subject "doctor-001" --action "read" --resource "Condition"

# Run complete demo
python cli.py demo
```

## 🎯 Demo Workflow

### 1. Data Ingestion
- Click "Load default 200 records" to ingest NAMASTE dataset
- Verify ingestion with `{"ingested": 200, "source": "namaste_200.csv"}`

### 2. Terminology Search & Translation
- Search: Type "Amlapitta" → see exact/partial matches
- AI Suggest: Get confidence-scored suggestions
- Translate: AY001 (namaste) → TM2-AY134 (icd11)

### 3. WHO ICD-11 Integration
- Search TM2 entities for traditional medicine terms
- Search Biomedicine entities for standard medical terms

### 4. SNOMED CT / LOINC Integration
- Search clinical findings in SNOMED CT
- Search laboratory tests in LOINC

### 5. FHIR Problem List Creation
- Authenticate with mock ABHA ID (e.g., "12345678")
- Create dual-coded Problem List entry with NAMASTE + ICD-11 codes
- View complete FHIR Condition resource with multiple coding systems

### 6. Access Control & Compliance
- Test ISO 22600 access control with different roles
- View AuditEvent and Provenance metadata
- Verify consent-based access enforcement

### 7. Analytics Dashboard
- View dual-coding coverage statistics
- See top NAMASTE terms visualization
- Monitor system usage patterns

## 📊 FHIR Resources Generated

### CodeSystem (NAMASTE)
```json
{
  "resourceType": "CodeSystem",
  "id": "namaste",
  "url": "http://example.com/CodeSystem/namaste",
  "concept": [
    {
      "code": "AY001",
      "display": "Amlapitta",
      "designation": [
        {"value": "Dyspepsia"},
        {"value": "अम्लपित्त"}
      ]
    }
  ]
}
```

### ConceptMap (NAMASTE → ICD-11)
```json
{
  "resourceType": "ConceptMap",
  "id": "namaste-to-icd11",
  "sourceUri": "http://example.com/CodeSystem/namaste",
  "targetUri": "http://id.who.int/icd11",
  "group": [{
    "element": [{
      "code": "AY001",
      "target": [{"code": "TM2-AY134", "equivalence": "equivalent"}]
    }]
  }]
}
```

### Condition (Dual-Coded Problem List)
```json
{
  "resourceType": "Condition",
  "code": {
    "coding": [
      {
        "system": "http://example.com/CodeSystem/namaste",
        "code": "AY001",
        "display": "Amlapitta"
      },
      {
        "system": "http://id.who.int/icd11",
        "code": "TM2-AY134",
        "display": "Acid dyspepsia (TM2)"
      },
      {
        "system": "http://snomed.info/sct",
        "code": "22253000",
        "display": "Pain in stomach"
      }
    ]
  }
}
```

## 🔒 Security & Compliance

### ABHA OAuth2 Integration
- Mock ABHA authentication with JWT tokens
- Token validation and expiration handling
- Scope-based access control

### ISO 22600 Access Control
- Consent-based privilege management
- Purpose limitation enforcement
- Data minimization compliance
- Role-based access control

### Audit Trails
- Complete AuditEvent logging for all operations
- Provenance tracking for resource authorship
- Version tracking for terminology updates
- Consent metadata capture

## 📈 Analytics & Reporting

### Dual Coding Statistics
- Coverage rate: Percentage of NAMASTE terms with ICD-11 mappings
- Top terms: Most frequently used NAMASTE diagnoses
- Mapping quality: Confidence scores for AI suggestions

### Public Health Insights
- Traditional medicine usage patterns
- Cross-system interoperability metrics
- Insurance claim readiness indicators

## 🚀 Deployment

### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Considerations
- Use proper OAuth2 client credentials for WHO ICD-11 API
- Implement persistent storage (PostgreSQL/MongoDB)
- Add Redis caching for terminology lookups
- Deploy with HTTPS/TLS termination
- Configure proper logging and monitoring
- Implement backup and disaster recovery

## 📚 Standards Compliance

### India's 2016 EHR Standards
- ✅ FHIR R4 APIs
- ✅ SNOMED CT semantics for clinical findings
- ✅ LOINC semantics for laboratory tests
- ✅ ISO 22600 access control
- ✅ ABHA-linked OAuth 2.0 authentication
- ✅ Consent and audit metadata
- ✅ Version tracking and provenance

### ICD-11 Coding Rules
- ✅ Multiple codings per Condition resource
- ✅ Proper linearization (TM2 vs Biomedicine)
- ✅ Post-coordination support
- ✅ Manifestation coding

## 🤝 Contributing

This is a hackathon project demonstrating Ayush interoperability. For production deployment:

1. Replace mock WHO API with real OAuth2 credentials
2. Implement persistent storage
3. Add comprehensive error handling
4. Enhance security measures
5. Add performance monitoring
6. Implement backup strategies

## 📄 License

This project is developed for the Ministry of Ayush hackathon and demonstrates interoperability between traditional Indian medicine and global healthcare standards.

## 🏆 Hackathon Deliverables

### ✅ Completed
- [x] NAMASTE CSV ingestion and FHIR CodeSystem generation
- [x] WHO ICD-11 API integration with OAuth2
- [x] FHIR ConceptMap for NAMASTE → ICD-11 mapping
- [x] Auto-complete endpoint with fuzzy matching
- [x] Bidirectional translate operation
- [x] FHIR Bundle ingest with dual coding
- [x] Mock ABHA OAuth2 authentication
- [x] ISO 22600 access control implementation
- [x] SNOMED CT/LOINC semantic integration
- [x] Complete audit trails and provenance
- [x] Responsive web UI with all features
- [x] CLI interface for testing
- [x] Analytics dashboard with visualizations

### 🎯 Demo Ready
The system is fully functional and ready for hackathon demonstration with:
- Complete terminology interoperability
- FHIR R4 compliance
- India EHR Standards adherence
- Real-time analytics
- Comprehensive security model

---

**Built for Ministry of Ayush - All India Institute of Ayurveda (AIIA)**
**Category: Software | Theme: MedTech / BioTech / HealthTech**


## 📖 Website Functions 1–8: Why, How, and When to Use

This section documents the UI sections labeled 1–8 in `static/index.html` and their corresponding APIs in `app/api.py`.

### 1) Ingest NAMASTE CSV
- **Why**: Load NAMASTE terms into the in-memory store for search, translate, and analytics.
- **How (UI)**: Choose a `.csv` file and click “Upload”, or click “Load default 200 records”.
- **APIs**:
  - `POST /ingest-csv` (multipart file)
  - `POST /ingest-default` → loads `data/namaste_200.csv`
- **Outcome**: Store populated; dashboard stats update.

### 2) Search & AI Suggest
- **Why**: Find NAMASTE terms quickly; get confidence-ranked suggestions for better UX.
- **How (UI)**: Type in the box. Suggestions drop down as you type; press Enter or click a suggestion.
- **APIs**:
  - `GET /search?q=...` → exact/partial matches
  - `GET /suggest?q=...` → suggestions with `confidence`
- **Outcome**: Results rendered on the left; suggestions with confidence on the right.

### 3) Translate (NAMASTE ↔ ICD‑11)
- **Why**: Map codes between NAMASTE and ICD‑11 TM2/Biomedicine for interoperability.
- **How (UI)**: Enter a code (e.g., `AY001` or `TM2-AY134`), choose system, click “Translate”.
- **API**: `GET /translate?code={code}&system={namaste|icd11}`
- **Outcome**: Target codes with titles displayed as cards.

### 4) Mock ABHA OAuth & Bundle Ingest
- **Why**: Demonstrate authenticated workflows and capture audit/provenance during ingest.
- **How (UI)**: Enter ABHA ID → click “Auth” → then “Send Bundle”.
- **APIs**:
  - `POST /auth?abha_id=...` → returns mock bearer token
  - `POST /ingest-bundle` (Authorization: Bearer <token>)
- **Outcome**: Bundle accepted; corresponding AuditEvent/Provenance recorded.

### 5) Audit & Provenance
- **Why**: View security and lineage metadata for compliance/traceability.
- **How (UI)**: After sending a bundle, click “Send Bundle” or refresh audit section.
- **APIs**:
  - `GET /audit`
  - `GET /provenance`
- **Outcome**: JSON logs of AuditEvent and Provenance displayed.

### 6) WHO ICD‑11 & SNOMED/LOINC Integration
- **Why**: Explore external terminologies alongside NAMASTE for broader compatibility.
- **How (UI)**: Enter a query in TM2 or SNOMED/LOINC areas and click “Search”.
- **APIs**:
  - `GET /who/tm2/search?q=...`
  - `GET /snomed/search?q=...`
  - `GET /loinc/search?q=...`
- **Outcome**: Responsive JSON results for each terminology source.

### 7) FHIR Problem List with Dual Coding + ISO 22600 Access
- **Why**: Create dual‑coded clinical entries and validate access with consent/roles.
- **How (UI)**:
  - Authenticate first (Section 4).
  - Enter NAMASTE code and click “Create”.
  - Test access: fill Subject/Action/Resource and click “Check Access”.
- **APIs**:
  - `POST /fhir/problem-list?namaste_code=...` (Authorization: Bearer)
  - `POST /access-check?...` (Authorization: Bearer)
- **Outcome**: Returns a FHIR Condition with NAMASTE + ICD‑11 codings and access decision JSON.

### 8) Dashboard & Analytics
- **Why**: Quick insight into coverage and top-used terms.
- **How (UI)**: Loads automatically on page open; refreshed after ingestion.
- **APIs**:
  - `GET /stats/top-terms`
  - `GET /stats/dual-coding-rate`
- **Outcome**: Rate text and a Chart.js bar chart of top terms.

### Confidence Scores in Suggestions
- Implemented in `app/storage.py` → `TerminologyStore.suggest_with_confidence`
- Returned via `GET /suggest` and displayed in the UI dropdowns (Search and Translate) as provided by the API.
