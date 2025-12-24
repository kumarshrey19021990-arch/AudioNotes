import { z } from "zod";

export const NoteStyleSchema = z.enum(["DEFAULT", "MEETING", "JOURNAL", "IDEA"]);
export type NoteStyle = z.infer<typeof NoteStyleSchema>;

export const NOTE_STYLE_LABEL: Record<NoteStyle, string> = {
  DEFAULT: "Default",
  MEETING: "Meeting",
  JOURNAL: "Journal",
  IDEA: "Idea",
};

export function styleSystemPrompt(style: NoteStyle): string {
  switch (style) {
    case "MEETING":
      return [
        "You turn a raw transcript into crisp meeting notes.",
        "Be structured: context, attendees (if mentioned), key points, decisions, action items.",
        "Prefer bullets, be concise, keep names as spoken.",
      ].join("\n");
    case "JOURNAL":
      return [
        "You turn a raw transcript into a reflective journal entry.",
        "Keep the author's voice, but fix clarity and flow.",
        "End with 1-3 gentle takeaways.",
      ].join("\n");
    case "IDEA":
      return [
        "You turn a raw transcript into an idea brief.",
        "Include: what it is, why it matters, how it works, risks, next steps.",
        "Be punchy and readable.",
      ].join("\n");
    default:
      return [
        "You turn a raw transcript into a polished note.",
        "Be clear, readable, lightly structured with headings and bullets where helpful.",
      ].join("\n");
  }
}

