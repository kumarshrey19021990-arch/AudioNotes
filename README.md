## Voice Journal (Audio to Text / Voice Notes)

A simple, responsive **voice notes** app that records audio and converts **audio to text** using **OpenAI Whisper**, with storage/auth via **Supabase**.

### Tech
- **Next.js (React)**
- **Supabase** (Auth, Postgres, Storage)
- **OpenAI Whisper** (voice to text transcription)

### Local setup

1) Install deps

```bash
npm install
```

2) Create `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# Optional (helps SEO canonical + OG URLs)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3) Supabase schema

Run `supabase/schema.sql` in the Supabase SQL editor.

4) Supabase Storage bucket

Create a **private** bucket named `audio` in Supabase Storage.

5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`, then go to `/app` to sign in and start recording.

### Whisper transcription
The client records audio in the browser, then sends the audio file to:
- `POST /api/transcribe` (server-side)

That route calls **OpenAI Whisper** (`model: "whisper-1"`) and returns `{ text }`.
