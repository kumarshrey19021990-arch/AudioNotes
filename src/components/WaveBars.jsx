import React from "react";

export function WaveBars() {
  const bars = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }} aria-hidden="true">
      {bars.map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            borderRadius: 999,
            height: 10 + (i % 7) * 5,
            background: "linear-gradient(180deg, #3fa9ff, #a16bff, #ff5f8a)",
            opacity: 0.85,
            animation: `wave 1.2s ${i * 0.06}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.55); opacity: 0.55; }
          50% { transform: scaleY(1.35); opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}

