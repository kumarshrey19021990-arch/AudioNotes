"use client";

export function WaveBars() {
  const bars = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div
      className="flex h-16 items-end justify-center gap-1.5"
      aria-hidden="true"
    >
      {bars.map((i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-[#FF4D9D] via-[#A855F7] to-[#5A7BFF] opacity-80"
          style={{
            height: `${12 + (i % 7) * 6}px`,
            animation: `wave 1.2s ${i * 0.06}s ease-in-out infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.55);
            opacity: 0.55;
          }
          50% {
            transform: scaleY(1.35);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
}

