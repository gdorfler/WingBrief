/** Names are presentation data, never an authorization claim. */
export function normalizeDisplayName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/gu, " ").trim();
}

export function displayNameError(value: unknown): string | null {
  const name = normalizeDisplayName(value);
  if (!name) return "Please enter the name you’d like us to use.";
  if (Array.from(name).length > 48) return "Please use a name of 48 characters or fewer.";
  return null;
}

export function savedDisplayName(metadata: Record<string, unknown> | undefined): string {
  const name = normalizeDisplayName(metadata?.display_name);
  return displayNameError(name) ? "" : name;
}
