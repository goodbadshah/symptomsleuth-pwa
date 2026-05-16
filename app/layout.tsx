import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./providers";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import MurmurationBackground from "@/components/ui/MurmurationBackground";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SymptomSleuth - Chronic Symptom Logger",
  description:
    "Log daily symptoms in under 10 seconds. See your patterns. Talk to your doctor with data.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SymptomSleuth",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2D6A4F" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1b18" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/symptomsleuth-icon-194.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/symptomsleuth-icon-194.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/symptomsleuth-icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SymptomSleuth" />
      </head>
      <body className="antialiased">
        <MurmurationBackground />
        <ServiceWorkerRegister />
        <div className="relative z-10 flex flex-col min-h-screen">
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
