import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress-store";
import { AppShell } from "@/components/shell";

export const metadata: Metadata = {
  title: {
    default: "WingBrief",
    template: "%s · WingBrief",
  },
  description:
    "A visual, interactive Aerodynamics trainer for Student Naval Aviators and Naval Flight Officers, built from the Naval Aviation Fundamentals trainee guide.",
  applicationName: "WingBrief",
};

export const viewport: Viewport = {
  themeColor: "#0d1c2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ProgressProvider>
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
