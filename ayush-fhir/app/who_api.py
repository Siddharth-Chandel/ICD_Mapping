"""
WHO ICD-11 API Integration
Implements OAuth2 client credentials flow and data synchronization
"""
import httpx
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from pathlib import Path


class WHOICD11Client:
    def __init__(self, client_id: str = "demo_client", client_secret: str = "demo_secret"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://id.who.int"
        self.token_url = "https://icdaccessmanagement.who.int/connect/token"
        self.access_token: Optional[str] = None
        self.token_expires: Optional[datetime] = None
        self.cache_dir = Path("/tmp/cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    async def get_access_token(self) -> str:
        """Get OAuth2 access token using client credentials"""
        if self.access_token and self.token_expires and datetime.now() < self.token_expires:
            return self.access_token
        
        async with httpx.AsyncClient() as client:
            data = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "scope": "icdapi_access"
            }
            response = await client.post(self.token_url, data=data)
            response.raise_for_status()
            token_data = response.json()
            
            self.access_token = token_data["access_token"]
            expires_in = token_data.get("expires_in", 3600)
            self.token_expires = datetime.now() + timedelta(seconds=expires_in - 60)
            
            return self.access_token
    
    async def search_entities(self, query: str, linearization: str = "mms") -> List[Dict[str, Any]]:
        """Search ICD-11 entities"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        
        async with httpx.AsyncClient() as client:
            params = {
                "q": query,
                "linearization": linearization,
                "useFlexisearch": "false",
                "flatResults": "true"
            }
            response = await client.get(
                f"{self.base_url}/icd/release/11/{linearization}/mms/search",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            return response.json()
    
    async def get_entity(self, entity_id: str, linearization: str = "mms") -> Dict[str, Any]:
        """Get specific ICD-11 entity details"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/icd/release/11/{linearization}/mms/{entity_id}",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_tm2_entities(self) -> List[Dict[str, Any]]:
        """Get all TM2 (Traditional Medicine Module 2) entities"""
        # For demo, return mock TM2 data since we don't have real API access
        return [
            {
                "id": "TM2-AY134",
                "title": "Acid dyspepsia (TM2)",
                "definition": "Traditional medicine disorder characterized by sour indigestion",
                "linearization": "tm2",
                "parent": "TM2-AY",
                "synonyms": ["Amlapitta", "Sour indigestion"]
            },
            {
                "id": "TM2-AY999",
                "title": "Vata imbalance (TM2)",
                "definition": "Traditional medicine disorder of vata dosha",
                "linearization": "tm2",
                "parent": "TM2-AY",
                "synonyms": ["Vata Vyadhi", "Vata disorder"]
            },
            {
                "id": "TM2-AY201",
                "title": "Diabetes mellitus (TM2)",
                "definition": "Traditional medicine disorder characterized by excessive urination and sweet urine",
                "linearization": "tm2",
                "parent": "TM2-AY",
                "synonyms": ["Prameha", "Madhumeha", "Diabetes", "Sweet urine disease"]
            },
            {
                "id": "TM2-AY202",
                "title": "Type 1 diabetes (TM2)",
                "definition": "Traditional medicine classification of juvenile diabetes",
                "linearization": "tm2",
                "parent": "TM2-AY201",
                "synonyms": ["Juvenile diabetes", "Insulin-dependent diabetes", "Prameha type 1"]
            },
            {
                "id": "TM2-AY203",
                "title": "Type 2 diabetes (TM2)",
                "definition": "Traditional medicine classification of adult-onset diabetes",
                "linearization": "tm2",
                "parent": "TM2-AY201",
                "synonyms": ["Adult-onset diabetes", "Non-insulin dependent diabetes", "Prameha type 2"]
            },
            {
                "id": "TM2-AY204",
                "title": "Gestational diabetes (TM2)",
                "definition": "Traditional medicine classification of pregnancy-related diabetes",
                "linearization": "tm2",
                "parent": "TM2-AY201",
                "synonyms": ["Pregnancy diabetes", "Gestational prameha", "Maternal diabetes"]
            }
        ]
    
    async def get_biomedicine_entities(self, query: str = "") -> List[Dict[str, Any]]:
        """Get ICD-11 Biomedicine entities"""
        # For demo, return mock biomedicine data
        return [
            {
                "id": "K29.7",
                "title": "Gastritis, unspecified",
                "definition": "Inflammation of the stomach lining",
                "linearization": "mms",
                "parent": "K29",
                "synonyms": ["Gastritis", "Stomach inflammation"]
            },
            {
                "id": "5A11",
                "title": "Type 2 diabetes mellitus",
                "definition": "Diabetes mellitus due to insulin resistance",
                "linearization": "mms",
                "parent": "5A1",
                "synonyms": ["Diabetes", "Prameha"]
            }
        ]
    
    def cache_entity(self, entity_id: str, data: Dict[str, Any]) -> None:
        """Cache entity data locally"""
        cache_file = self.cache_dir / f"{entity_id}.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def get_cached_entity(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Get cached entity data"""
        cache_file = self.cache_dir / f"{entity_id}.json"
        if cache_file.exists():
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None


# Global client instance
who_client = WHOICD11Client()

