# Audiopen Replica (greenfield)

An Audiopen-style app: **record or upload audio → get transcript + a polished note** (plus action items, key points, sharing, export).

**2% change:** each note also includes **follow-up clarification questions** to improve the final output.

## Features

- Record in-browser (MediaRecorder) or upload audio
- AI transcription (OpenAI when `OPENAI_API_KEY` is set; mock fallback otherwise)
- Polished notes in multiple styles (Default / Meeting / Journal / Idea)
- Notes history (stored in SQLite via Prisma; keyed by a cookie)
- Public share links (`/s/:shareId`)
- Copy + export Markdown

## Setup

```bash
cd audiopen
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

- **`DATABASE_URL`**: defaults to SQLite (`file:./dev.db`)
- **`OPENAI_API_KEY`** *(optional)*: enables real transcription + note generation
