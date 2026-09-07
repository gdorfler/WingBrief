import { describe, expect, it } from "vitest";
import { displayNameError, normalizeDisplayName, savedDisplayName } from "./display-name";

describe("account display names", () => {
  it("asks new and existing unnamed accounts for a name",()=>{
    expect(savedDisplayName(undefined)).toBe("");
    expect(savedDisplayName({})).toBe("");
    expect(savedDisplayName({display_name:123})).toBe("");
    expect(savedDisplayName({display_name:"   "})).toBe("");
  });
  it("preserves real names and nicknames without guessing from email",()=>{
    for(const name of ["Gavin","José","李 明","O’Neill","A"]) expect(savedDisplayName({display_name:name})).toBe(name);
    expect(savedDisplayName({email:"gavin@example.com"})).toBe("");
  });
  it("normalizes whitespace and rejects blank or excessively long names",()=>{
    expect(normalizeDisplayName("  Mary   Jane  ")).toBe("Mary Jane");
    expect(displayNameError("\t\n")).not.toBeNull();
    expect(displayNameError("A".repeat(49))).not.toBeNull();
    expect(displayNameError("A".repeat(48))).toBeNull();
  });
  it("treats saved presentation metadata as untrusted input",()=>{
    expect(savedDisplayName({display_name:{name:"Gavin"}})).toBe("");
    expect(savedDisplayName({display_name:"X".repeat(49)})).toBe("");
  });
});
