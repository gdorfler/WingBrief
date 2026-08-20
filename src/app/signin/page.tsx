"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CloudOff, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress-store";
import { Button, Card, PageHeader } from "@/components/ui";

export default function SignInPage() {
  const { user, enabled, ready, sendLink, signOut } = useAuth();
  const { state } = useProgress();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const message = await sendLink(email);
    if (message) {
      setError(message);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  };

  /* Accounts are optional: this build may simply not have a backend wired up. */
  if (!enabled) {
    return (
      <div className="mx-auto max-w-lg">
        <BackLink />
        <PageHeader
          eyebrow="Account"
          title="Running without an account"
          subtitle="This build has no sync backend configured, so your progress lives in this browser only."
        />
        <Card>
          <div className="flex gap-3">
            <CloudOff size={20} className="mt-0.5 shrink-0 text-navy-faint" />
            <div className="space-y-2 text-[13.5px] leading-relaxed text-navy-soft">
              <p>
                Everything works — lessons, labs, exams and mastery tracking all
                save normally. They just will not follow you to another device.
              </p>
              <p>
                To turn on sync, add a Supabase URL and anon key to{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[12px] font-semibold text-navy">
                  .env.local
                </code>{" "}
                and restart. See the README.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg">
        <BackLink />
        <Card>
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-navy-soft">
            <RefreshCw size={15} className="animate-spin" />
            Checking your session…
          </p>
        </Card>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-lg">
        <BackLink />
        <PageHeader eyebrow="Account" title="You are signed in" subtitle={user.email ?? undefined} />
        <Card>
          <div className="flex gap-3">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-go" />
            <div className="space-y-1">
              <p className="text-[13.5px] font-semibold text-navy">
                Progress is syncing to this account.
              </p>
              <p className="text-[12.5px] leading-relaxed text-navy-soft">
                Sign in with the same email on any device and your{" "}
                {state.attempts.length} answered question
                {state.attempts.length === 1 ? "" : "s"}, mastery levels, streak
                and exam history come with you.
              </p>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
            <p className="mt-2 text-[11.5px] text-navy-faint">
              Signing out leaves your synced progress safely on the server.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-lg">
        <BackLink />
        <PageHeader eyebrow="Check your email" title="Link sent" subtitle={email} />
        <Card>
          <div className="flex gap-3">
            <Mail size={20} className="mt-0.5 shrink-0 text-brand" />
            <div className="space-y-2 text-[13.5px] leading-relaxed text-navy-soft">
              <p>
                Open the link on whichever device you want to study on. It signs
                you in there and pulls down everything you have done so far.
              </p>
              <p className="text-[12.5px] text-navy-faint">
                No email after a minute? Check spam, then try again.
              </p>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <Button variant="ghost" onClick={() => setStatus("idle")}>
              Use a different email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <BackLink />
      <PageHeader
        eyebrow="Account"
        title="Save your progress"
        subtitle="Sign in with your email and your mastery, streak and exam history follow you to any device. No password to remember."
      />

      <Card>
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="email" className="block text-[12.5px] font-bold text-navy">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.mil"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] font-medium text-navy outline-none transition-colors placeholder:text-navy-faint focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {error && (
            <p className="rounded-lg bg-nogo-soft px-3 py-2 text-[12.5px] font-semibold text-nogo">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </form>
      </Card>

      <p className="mt-4 px-1 text-[12px] leading-relaxed text-navy-faint">
        Anything you have already done in this browser is merged into your
        account the first time you sign in — nothing is lost.
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/profile"
      className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-soft transition-colors hover:text-navy"
    >
      <ArrowLeft size={15} />
      Back to profile
    </Link>
  );
}
