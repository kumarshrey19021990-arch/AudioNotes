import { NewNoteForm } from "@/components/new-note-form";

export default function NewPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">New note</h1>
      <NewNoteForm />
    </div>
  );
}

