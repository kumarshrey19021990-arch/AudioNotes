import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Voice Journal",
  title: {
    default: "Voice Journal — Audio to Text Voice Notes",
    template: "%s — Voice Journal",
  },
  description:
    "Record voice notes and instantly turn audio to text. A simple voice to text journal powered by React and Supabase.",
  keywords: [
    "voice notes",
    "audio to text",
    "voice to text",
    "speech to text",
    "voice journal",
    "dictation",
    "transcription",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Voice Journal — Audio to Text Voice Notes",
    description:
      "Capture voice notes and convert audio to text in seconds. A clean, responsive voice to text journal.",
    url: "/",
    siteName: "Voice Journal",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Voice Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice Journal — Audio to Text Voice Notes",
    description:
      "Capture voice notes and convert audio to text in seconds. A clean, responsive voice to text journal.",
    images: ["/og.svg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Voice Journal",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              description:
                "Record voice notes and convert audio to text with a simple voice to text journal.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              keywords:
                "voice notes, audio to text, voice to text, speech to text, transcription",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
