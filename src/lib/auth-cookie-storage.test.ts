import { describe, expect, it } from "vitest";
import { parseCookieHeader, stringToBase64URL } from "@supabase/ssr";
import { createAuthCookieStorage } from "./auth-cookie-storage";

function setup(initial: Record<string, string> = {}) {
  const jar = new Map(Object.entries(initial));
  const writes: string[] = [];
  const storage = createAuthCookieStorage(
    () => [...jar].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("; "),
    cookie => {
      writes.push(cookie);
      const { name, value } = parseCookieHeader(cookie.split(";")[0])[0];
      if (cookie.includes("Max-Age=0")) jar.delete(name); else jar.set(name, value);
    },
    true,
  );
  return { storage, jar, writes };
}

describe("auth cookie compatibility", () => {
  it("reads existing Supabase encoded and legacy raw cookies", async () => {
    const value = JSON.stringify({ user: { user_metadata: { display_name: "José" } } });
    for (const encoded of [value, `base64-${stringToBase64URL(value)}`]) {
      expect(await setup({ session: encoded }).storage.getItem("session")).toBe(value);
    }
  });
  it("round-trips unicode sessions across cookie chunks and clears old chunks", async () => {
    const { storage, jar, writes } = setup();
    const large = JSON.stringify({ name: "李".repeat(3000) });
    await storage.setItem("session", large);
    expect(jar.size).toBeGreaterThan(1);
    expect(await storage.getItem("session")).toBe(large);
    await storage.setItem("session", JSON.stringify({ name: "Gavin" }));
    expect(jar.size).toBe(1);
    expect(writes.every(value => value.includes("Secure") && value.includes("SameSite=Lax"))).toBe(true);
  });
  it("signs out without removing unrelated cookies", async () => {
    const { storage, jar } = setup({ unrelated: "keep" });
    await storage.setItem("session", JSON.stringify({ token: "mock" }));
    await storage.removeItem("session");
    expect(await storage.getItem("session")).toBeNull();
    expect(jar.get("unrelated")).toBe("keep");
  });
  it("rejects malformed or partial cookies", async () => {
    expect(await setup({ session: "base64-invalid" }).storage.getItem("session")).toBeNull();
    expect(await setup({ "session.0": "{\"truncated\":" }).storage.getItem("session")).toBeNull();
  });
});
