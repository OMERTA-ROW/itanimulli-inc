import { describe, expect, it } from "vitest";
import { canInvite, canRemove, canSetRole, checkInvitation, checkOwnerClaim, safeRedirect } from "./access-rules";

const now = new Date("2026-10-26T12:00:00Z");
const valid = { email: "a@x.org", role: "member" as const, expires_at: "2026-10-27T12:00:00Z", used_at: null, revoked_at: null };

describe("invitations", () => {
  it("accepts an unused, unexpired, unrevoked invitation", () => expect(checkInvitation(valid, now)).toEqual({ ok: true }));
  it("rejects an expired invitation", () => expect(checkInvitation({ ...valid, expires_at: "2026-10-26T11:59:59Z" }, now)).toEqual({ ok: false, reason: "expired" }));
  it("rejects a reused invitation", () => expect(checkInvitation({ ...valid, used_at: "2026-10-26T10:00:00Z" }, now)).toEqual({ ok: false, reason: "used" }));
  it("rejects a revoked invitation", () => expect(checkInvitation({ ...valid, revoked_at: "2026-10-26T10:00:00Z" }, now)).toEqual({ ok: false, reason: "revoked" }));
  it("rejects an invitation that would grant owner", () => expect(checkInvitation({ ...valid, role: "owner" }, now)).toEqual({ ok: false, reason: "bad_role" }));
  it("rejects a missing invitation", () => expect(checkInvitation(null, now)).toEqual({ ok: false, reason: "not_found" }));
});

describe("who can invite", () => {
  it("nobody can invite an owner", () => expect(canInvite(["owner"], "owner")).toBe(false));
  it("owner can invite admins", () => expect(canInvite(["owner"], "admin")).toBe(true));
  it("admin cannot invite admins", () => expect(canInvite(["admin"], "admin")).toBe(false));
  it("admin can invite members", () => expect(canInvite(["admin"], "member")).toBe(true));
  it("member cannot invite", () => expect(canInvite(["member"], "member")).toBe(false));
});

describe("role changes", () => {
  const base = { actorId: "o", actorRoles: ["owner" as const], targetId: "m", targetRoles: ["member" as const], newRole: "admin" };
  it("owner can promote a member to admin", () => expect(canSetRole(base)).toBe(true));
  it("nobody can grant owner", () => expect(canSetRole({ ...base, newRole: "owner" })).toBe(false));
  it("owner cannot change own role", () => expect(canSetRole({ ...base, targetId: "o" })).toBe(false));
  it("admin cannot promote self or others", () => {
    expect(canSetRole({ ...base, actorId: "a", actorRoles: ["admin"], targetId: "a" })).toBe(false);
    expect(canSetRole({ ...base, actorId: "a", actorRoles: ["admin"] })).toBe(false);
  });
  it("member cannot promote self", () => expect(canSetRole({ ...base, actorId: "m", actorRoles: ["member"] })).toBe(false));
});

describe("removal", () => {
  it("nobody removes the owner", () => expect(canRemove({ actorId: "a", actorRoles: ["admin"], targetId: "o", targetRoles: ["owner"] })).toBe(false));
  it("admin cannot remove another admin", () => expect(canRemove({ actorId: "a", actorRoles: ["admin"], targetId: "b", targetRoles: ["admin"] })).toBe(false));
  it("admin can remove a member", () => expect(canRemove({ actorId: "a", actorRoles: ["admin"], targetId: "m", targetRoles: ["member"] })).toBe(true));
  it("no one removes themselves", () => expect(canRemove({ actorId: "o", actorRoles: ["owner"], targetId: "o", targetRoles: ["owner"] })).toBe(false));
});

describe("owner bootstrap", () => {
  const base = { configuredOwnerEmail: "Owner@X.org", userEmail: "owner@x.org", emailConfirmed: true, existingOwnerIds: [], userId: "u" };
  it("verified configured email may claim owner", () => expect(checkOwnerClaim(base)).toEqual({ ok: true }));
  it("blocked when no owner email is configured", () => expect(checkOwnerClaim({ ...base, configuredOwnerEmail: undefined })).toEqual({ ok: false, reason: "not_configured" }));
  it("blocked for a different email", () => expect(checkOwnerClaim({ ...base, userEmail: "else@x.org" })).toEqual({ ok: false, reason: "email_mismatch" }));
  it("blocked when email is unverified", () => expect(checkOwnerClaim({ ...base, emailConfirmed: false })).toEqual({ ok: false, reason: "unverified" }));
  it("blocked when another owner already exists", () => expect(checkOwnerClaim({ ...base, existingOwnerIds: ["z"] })).toEqual({ ok: false, reason: "owner_exists" }));
});

describe("return-to after login", () => {
  it("keeps same-site paths", () => expect(safeRedirect("/admin/members")).toBe("/admin/members"));
  it("drops external URLs", () => {
    expect(safeRedirect("https://evil.example")).toBe("/dashboard");
    expect(safeRedirect("//evil.example")).toBe("/dashboard");
  });
});
