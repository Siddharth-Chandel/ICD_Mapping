import io
import pandas as pd
from .storage import Term, terminology_store


REQUIRED_COLUMNS = ['id', 'term', 'category', 'synonyms', 'icd11_tm2_code']


def ingest_csv_file(content_bytes: bytes) -> int:
    buf = io.BytesIO(content_bytes)
    df = pd.read_csv(buf)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    # Validate uniqueness of term id
    if not df['id'].is_unique:
        raise ValueError('Duplicate ids found in CSV')

    terminology_store.clear()
    count = 0
    for _, row in df.iterrows():
        code = str(row['id']).strip()
        label = str(row['term']).strip()
        category = None if pd.isna(row['category']) else str(row['category']).strip()
        synonyms_raw = '' if pd.isna(row['synonyms']) else str(row['synonyms'])
        synonyms = [s.strip() for s in synonyms_raw.split(',') if s.strip()]
        icd_raw = '' if pd.isna(row['icd11_tm2_code']) else str(row['icd11_tm2_code'])
        icd_codes = [c.strip() for c in icd_raw.split(',') if c.strip()]
        term = Term(code=code, label=label, category=category, synonyms=synonyms, icd11_tm2_codes=icd_codes)
        terminology_store.add_term(term)
        count += 1
    return count



