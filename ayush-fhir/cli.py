#!/usr/bin/env python3
"""
CLI Interface for Ayush FHIR Service
Provides command-line testing and demonstration capabilities
"""
import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any, List
import argparse

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.storage import terminology_store
from app.ingest import ingest_csv_file
from app.who_api import who_client
from app.snomed_loinc import snomed_service, loinc_service
from app.fhir_resources import create_problem_list_entry
from app.iso_22600 import check_resource_access


class AyushFHIRCLI:
    """Command-line interface for Ayush FHIR Service"""
    
    def __init__(self):
        self.loaded = False
    
    def load_data(self):
        """Load default dataset"""
        if not self.loaded:
            data_path = Path(__file__).parent / "data" / "namaste_200.csv"
            if data_path.exists():
                content = data_path.read_bytes()
                count = ingest_csv_file(content)
                print(f"✓ Loaded {count} NAMASTE terms")
                self.loaded = True
            else:
                print("✗ Default dataset not found")
                sys.exit(1)
    
    def search_namaste(self, query: str) -> None:
        """Search NAMASTE terms"""
        self.load_data()
        results = terminology_store.search(query)
        
        print(f"\n🔍 Search Results for '{query}':")
        print("=" * 50)
        
        if results['exact']:
            print("\n📌 Exact Matches:")
            for item in results['exact']:
                print(f"  • {item['code']}: {item['label']}")
                if item['synonyms']:
                    print(f"    Synonyms: {', '.join(item['synonyms'])}")
                if item['icd11_tm2_codes']:
                    print(f"    ICD-11: {', '.join(item['icd11_tm2_codes'])}")
        
        if results['partial']:
            print("\n🔍 Partial Matches:")
            for item in results['partial']:
                print(f"  • {item['code']}: {item['label']}")
                if item['synonyms']:
                    print(f"    Synonyms: {', '.join(item['synonyms'])}")
                if item['icd11_tm2_codes']:
                    print(f"    ICD-11: {', '.join(item['icd11_tm2_codes'])}")
        
        if not results['exact'] and not results['partial']:
            print("  No matches found")
    
    def translate_term(self, code: str, system: str) -> None:
        """Translate between NAMASTE and ICD-11"""
        self.load_data()
        results = terminology_store.translate(code, system)
        
        print(f"\n🔄 Translation: {code} ({system})")
        print("=" * 50)
        
        if results['matches']:
            for match in results['matches']:
                print(f"  → {match['system']}: {match['code']}")
        else:
            print("  No translations found")
    
    def suggest_ai(self, query: str) -> None:
        """AI-powered suggestions with confidence"""
        self.load_data()
        results = terminology_store.suggest_with_confidence(query)
        
        print(f"\n🤖 AI Suggestions for '{query}':")
        print("=" * 50)
        
        if results['suggestions']:
            for suggestion in results['suggestions']:
                print(f"  • {suggestion['namaste_code']}: {suggestion['label']}")
                print(f"    Confidence: {suggestion['confidence']}%")
                if suggestion['icd11_candidates']:
                    print(f"    ICD-11: {', '.join(suggestion['icd11_candidates'])}")
        else:
            print("  No suggestions found")
    
    async def search_who_tm2(self, query: str) -> None:
        """Search WHO ICD-11 TM2"""
        print(f"\n🌍 WHO ICD-11 TM2 Search: '{query}'")
        print("=" * 50)
        
        try:
            entities = await who_client.get_tm2_entities()
            filtered = [
                e for e in entities 
                if query.lower() in e.get('title', '').lower() or 
                   query.lower() in ' '.join(e.get('synonyms', [])).lower()
            ]
            
            if filtered:
                for entity in filtered:
                    print(f"  • {entity['id']}: {entity['title']}")
                    print(f"    Definition: {entity.get('definition', 'N/A')}")
                    if entity.get('synonyms'):
                        print(f"    Synonyms: {', '.join(entity['synonyms'])}")
            else:
                print("  No TM2 entities found")
        except Exception as e:
            print(f"  Error: {e}")
    
    def search_snomed(self, query: str) -> None:
        """Search SNOMED CT"""
        print(f"\n🏥 SNOMED CT Search: '{query}'")
        print("=" * 50)
        
        concepts = snomed_service.search_concepts(query)
        if concepts:
            for concept in concepts:
                print(f"  • {concept.code}: {concept.display}")
                print(f"    System: {concept.system}")
                print(f"    Category: {concept.category}")
        else:
            print("  No SNOMED concepts found")
    
    def search_loinc(self, query: str) -> None:
        """Search LOINC"""
        print(f"\n🧪 LOINC Search: '{query}'")
        print("=" * 50)
        
        codes = loinc_service.search_codes(query)
        if codes:
            for code in codes:
                print(f"  • {code.code}: {code.display}")
                print(f"    System: {code.system}")
                print(f"    Category: {code.category}")
        else:
            print("  No LOINC codes found")
    
    def create_problem_list(self, namaste_code: str) -> None:
        """Create FHIR Problem List entry"""
        self.load_data()
        
        print(f"\n📋 Creating Problem List Entry: {namaste_code}")
        print("=" * 50)
        
        try:
            term = terminology_store.namaste.get(namaste_code)
            if not term:
                print(f"  ✗ NAMASTE code {namaste_code} not found")
                return
            
            condition = create_problem_list_entry(
                namaste_code=namaste_code,
                icd11_codes=term.icd11_tm2_codes,
                patient_id="patient-001",
                practitioner_id="practitioner-001",
                encounter_id="encounter-001"
            )
            
            print("  ✓ FHIR Condition created:")
            print(f"    ID: {condition['id']}")
            print(f"    Status: {condition['clinicalStatus']['coding'][0]['display']}")
            print(f"    Codings:")
            for coding in condition['code']['coding']:
                print(f"      • {coding['system']}: {coding['code']} - {coding['display']}")
            
            print(f"\n  📊 Dual Coding Summary:")
            print(f"    NAMASTE: {namaste_code} - {term.label}")
            print(f"    ICD-11: {', '.join(term.icd11_tm2_codes)}")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    def check_access(self, subject_id: str, action: str, resource_type: str) -> None:
        """Check access control"""
        print(f"\n🔐 Access Control Check")
        print("=" * 50)
        
        allowed, reason = check_resource_access(
            subject_id=subject_id,
            subject_type="practitioner",
            subject_roles=["doctor"],
            action=action,
            resource_type=resource_type,
            resource_id="example-001",
            purpose="TREATMENT"
        )
        
        print(f"  Subject: {subject_id}")
        print(f"  Action: {action}")
        print(f"  Resource: {resource_type}")
        print(f"  Result: {'✓ ALLOWED' if allowed else '✗ DENIED'}")
        print(f"  Reason: {reason}")
    
    def demo_workflow(self) -> None:
        """Demonstrate complete workflow"""
        print("\n🎯 Complete Ayush FHIR Workflow Demo")
        print("=" * 60)
        
        # 1. Search for a term
        self.search_namaste("Amlapitta")
        
        # 2. Get AI suggestions
        self.suggest_ai("dyspepsia")
        
        # 3. Translate
        self.translate_term("AY001", "namaste")
        
        # 4. Search WHO TM2
        asyncio.run(self.search_who_tm2("dyspepsia"))
        
        # 5. Search SNOMED
        self.search_snomed("stomach")
        
        # 6. Search LOINC
        self.search_loinc("glucose")
        
        # 7. Create Problem List
        self.create_problem_list("AY001")
        
        # 8. Check Access
        self.check_access("doctor-001", "read", "Condition")
        
        print("\n✅ Demo completed successfully!")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description="Ayush FHIR Service CLI")
    parser.add_argument("command", choices=[
        "search", "translate", "suggest", "who-tm2", "snomed", "loinc", 
        "problem-list", "access", "demo"
    ], help="Command to execute")
    parser.add_argument("--query", "-q", help="Search query")
    parser.add_argument("--code", "-c", help="Code to translate")
    parser.add_argument("--system", "-s", choices=["namaste", "icd11"], 
                       help="System for translation")
    parser.add_argument("--subject", help="Subject ID for access check")
    parser.add_argument("--action", help="Action for access check")
    parser.add_argument("--resource", help="Resource type for access check")
    
    args = parser.parse_args()
    cli = AyushFHIRCLI()
    
    if args.command == "search":
        if not args.query:
            print("Error: --query required for search")
            sys.exit(1)
        cli.search_namaste(args.query)
    
    elif args.command == "translate":
        if not args.code or not args.system:
            print("Error: --code and --system required for translate")
            sys.exit(1)
        cli.translate_term(args.code, args.system)
    
    elif args.command == "suggest":
        if not args.query:
            print("Error: --query required for suggest")
            sys.exit(1)
        cli.suggest_ai(args.query)
    
    elif args.command == "who-tm2":
        if not args.query:
            print("Error: --query required for who-tm2")
            sys.exit(1)
        asyncio.run(cli.search_who_tm2(args.query))
    
    elif args.command == "snomed":
        if not args.query:
            print("Error: --query required for snomed")
            sys.exit(1)
        cli.search_snomed(args.query)
    
    elif args.command == "loinc":
        if not args.query:
            print("Error: --query required for loinc")
            sys.exit(1)
        cli.search_loinc(args.query)
    
    elif args.command == "problem-list":
        if not args.code:
            print("Error: --code required for problem-list")
            sys.exit(1)
        cli.create_problem_list(args.code)
    
    elif args.command == "access":
        if not all([args.subject, args.action, args.resource]):
            print("Error: --subject, --action, and --resource required for access")
            sys.exit(1)
        cli.check_access(args.subject, args.action, args.resource)
    
    elif args.command == "demo":
        cli.demo_workflow()


if __name__ == "__main__":
    main()

