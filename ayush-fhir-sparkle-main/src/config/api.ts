// API Configuration
const API_BASE_URL = 'https://your-username-ayush-fhir.hf.space';



// For Hugging Face deployment, set this to your backend URL
// Example: 'https://your-username-ayush-fhir.hf.space'
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    SEARCH: '/search',
    SUGGEST: '/suggest',
    TRANSLATE: '/translate',
    CODESYSTEM: '/codesystem',
    CONCEPTMAP: '/conceptmap',
    WHO_TM2: '/who/tm2/search',
    WHO_BIOMEDICINE: '/who/biomedicine/search',
    SNOMED: '/snomed/search',
    LOINC: '/loinc/search',
    PROBLEM_LIST: '/fhir/problem-list',
    CONSENT: '/consent',
    ACCESS_CHECK: '/access-check',
    AUTH: '/auth',
    INGEST_CSV: '/ingest-csv',
    INGEST_DEFAULT: '/ingest-default',
    INGEST_BUNDLE: '/ingest-bundle',
    AUDIT: '/audit',
    PROVENANCE: '/provenance',
    STATS_TOP_TERMS: '/stats/top-terms',
    STATS_DUAL_CODING: '/stats/dual-coding-rate',
    HEALTH: '/health'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
