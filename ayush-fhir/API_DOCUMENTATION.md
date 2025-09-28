# AYUSH Interoperability & FHIR API Documentation

## Overview

The AYUSH Interoperability & FHIR Service is a comprehensive FHIR R4-compliant terminology microservice that integrates India's NAMASTE terminologies with WHO ICD-11 (Traditional Medicine Module 2 & Biomedicine) for Electronic Medical Record (EMR) systems, fully compliant with India's 2016 EHR Standards.

**Base URL:** `http://localhost:8000` (development)  
**API Version:** 0.1.0  
**Content-Type:** `application/json`

## Authentication

Most endpoints require Bearer token authentication via the `Authorization` header:
```
Authorization: Bearer <token>
```

Get a token using the `/auth` endpoint with a valid ABHA ID.

---

## Core Endpoints

### Health Check

#### `GET /health`
Check if the service is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Data Ingestion

### `POST /ingest-csv`
Upload and ingest CSV terminology data.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** CSV file upload

**Response:**
```json
{
  "ingested": 200
}
```

**Error Responses:**
- `400` - Invalid file format (only CSV supported)
- `400` - File processing error

### `POST /ingest-default`
Load the default 200-record NAMASTE dataset.

**Response:**
```json
{
  "ingested": 200,
  "source": "namaste_200.csv"
}
```

---

## Terminology Search & Translation

### `GET /search`
Search NAMASTE terminology by query string.

**Parameters:**
- `q` (string, required) - Search query (minimum 1 character)

**Example:**
```
GET /search?q=amlapitta
```

**Response:**
```json
{
  "matches": [
    {
      "code": "AY001",
      "label": "Amlapitta",
      "confidence": 0.95
    }
  ],
  "count": 1
}
```

### `GET /suggest`
Get AI-powered suggestions with confidence scores.

**Parameters:**
- `q` (string, required) - Search query (minimum 1 character)

**Example:**
```
GET /suggest?q=amlapitta
```

**Response:**
```json
{
  "suggestions": [
    {
      "label": "Amlapitta",
      "namaste_code": "AY001",
      "confidence": 95
    }
  ]
}
```

### `GET /translate`
Translate between NAMASTE and ICD-11 coding systems.

**Parameters:**
- `code` (string, required) - Code to translate
- `system` (string, required) - Source system (`namaste` or `icd11`)

**Examples:**
```
GET /translate?code=AY001&system=namaste
GET /translate?code=TM2-AY134&system=icd11
```

**Response:**
```json
{
  "targets": [
    {
      "code": "TM2-AY134",
      "title": "Acid dyspepsia (TM2)",
      "system": "ICD-11"
    }
  ]
}
```

---

## FHIR Resources

### `GET /codesystem`
Get FHIR R4 CodeSystem resource for NAMASTE terminology.

**Response:**
```json
{
  "resourceType": "CodeSystem",
  "id": "namaste",
  "url": "http://namaste.ayush.gov.in/codesystem",
  "version": "1.0.0",
  "name": "NAMASTE Terminology",
  "status": "active",
  "content": "complete",
  "concept": [
    {
      "code": "AY001",
      "display": "Amlapitta",
      "definition": "Acid dyspepsia"
    }
  ]
}
```

### `GET /conceptmap`
Get FHIR R4 ConceptMap resource for NAMASTE to ICD-11 mapping.

