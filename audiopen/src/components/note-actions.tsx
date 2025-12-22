"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Link as LinkIcon, Globe2 } from "lucide-react";

export function NoteActions({
  noteId,
  noteTitle,
  markdown,
  isPublic,
  shareId,
}: {
  noteId: string;
  noteTitle: string | null;
  markdown: string | null;
  isPublic: boolean;
  shareId: string | null;
}) {
  const [busy, setBusy] = React.useState(false);
  const [origin, setOrigin] = React.useState<string>("");
  const [publicState, setPublicState] = React.useState<{
    isPublic: boolean;
    shareId: string | null;
  }>({ isPublic, shareId });

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function downloadMarkdown() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(noteTitle || "note").replaceAll(/[^\w.-]+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function togglePublic(next: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/public`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      const json = (await res.json()) as
        | { isPublic: boolean; shareId: string | null }
        | { error: string };
      if (!res.ok) throw new Error("error" in json ? json.error : "Failed.");
      setPublicState(json as { isPublic: boolean; shareId: string | null });
    } finally {
      setBusy(false);
    }
  }

  const shareUrl =
    publicState.isPublic && publicState.shareId
      ? `${origin}/s/${publicState.shareId}`
      : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => markdown && copyText(markdown)}
        disabled={!markdown}
        title="Copy note as Markdown"
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>
      <Button
        variant="secondary"
        onClick={downloadMarkdown}
        disabled={!markdown}
        title="Download Markdown"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button
        variant={publicState.isPublic ? "primary" : "secondary"}
        onClick={() => togglePublic(!publicState.isPublic)}
        disabled={busy}
        title="Toggle public share link"
      >
        <Globe2 className="h-4 w-4" />
        {publicState.isPublic ? "Public" : "Private"}
      </Button>
      {shareUrl ? (
        <Button
          variant="ghost"
          onClick={() => copyText(shareUrl)}
          title="Copy share link"
        >
          <LinkIcon className="h-4 w-4" />
          Copy link
        </Button>
      ) : null}
    </div>
  );
}

