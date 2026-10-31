// Pure authorization rules shared by server functions and tests.
// The server is the only place these decisions are enforced.

export type AppRole = "owner" | "admin" | "member";
export const INVITABLE_ROLES = ["member", "admin"] as const;
export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export const DEFAULT_INVITE_DAYS = 7;
export const MAX_INVITE_DAYS = 30;
export const MIN_PASSWORD_LENGTH = 10;

export type InvitationState = {
  email: string;
  role: AppRole;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
};

export type InvitationCheck = { ok: true } | { ok: false; reason: "not_found" | "revoked" | "used" | "expired" | "bad_role" };

export function checkInvitation(inv: InvitationState | null | undefined, now: Date = new Date()): InvitationCheck {
  if (!inv) return { ok: false, reason: "not_found" };
  if (inv.revoked_at) return { ok: false, reason: "revoked" };
  if (inv.used_at) return { ok: false, reason: "used" };
  if (new Date(inv.expires_at).getTime() <= now.getTime()) return { ok: false, reason: "expired" };
  if (!(INVITABLE_ROLES as readonly string[]).includes(inv.role)) return { ok: false, reason: "bad_role" };
  return { ok: true };
}

export function isStaff(roles: AppRole[]) {
  return roles.includes("owner") || roles.includes("admin");
}

/** Owners may invite members or admins; admins may invite members only. Nobody may invite an owner. */
export function canInvite(actorRoles: AppRole[], role: string): boolean {
  if (!(INVITABLE_ROLES as readonly string[]).includes(role)) return false;
  if (actorRoles.includes("owner")) return true;
  return actorRoles.includes("admin") && role === "member";
}

/** Only the owner changes roles, never their own, never to or from owner. */
export function canSetRole(input: { actorId: string; actorRoles: AppRole[]; targetId: string; targetRoles: AppRole[]; newRole: string }): boolean {
  const { actorId, actorRoles, targetId, targetRoles, newRole } = input;
  if (!actorRoles.includes("owner")) return false;
  if (actorId === targetId) return false;
  if (targetRoles.includes("owner")) return false;
  return (INVITABLE_ROLES as readonly string[]).includes(newRole);
}

/** Owner removes admins/members; admins remove members only; nobody removes self or the owner. */
export function canRemove(input: { actorId: string; actorRoles: AppRole[]; targetId: string; targetRoles: AppRole[] }): boolean {
  const { actorId, actorRoles, targetId, targetRoles } = input;
  if (actorId === targetId) return false;
  if (targetRoles.includes("owner")) return false;
  if (actorRoles.includes("owner")) return true;
  return actorRoles.includes("admin") && !targetRoles.includes("admin");
}

export type OwnerClaimCheck = { ok: true } | { ok: false; reason: "not_configured" | "email_mismatch" | "unverified" | "owner_exists" };

export function checkOwnerClaim(input: {
  configuredOwnerEmail: string | undefined;
  userEmail: string | undefined | null;
  emailConfirmed: boolean;
  existingOwnerIds: string[];
  userId: string;
}): OwnerClaimCheck {
  const configured = input.configuredOwnerEmail?.trim().toLowerCase();
  if (!configured) return { ok: false, reason: "not_configured" };
  if (!input.userEmail || input.userEmail.trim().toLowerCase() !== configured) return { ok: false, reason: "email_mismatch" };
  if (!input.emailConfirmed) return { ok: false, reason: "unverified" };
  if (input.existingOwnerIds.some((id) => id !== input.userId)) return { ok: false, reason: "owner_exists" };
  return { ok: true };
}

/** Only same-origin relative paths are allowed as a post-login destination. */
export function safeRedirect(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.startsWith("/auth")) return fallback;
  return value;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
