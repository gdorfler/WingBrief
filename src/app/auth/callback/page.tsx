"use client";

/**
 * Landing point for the emailed sign-in link.
 *
 * Supabase sends the student back here with a one-time `code`, which we trade
 * for a session. Once that lands, `AuthProvider` picks it up and
 * `ProgressProvider` swaps to the account-backed store and pulls their history
 * down, so we can send them straight on to studying.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { Button, ButtonLink, Card } from "@/components/ui";

type Phase = "working" | "done" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("working");
  const [message, setMessage] = useState<string | null>(null);
  // React runs effects twice in dev; exchanging a one-time code twice fails.
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

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const described = params.get("error_description");

      if (described) {
        setPhase("error");
        setMessage(described);
        return;
      }

      if (!code) {
        // Already signed in and revisiting the URL is a success, not a failure.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setPhase("done");
          return;
        }
        setPhase("error");
        setMessage("That link is missing its sign-in code. Try requesting a new one.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setPhase("error");
        setMessage(
          /expired|invalid/i.test(error.message)
            ? "That link has expired or was already used. Request a fresh one."
            : error.message,
        );
        return;
      }
      setPhase("done");
    })();
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
