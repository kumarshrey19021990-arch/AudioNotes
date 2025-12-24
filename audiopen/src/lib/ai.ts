import fs from "node:fs";
import { z } from "zod";
import OpenAI from "openai";
import { styleSystemPrompt, type NoteStyle } from "@/lib/noteStyles";

const NoteOutSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(600),
  noteMd: z.string().min(1),
  bullets: z.array(z.string().min(1)).max(20).optional().default([]),
  actionItems: z.array(z.string().min(1)).max(20).optional().default([]),
  followUps: z.array(z.string().min(1)).max(10).optional().default([]),
});
export type NoteOut = z.infer<typeof NoteOutSchema>;

function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function transcribeAudio(args: {
  filePath: string;
  mime: string;
}) {
  if (!hasOpenAIKey()) {
    return {
      transcript:
        "Mock transcript (no OPENAI_API_KEY set). Upload an audio file and set OPENAI_API_KEY to enable real transcription.",
      rawTranscript:
        "Mock transcript (no OPENAI_API_KEY set). This is placeholder text.",
      language: "en",
    };
  }

  const client = getClient();
  const file = fs.createReadStream(args.filePath);

  // Works with the OpenAI node SDK v6 (audio transcriptions).
  const out = await client.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
  });

  const text = (out as unknown as { text?: string }).text?.trim() ?? "";
  return {
    transcript: text || "(empty transcript)",
    rawTranscript: text || "(empty transcript)",
    language: "en",
  };
}

export async function generateNoteFromTranscript(args: {
  transcript: string;
  style: NoteStyle;
}): Promise<NoteOut> {
  if (!hasOpenAIKey()) {
    return {
      title: "Mock note (no AI key configured)",
      summary:
        "Set OPENAI_API_KEY to enable transcription + polished notes, titles, action items, and follow-ups.",
      noteMd: `## Note\n\n${args.transcript}\n\n## Next steps\n\n- Configure \`OPENAI_API_KEY\`\n`,
      bullets: ["Mock bullet 1", "Mock bullet 2"],
      actionItems: ["Add OPENAI_API_KEY to .env.local"],
      followUps: [
        "What’s the most important outcome you want from this note?",
        "Is there any key detail that should be emphasized or removed?",
      ],
    };
  }

  const client = getClient();
  const system = [
    styleSystemPrompt(args.style),
    "",
    "Return STRICT JSON only, matching this schema:",
    "{ title: string, summary: string, noteMd: string, bullets?: string[], actionItems?: string[], followUps?: string[] }",
    "",
    "The followUps field is required in spirit (2% change): generate 2-5 short clarification questions if needed.",
  ].join("\n");

  const resp = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Transcript:\n\n${args.transcript}\n`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = resp.choices[0]?.message?.content ?? "{}";
  const parsed = NoteOutSchema.parse(JSON.parse(content));
  return parsed;
}

