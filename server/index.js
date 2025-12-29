import cors from "cors";
import express from "express";
import multer from "multer";
import OpenAI from "openai";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(
  cors({
    origin: true,
    credentials: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: "Missing OPENAI_API_KEY on the server." });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "Missing audio file field: file" });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // OpenAI SDK expects a File-like object (in Node 18+ it's available)
    const audioFile = new File([file.buffer], file.originalname || "voice-note.webm", {
      type: file.mimetype || "audio/webm",
    });

    const transcript = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "json",
    });

    res.json({ text: transcript.text ?? "" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Transcription failed.";
    res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});

