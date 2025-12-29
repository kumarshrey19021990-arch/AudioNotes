import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070A19] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/10" />
          <span className="text-sm font-semibold tracking-wide">Voice Journal</span>
        </div>
        <Link
          href="/app"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#070A19] hover:bg-white/90"
        >
          Open app
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Voice notes that turn <span className="text-white/80">audio to text</span>—fast.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-8 text-white/75">
              Voice Journal is a simple{" "}
              <strong className="font-semibold text-white">voice to text</strong> app for
              capturing thoughts, meetings, and daily reflections. Record voice notes, get a
              transcript, and keep everything searchable.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#5A7BFF] via-[#A855F7] to-[#FF4D9D] px-6 text-sm font-semibold text-white shadow-lg shadow-black/25 hover:opacity-95"
              >
                Start recording
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                See features
              </a>
            </div>

            <dl
              id="features"
              className="mt-10 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:grid-cols-3"
            >
              <div>
                <dt className="text-sm font-semibold">Voice notes</dt>
                <dd className="mt-1 text-sm text-white/70">
                  Capture ideas hands-free with a single tap.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold">Audio to text</dt>
                <dd className="mt-1 text-sm text-white/70">
                  Live dictation with a saved transcript.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold">Voice to text journal</dt>
                <dd className="mt-1 text-sm text-white/70">
                  Keep entries organized and easy to revisit.
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#5A7BFF]/25 via-[#A855F7]/20 to-[#FF4D9D]/20 blur-2xl" />
            <div className="rounded-[2.5rem] border border-white/10 bg-[#0B1020]/70 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/90">Voice Journal</p>
                <p className="text-xs text-white/60">Voice notes • Audio to text</p>
              </div>
              <div className="mt-8 grid place-items-center">
                <div className="grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-[#5A7BFF] via-[#A855F7] to-[#FF4D9D] p-[3px] shadow-xl shadow-black/40">
                  <div className="grid h-full w-full place-items-center rounded-full bg-[#0B1020]">
                    <div className="h-20 w-20 rounded-3xl bg-white/10 ring-1 ring-white/10" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/70">Tap to record your next voice note</p>
              </div>
              <div className="mt-8 grid gap-3">
                {[
                  { title: "Morning Reflection", meta: "Today, 9:44 AM" },
                  { title: "Weekend Recap", meta: "Yesterday" },
                  { title: "Dreams & Thoughts", meta: "Dec 10" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-white/60">{item.meta}</p>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-white/10 ring-1 ring-white/10" />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Link
                  href="/app"
                  className="flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[#070A19] hover:bg-white/90"
                >
                  View all entries
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 border-t border-white/10 pt-10">
          <h2 className="text-lg font-semibold">Built for simplicity</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
            This app focuses on the essentials: recording, voice to text transcription, and a
            clean list of voice notes. It’s responsive on mobile and desktop and optimized for
            SEO with strong on-page copy around audio to text and voice notes.
          </p>
        </section>

        <footer className="mt-12 text-xs text-white/45">
          <p>
            © {new Date().getFullYear()} Voice Journal. Keywords: voice notes, audio to text,
            voice to text.
          </p>
        </footer>
      </main>
    </div>
  );
}
