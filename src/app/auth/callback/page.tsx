"use client";

/**
 * Landing point for the emailed sign-in link.
 *
 * With the implicit auth flow, Supabase puts the session tokens directly in
 * this URL's hash fragment (#access_token=...) rather than a `?code=` param to
 * exchange — so there is no server round trip to make here. The Supabase
 * client parses that hash itself the moment it initialises (detectSessionInUrl
 * defaults to true), so this page's job is just to wait for that session to
 * appear and then hand off to `AuthProvider` / `ProgressProvider`, which pull
 * the student's history down once they see a signed-in user.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { Button, ButtonLink, Card } from "@/components/ui";

type Phase = "working" | "done" | "error";

const POLL_MS = 200;
const TIMEOUT_MS = 6000;

export default function AuthCallbackPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("working");
  const [message, setMessage] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const supabase = getSupabase();
    if (!supabase) {
      setPhase("error");
      setMessage("This build has no account backend configured.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const described = params.get("error_description");
    if (described) {
      setPhase("error");
      setMessage(described);
      return;
    }

    let cancelled = false;
    void (async () => {
      const deadline = Date.now() + TIMEOUT_MS;
      while (!cancelled) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) setPhase("done");
          return;
        }
        if (Date.now() >= deadline) break;
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      if (!cancelled) {
        setPhase("error");
        setMessage(
          "That link has expired, was already used, or was opened somewhere the session could not be read. Request a fresh one.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => router.replace("/"), 1200);
    return () => clearTimeout(t);
  }, [phase, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center">
      <Card className="w-full">
        {phase === "working" && (
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="shrink-0 animate-spin text-brand" />
            <div>
              <p className="text-[14px] font-bold text-navy">Signing you in…</p>
              <p className="mt-0.5 text-[12.5px] text-navy-soft">
                Pulling down your progress.
              </p>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0 text-go" />
            <div>
              <p className="text-[14px] font-bold text-navy">Signed in</p>
              <p className="mt-0.5 text-[12.5px] text-navy-soft">
                Taking you to your dashboard.
              </p>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-caution" />
              <div>
                <p className="text-[14px] font-bold text-navy">Could not sign you in</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-navy-soft">
                  {message}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/signin" size="md">
                Request a new link
              </ButtonLink>
              <Button variant="ghost" size="md" onClick={() => router.replace("/")}>
                Keep studying without an account
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
