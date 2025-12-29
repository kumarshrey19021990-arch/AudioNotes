## Voice Journal (React + Supabase + Whisper)

A simple **voice notes** app that records audio and converts **audio to text** using **OpenAI Whisper**, with **Supabase** for Auth + Storage + Postgres.

### Requirements
- A Supabase project
- An OpenAI API key (for Whisper transcription)

### Environment variables
Create `.env.local`:

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Server (Whisper)
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

### Supabase setup
1) Run `supabase/schema.sql` in the Supabase SQL editor.
2) Create a **private** Storage bucket named `audio`.

### Run locally

```bash
npm install
npm run dev
```

This starts:
- Vite (React) at `http://localhost:5173`
- Node API server at `http://localhost:8787`

The React app proxies `/api/*` to the server during development.

### Whisper transcription
The client records audio in the browser and sends it to:
- `POST /api/transcribe` (server)

The server calls OpenAI Whisper (`model: whisper-1`) and returns `{ text }`.
