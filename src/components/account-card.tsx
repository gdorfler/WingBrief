"use client";

/**
 * Account status on the profile page.
 *
 * Three states, because accounts are optional: syncing to an email, signed out
 * with everything in this browser, or a build with no backend configured at all.
 */

import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress-store";
import { Button, ButtonLink, Card, SectionHeading } from "@/components/ui";

export function AccountCard() {
  const { user, enabled, ready, signOut } = useAuth();
  const { syncing } = useProgress();

  if (!enabled) {
    return (
      <section className="mb-6">
        <SectionHeading eyebrow="Account" title="Sync" />
        <Card>
          <div className="flex gap-3">
            <CloudOff size={19} className="mt-0.5 shrink-0 text-navy-faint" />
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-navy">
                No sync backend configured
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-navy-soft">
                Progress is saved in this browser only. See the README to turn on
                accounts.
              </p>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <SectionHeading eyebrow="Account" title="Sync" />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            {user ? (
              <Cloud size={19} className="mt-0.5 shrink-0 text-go" />
            ) : (
              <CloudOff size={19} className="mt-0.5 shrink-0 text-caution" />
            )}
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-navy">
                {!ready
                  ? "Checking your session…"
                  : user
                    ? "Syncing to your account"
                    : "Not signed in"}
                {syncing && (
                  <RefreshCw size={13} className="animate-spin text-navy-faint" />
                )}
              </p>
              <p className="mt-1 break-words text-[12.5px] leading-relaxed text-navy-soft">
                {user
                  ? user.email
                  : "Progress lives in this browser. Sign in to carry it to your phone or another laptop."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {user ? (
              <Button variant="secondary" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            ) : (
              <ButtonLink href="/signin" size="sm">
                Sign in
              </ButtonLink>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
