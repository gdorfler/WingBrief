import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./minimal.css";
import { AuthProvider } from "@/lib/auth";
import { ProgressProvider } from "@/lib/progress-store";
import { CourseProvider } from "@/lib/course";
import { AppShell } from "@/components/shell";

export const metadata: Metadata = {
  title: {
    default: "WingBrief",
    template: "%s · WingBrief",
  },
  description:
    "A visual, interactive NIFE ground-school trainer for Student Naval Aviators and Naval Flight Officers.",
  applicationName: "WingBrief",
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
   * `data-scroll-behavior` opts in to the smooth scrolling globals.css asks
   * for. Without it Next warns, and a future version will stop suppressing
   * smooth scroll during route transitions on its own.
   */
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>
          <ProgressProvider>
            <CourseProvider>
              <AppShell>{children}</AppShell>
            </CourseProvider>
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