**Response:**
```json
{
  "resourceType": "ConceptMap",
  "id": "namaste-to-icd11",
  "url": "http://namaste.ayush.gov.in/conceptmap",
  "version": "1.0.0",
  "name": "NAMASTE to ICD-11 Mapping",
  "status": "active",
  "sourceUri": "http://namaste.ayush.gov.in/codesystem",
  "targetUri": "http://id.who.int/icd/release/11/mms",
  "group": [
    {
      "source": "http://namaste.ayush.gov.in/codesystem",
      "target": "http://id.who.int/icd/release/11/mms",
      "element": [
        {
          "code": "AY001",
          "target": [
            {
              "code": "TM2-AY134",
              "display": "Acid dyspepsia (TM2)",
              "equivalence": "equivalent"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## WHO ICD-11 Integration

### `GET /who/tm2/search`
Search WHO ICD-11 Traditional Medicine Module 2 entities.

**Parameters:**
- `q` or `query` (string, optional) - Search term

**Example:**
```
GET /who/tm2/search?q=acid dyspepsia
```

**Response:**
```json
{
  "entities": [
    {
      "id": "TM2-AY134",
      "title": "Acid dyspepsia",
      "synonyms": ["Gastric acidity", "Hyperacidity"],
      "category": "Digestive system disorders"
    }
  ],
  "count": 1
}
```

### `GET /who/biomedicine/search`
Search WHO ICD-11 Biomedicine entities.

**Parameters:**
- `query` (string, required) - Search term (minimum 1 character)

**Example:**
```
GET /who/biomedicine/search?query=gastritis
```

**Response:**
```json
{
  "entities": [
    {
      "id": "K29.7",
      "title": "Gastritis, unspecified",
      "category": "Diseases of the digestive system"
    }
  ],
  "count": 1
}
```

---

## SNOMED CT & LOINC Integration

### `GET /snomed/search`
Search SNOMED CT concepts.

**Parameters:**
- `q` or `query` (string, optional) - Search term

**Example:**
```
GET /snomed/search?q=gastritis
```

**Response:**
```json
{
  "concepts": [
    {
      "code": "235595009",
      "display": "Gastritis",
      "system": "http://snomed.info/sct",
      "category": "Clinical finding"
    }
  ],
  "count": 1
}
```

### `GET /loinc/search`
Search LOINC codes.

**Parameters:**
- `q` or `query` (string, optional) - Search term

**Example:**
```
GET /loinc/search?q=glucose
```

**Response:**
```json
{
  "codes": [
    {
      "code": "33747-0",
      "display": "Glucose [Mass/volume] in Blood",
      "system": "http://loinc.org",
      "category": "Chemistry"
    }
  ],
  "count": 1
}
```

---

## FHIR Problem List Management

### `POST /fhir/problem-list`
Create FHIR Problem List entry with dual coding (NAMASTE + ICD-11).

**Authentication:** Required

**Parameters:**
- `namaste_code` (string, required) - NAMASTE code
- `patient_id` (string, optional) - Patient ID (default: "patient-001")
- `practitioner_id` (string, optional) - Practitioner ID (default: "practitioner-001")
- `encounter_id` (string, optional) - Encounter ID (default: "encounter-001")

**Example:**
```
POST /fhir/problem-list?namaste_code=AY001&patient_id=patient-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "condition": {
    "resourceType": "Condition",
    "id": "condition-001",
    "code": {
      "coding": [
        {
          "system": "http://namaste.ayush.gov.in/codesystem",
          "code": "AY001",
          "display": "Amlapitta"
        },
        {
          "system": "http://id.who.int/icd/release/11/mms",
          "code": "TM2-AY134",
          "display": "Acid dyspepsia (TM2)"
        }
      ]
    },
    "subject": {
      "reference": "Patient/patient-123"
    },
    "recorder": {
      "reference": "Practitioner/practitioner-001"
    }
  },
  "audit_event": {
    "resourceType": "AuditEvent",
    "action": "C",
    "outcome": "0",
    "agent": [
      {
        "name": "Ayush FHIR Service"
      }
    ]
  },
  "provenance": {
    "resourceType": "Provenance",
    "target": [
      {
        "reference": "Condition/condition-001"
      }
    ],
    "agent": [
      {
        "name": "Ayush FHIR Service"
      }
    ]
  },
  "dual_coding": {
    "namaste": {
      "code": "AY001",
      "display": "Amlapitta"
    },
    "icd11": [
      {
        "code": "TM2-AY134",
        "display": "TM2-AY134 (TM2)"
      }
    ]
  }
}
```

---

## ISO 22600 Access Control

### `POST /consent`
Create FHIR Consent resource for patient data access.

**Authentication:** Required

**Parameters:**
- `patient_id` (string, required) - Patient ID
- `purpose` (string, optional) - Purpose of consent (default: "TREATMENT")

**Example:**
```
POST /consent?patient_id=patient-123&purpose=TREATMENT
Authorization: Bearer <token>
```

**Response:**
```json
{
  "resourceType": "Consent",
  "id": "consent-001",
  "status": "active",
  "scope": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/consentscope",
        "code": "patient-privacy"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes",
          "code": "purpose"
        }
      ]
    }
  ],
  "patient": {
    "reference": "Patient/patient-123"
  },
  "policyRule": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "TREATMENT"
      }
    ]
  }
}
```

### `POST /access-check`
Check resource access permissions per ISO 22600.

**Authentication:** Required

**Parameters:**
- `subject_id` (string, required) - Subject ID
- `subject_type` (string, required) - Subject type (e.g., "practitioner")
- `subject_roles` (string, required) - Comma-separated roles
- `action` (string, required) - Action (e.g., "read", "write")
- `resource_type` (string, required) - Resource type (e.g., "Condition")
- `resource_id` (string, required) - Resource ID
- `purpose` (string, optional) - Purpose (default: "TREATMENT")
- `patient_id` (string, optional) - Patient ID

**Example:**
```
POST /access-check?subject_id=pract-123&subject_type=practitioner&subject_roles=doctor&action=read&resource_type=Condition&resource_id=condition-001&purpose=TREATMENT&patient_id=patient-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "allowed": true,
  "reason": "Access granted based on practitioner role and treatment purpose",
  "request": {
    "subject_id": "pract-123",
    "subject_type": "practitioner",
    "subject_roles": ["doctor"],
    "action": "read",
    "resource_type": "Condition",
    "resource_id": "condition-001",
    "purpose": "TREATMENT",
    "patient_id": "patient-123"
  }
}
```

---

## Authentication

### `POST /auth`
Authenticate using ABHA ID and get access token.

**Parameters:**
- `abha_id` (string, required) - ABHA ID (minimum 6 characters)

**Example:**
```
POST /auth?abha_id=123456789012
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "abha_id": "123456789012"
}
```

**Error Responses:**
- `400` - Invalid ABHA ID (too short)

---

## Bundle Management

### `POST /ingest-bundle`
Ingest FHIR Bundle with audit and provenance tracking.

**Authentication:** Required

**Request Body:**
```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Condition",
        "code": {
          "coding": [
            {
              "system": "http://namaste.ayush.gov.in/codesystem",
              "code": "AY001",
              "display": "Amlapitta"
            }
          ]
        }
      }
    }
  ]
}
```

**Response:**
```json
{
  "status": "accepted"
}
```

**Error Responses:**
- `400` - Invalid Bundle format
- `400` - Bundle missing Condition resource

---

## Audit & Provenance

### `GET /audit`
Get audit log entries.

**Response:**
```json
{
  "entries": [
    {
      "resourceType": "AuditEvent",
      "type": {
        "code": "rest"
      },
      "action": "C",
      "recorded": "2024-01-15T10:30:00Z",
      "outcome": "0",
      "agent": [
        {
          "requestor": true
        }
      ],
      "source": {
        "site": "ayush-fhir"
      }
    }
  ]
}
```

### `GET /provenance`
Get provenance log entries.

**Response:**
```json
{
  "entries": [
    {
      "resourceType": "Provenance",
      "recorded": "2024-01-15T10:30:00Z",
      "agent": [
        {
          "type": {
            "text": "system"
          },
          "who": {
            "display": "ayush-fhir"
          }
        }
      ],
      "target": [
        {
          "reference": "Bundle/new"
        }
      ]
    }
  ]
}
```

---

## Statistics & Analytics

### `GET /stats/top-terms`
Get top NAMASTE terms by frequency.

**Response:**
```json
{
  "items": [
    {
      "code": "AY001",
      "label": "Amlapitta",
      "count": 1
    }
  ]
}
```

### `GET /stats/dual-coding-rate`
Get dual coding statistics.

**Response:**
```json
{
  "total_terms": 200,
  "dual_coded_terms": 150,
  "rate_percent": 75.0
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource not found)
- `422` - Unprocessable Entity (validation error)
- `500` - Internal Server Error

