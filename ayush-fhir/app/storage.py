from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, field
import difflib


@dataclass
class Term:
    code: str
    label: str
    category: str | None = None
    synonyms: List[str] = field(default_factory=list)
    icd11_tm2_codes: List[str] = field(default_factory=list)


class TerminologyStore:
    def __init__(self) -> None:
        self.namaste: Dict[str, Term] = {}
        self.icd_to_namaste: Dict[str, List[str]] = {}
        self.name_to_namaste: Dict[str, str] = {}

    def clear(self) -> None:
        self.namaste.clear()
        self.icd_to_namaste.clear()
        self.name_to_namaste.clear()

    def add_term(self, term: Term) -> None:
        self.namaste[term.code] = term
        # map names/synonyms to code
        self.name_to_namaste[term.label.lower()] = term.code
        for s in term.synonyms:
            self.name_to_namaste.setdefault(s.lower(), term.code)
        for icd in term.icd11_tm2_codes:
            code_only = icd.replace('ICD-11:', '').strip()
            self.icd_to_namaste.setdefault(icd, []).append(term.code)
            self.icd_to_namaste.setdefault(code_only, []).append(term.code)

    def search(self, query: str) -> Dict[str, Any]:
        q = query.lower().strip()
        exact: List[Dict[str, Any]] = []
        partial: List[Dict[str, Any]] = []
        # collect name universe for fuzzy
        name_to_code: List[Tuple[str, str]] = []
        for term in self.namaste.values():
            entry = {
                'code': term.code,
                'label': term.label,
                'synonyms': term.synonyms,
                'icd11_tm2_codes': term.icd11_tm2_codes,
            }
            if term.label.lower() == q or q in [s.lower() for s in term.synonyms]:
                exact.append(entry)
            elif q in term.label.lower() or any(q in s.lower() for s in term.synonyms):
                partial.append(entry)
            name_to_code.append((term.label.lower(), term.code))
            for s in term.synonyms:
                name_to_code.append((s.lower(), term.code))

        if not exact and not partial and q:
            # fuzzy fallback with difflib
            choices = [n for n, _ in name_to_code]
            matches = difflib.get_close_matches(q, choices, n=8, cutoff=0.6)
            codes = {code for n, code in name_to_code if n in matches}
            for c in codes:
                t = self.namaste.get(c)
                if not t:
                    continue
                partial.append({
                    'code': t.code,
                    'label': t.label,
                    'synonyms': t.synonyms,
                    'icd11_tm2_codes': t.icd11_tm2_codes,
                })
        return {'exact': exact, 'partial': partial}

    def translate(self, code: str, system: str) -> Dict[str, Any]:
        if system == 'namaste':
            # accept code or label/synonym; fuzzy fallback
            term = self.namaste.get(code)
            if not term:
                # exact by name/synonym
                code_by_name = self.name_to_namaste.get(code.lower())
                term = self.namaste.get(code_by_name) if code_by_name else None
            if not term:
                # fuzzy by name/synonym
                choices = list(self.name_to_namaste.keys())
                m = difflib.get_close_matches(code.lower(), choices, n=1, cutoff=0.6)
                if m:
                    term = self.namaste.get(self.name_to_namaste[m[0]])
            if not term:
                return {'matches': []}
            return {'matches': [{'system': 'icd11', 'code': c} for c in term.icd11_tm2_codes]}
        else:
            icd_norm = code.replace('ICD-11:', '').strip()
            nam_codes = self.icd_to_namaste.get(code, []) or self.icd_to_namaste.get(icd_norm, [])
            return {'matches': [{'system': 'namaste', 'code': c} for c in nam_codes]}

    def suggest_with_confidence(self, text: str) -> Dict[str, Any]:
        # Lightweight heuristic confidence scoring for hackathon
        q = text.lower().strip()
        suggestions: List[Dict[str, Any]] = []
        for term in self.namaste.values():
            base = term.label.lower()
            syns = [s.lower() for s in term.synonyms]
            score = 0
            # High priority: prefix matches (great for single-letter queries)
            if base.startswith(q) or any(s.startswith(q) for s in syns):
                score = 92 if len(q) == 1 else 96
            elif q == base or q in syns:
                score = 95
            elif q in base:
                score = max(score, 80)
            else:
                # token overlap heuristic
                q_tokens = set(q.split())
                t_tokens = set(base.split())
                overlap = len(q_tokens & t_tokens)
                if overlap:
                    score = max(score, 60 + 10 * min(overlap, 3))
            if score > 0:
                suggestions.append({
                    'namaste_code': term.code,
                    'label': term.label,
                    'icd11_candidates': term.icd11_tm2_codes,
                    'confidence': min(score, 99)
                })
        # If very short query (<=2), prioritize prefix alphabetical ordering
        if len(q) <= 2:
            suggestions.sort(key=lambda x: (-(x['confidence']), x['label']))
            return {'suggestions': suggestions[:50]}
        suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        return {'suggestions': suggestions[:20]}


terminology_store = TerminologyStore()


