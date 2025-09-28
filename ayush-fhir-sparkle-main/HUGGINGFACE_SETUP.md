# Hugging Face Backend Setup Guide

## Step 1: Update API Configuration

### Option A: Environment Variable (Recommended)
Create a `.env.local` file in the frontend root directory:

```bash
# In ayush-fhir-sparkle-main/.env.local
VITE_API_BASE_URL=https://your-username-ayush-fhir.hf.space
```

Replace `your-username-ayush-fhir` with your actual Hugging Face Space name.

### Option B: Direct Configuration
Edit `src/config/api.ts` and update the BASE_URL:

```typescript
const API_BASE_URL = 'https://your-username-ayush-fhir.hf.space';
```

## Step 2: Update All Components

You need to update all components that make API calls. Here's the pattern:

### Before:
```typescript
const response = await fetch(`/search?q=${query}`);
```

### After:
```typescript
import { buildApiUrl, API_CONFIG } from "@/config/api";

const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH}?q=${query}`));
```

## Step 3: Components to Update

Update these files with the new import and API calls:

1. **ModernSearchSection.tsx** ✅ (Already updated)
2. **ModernTranslateSection.tsx**
3. **IntegrationSection.tsx**
4. **FhirProblemSection.tsx**
5. **AuthBundleSection.tsx**
6. **SearchSection.tsx**
7. **TranslateSection.tsx**
8. **CSVIngestSection.tsx**
9. **ModernCSVIngestSection.tsx**
10. **DashboardSection.tsx**

## Step 4: Build and Deploy

```bash
# Build the frontend
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, GitHub Pages, etc.)
```

## Step 5: Test

1. Open your deployed frontend
2. Try searching for "amlapitta"
3. Check browser network tab to ensure API calls go to your Hugging Face URL

## Quick Fix for All Components

If you want to quickly update all components, you can use find/replace:

**Find:** `await fetch(\`/`
**Replace:** `await fetch(buildApiUrl(\`${API_CONFIG.ENDPOINTS.`

Then add the import at the top of each file:
```typescript
import { buildApiUrl, API_CONFIG } from "@/config/api";
```

## Example Hugging Face URLs

- `https://your-username-ayush-fhir.hf.space`
- `https://huggingface.co/spaces/your-username/ayush-fhir`

Make sure your Hugging Face Space is running and accessible before testing the frontend.