Error responses include a `detail` field with error description:

```json
{
  "detail": "NAMASTE code AY999 not found"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting based on:
- API key
- IP address
- User authentication

---

## CORS

The API supports CORS for web applications. All origins are currently allowed in development.

---

## Data Models

### Term
```json
{
  "code": "string",
  "label": "string",
  "icd11_tm2_codes": ["string"]
}
```

### Translation Target
```json
{
  "code": "string",
  "title": "string",
  "system": "string"
}
```

### Search Match
```json
{
  "code": "string",
  "label": "string",
  "confidence": "number"
}
```

---

## Frontend Integration

The API serves a React frontend at the root path (`/`). The frontend provides:

- **Search Interface** - Search NAMASTE terminology
- **Translation Interface** - Translate between coding systems
- **Integration Interface** - WHO ICD-11, SNOMED CT, LOINC search
- **Problem List Interface** - Create FHIR problem list entries
- **Access Control Interface** - ISO 22600 compliance testing

All frontend components include **Copy** and **Download** functionality for API responses.

---

## Development Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Frontend: http://localhost:8000

---

## Production Deployment

For production deployment, consider:

1. **Environment Variables:**
   - `DATABASE_URL` - Database connection string
   - `REDIS_URL` - Redis for caching
   - `WHO_API_KEY` - WHO ICD-11 API key
   - `JWT_SECRET` - JWT signing secret

2. **Security:**
   - Enable HTTPS
   - Implement proper authentication
   - Add rate limiting
   - Configure CORS properly

3. **Monitoring:**
   - Add logging
   - Health checks
   - Metrics collection

4. **Scaling:**
   - Use production WSGI server (Gunicorn)
   - Database for persistent storage
   - Load balancing for multiple instances

---

## Support

For technical support or questions about the API, please refer to the project documentation or contact the development team.
