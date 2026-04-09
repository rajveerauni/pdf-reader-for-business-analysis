# PDF Insight Dashboard

A tool that lets you upload any business PDF and instantly get AI-powered insights on revenue, risks, growth and opportunities


![App Screenshot](Screenshot%202026-04-08%20153010.png).

## Stack

- Frontend: React + Vite + Tailwind CSS + `react-dropzone` + `pdfjs-dist`
- Backend: Node + Express + Groq SDK + Zod validation
- Tests: Vitest (frontend), Node test runner via `tsx` (backend)

## Project Structure

- `frontend` - Upload UX, PDF extraction, and dashboard rendering
- `backend` - Secure API proxy to Groq and schema-normalized response handling

## Setup

1. Install dependencies:
   - `npm install`
   - `npm install --prefix frontend`
   - `npm install --prefix backend`
2. Configure backend env:
   - Copy `backend/.env.example` to `backend/.env`
   - Set `GROQ_API_KEY`
3. Start both services:
   - `npm run dev`

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8787`.

## API Contract

`POST /api/analyze`

Request body:

```json
{
  "text": "Extracted PDF text",
  "fileName": "report.pdf"
}
```

Response body:

```json
{
  "insights": {
    "summary": "string",
    "revenue": ["string"],
    "growth": ["string"],
    "risks": ["string"],
    "opportunities": ["string"],
    "changes": [
      {
        "area": "string",
        "whatChanged": "string",
        "impact": "string"
      }
    ],
    "strengths": ["string"],
    "improvements": ["string"],
    "pros": ["string"],
    "cons": ["string"],
    "actionPlan": ["string"],
    "confidence": 0.0
  }
}
```

`POST /api/qa`

Request body:

```json
{
  "question": "What changed in revenue and why?",
  "chunks": [
    { "id": "p3", "pageNumber": 3, "text": "..." }
  ],
  "fileName": "report.pdf"
}
```

Response body:

```json
{
  "qa": {
    "answer": "string",
    "citations": [
      { "pageNumber": 3, "quote": "string", "reason": "string" }
    ],
    "followUps": ["string"],
    "confidence": 0.0
  }
}
```

## Scripts

- Root:
  - `npm run dev` - run frontend and backend together
  - `npm run build` - build both apps
  - `npm run test` - run frontend and backend tests
- Frontend:
  - `npm run dev --prefix frontend`
  - `npm run lint --prefix frontend`
- Backend:
  - `npm run dev --prefix backend`

## Notes

- Groq key is never exposed to the frontend.
- PDF validation handles unsupported types, oversize files, and low-quality extraction.
- Model output is schema-validated and normalized for resilient UI rendering.
- `.env` files are gitignored at project root to prevent accidental secret commits.
