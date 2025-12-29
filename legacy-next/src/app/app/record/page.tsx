"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Recorder } from "@/components/Recorder";

export default function RecordPage() {
  return (
    <AuthGate>
      <div className="pb-10">
        <div className="mb-4">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <Recorder />
      </div>
    </AuthGate>
  );
}

