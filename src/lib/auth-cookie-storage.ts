import {
  combineChunks, createChunks, DEFAULT_COOKIE_OPTIONS, isChunkLike,
  parseCookieHeader, serializeCookieHeader, stringFromBase64URL, stringToBase64URL,
} from "@supabase/ssr";
import type { SupportedStorage } from "@supabase/supabase-js";

/** Keep the existing SSR cookie format without its forced PKCE auth flow. */
export function createAuthCookieStorage(
  read: () => string,
  write: (cookie: string) => void,
  secure: boolean,
): SupportedStorage {
  const cookies = () => parseCookieHeader(read());
  const put = (name: string, value: string, maxAge = DEFAULT_COOKIE_OPTIONS.maxAge) => {
    write(serializeCookieHeader(name, value, { ...DEFAULT_COOKIE_OPTIONS, secure, maxAge }));
  };
  return {
    async getItem(key) {
      const entries = cookies();
      const raw = await combineChunks(key, name => entries.find(c => c.name === name)?.value);
      if (!raw) return null;
      try {
        const decoded = raw.startsWith("base64-") ? stringFromBase64URL(raw.slice(7)) : raw;
        JSON.parse(decoded);
        return decoded;
      } catch { return null; }
    },
    setItem(key, value) {
      const chunks = createChunks(key, `base64-${stringToBase64URL(value)}`);
      const names = new Set(chunks.map(c => c.name));
      for (const cookie of cookies()) {
        if (isChunkLike(cookie.name, key) && !names.has(cookie.name)) put(cookie.name, "", 0);
      }
      for (const chunk of chunks) put(chunk.name, chunk.value);
    },
    removeItem(key) {
      for (const cookie of cookies()) if (isChunkLike(cookie.name, key)) put(cookie.name, "", 0);
    },
  };
}
