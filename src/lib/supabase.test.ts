import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ auth: {} })) }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); vi.clearAllMocks(); });

describe("account client configuration", () => {
  it("keeps guest-only builds usable without an account backend", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { getSupabase, isSupabaseConfigured } = await import("./supabase");
    expect(isSupabaseConfigured()).toBe(false);
    expect(getSupabase()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
  it("uses the implicit flow expected by cross-device magic links and reuses the client", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://mock.example.invalid");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "mock-anon-key");
    const { getSupabase } = await import("./supabase");
    expect(getSupabase()).toBe(getSupabase());
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith("https://mock.example.invalid", "mock-anon-key", {
      auth: { flowType: "implicit", storage: undefined },
    });
  });
});
