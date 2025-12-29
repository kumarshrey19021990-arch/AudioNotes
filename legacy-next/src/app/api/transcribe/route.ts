import OpenAI from "openai";

export const runtime = "nodejs";

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : "Unknown error";
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Missing OPENAI_API_KEY on the server." },
      { status: 500 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return Response.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing audio file field: file" }, { status: 400 });
  }

  // Optional hint for language. Default is auto-detect.
  const langValue = form.get("language");
  const language = typeof langValue === "string" ? langValue : undefined;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcript = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language,
      response_format: "json",
    });

    return Response.json({ text: transcript.text ?? "" });
  } catch (e: unknown) {
    return Response.json({ error: errorMessage(e) }, { status: 500 });
  }
}

