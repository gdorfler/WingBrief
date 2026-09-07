"use client";
import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { displayNameError } from "@/lib/display-name";
import { Aviator } from "./flight-world";
import { Button } from "./ui";

export function NameForm({ onSaved }: { onSaved?: () => void }) {
  const { displayName, saveDisplayName } = useAuth();
  const [name, setName] = useState(displayName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    const invalid = displayNameError(name);
    if (invalid) { setError(invalid); input.current?.focus(); return; }
    inFlight.current = true; setSaving(true); setSaved(false); setError(null);
    const message = await saveDisplayName(name);
    inFlight.current = false; setSaving(false);
    if (message) { setError(message); input.current?.focus(); return; }
    setSaved(true); onSaved?.();
  };
  return <form onSubmit={submit} className="space-y-4" noValidate>
    <label htmlFor="preferred-name" className="block text-sm font-bold">What should we call you?</label>
    <input ref={input} id="preferred-name" name="given-name" autoComplete="given-name" value={name} onChange={e=>{setName(e.target.value);setError(null);setSaved(false);}} required aria-invalid={Boolean(error)} aria-describedby={error ? "name-error" : "name-help"} className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base focus-visible:outline-brand" placeholder="Your name" disabled={saving}/>
    <p id="name-help" className="text-sm text-navy-soft">A first name or nickname is perfect. You can change it in your profile.</p>
    {error && <p id="name-error" role="alert" className="text-sm text-nogo">{error}</p>}
    <Button type="submit" size="lg" fullWidth disabled={saving}>{saving ? "Saving your name…" : displayName ? "Save name" : "Let’s fly"}</Button>
    {saved && <p role="status" className="text-sm text-go-dark">Name saved.</p>}
  </form>;
}

export function NameOnboarding() {
  return <main className="name-welcome"><div className="name-welcome-art"><Aviator/></div><section className="w-full max-w-md"><p className="flight-eyebrow">WELCOME TO WINGBRIEF</p><h1 className="mb-3 mt-3 text-4xl font-extrabold tracking-tight">Let’s make this<br/>your flight.</h1><p className="mb-7 text-base leading-relaxed text-navy-soft">Your progress has a home. Now let’s put a name to it.</p><NameForm/></section></main>;
}
