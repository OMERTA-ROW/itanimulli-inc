import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  canInvite,
  canRemove,
  canSetRole,
  checkInvitation,
  checkOwnerClaim,
  DEFAULT_INVITE_DAYS,
  isStaff,
  isValidEmail,
  MAX_INVITE_DAYS,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  type AppRole,
} from "./access-rules";

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type Ctx = { supabase: any; userId: string };

async function rolesOf(supabase: any, userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error("Could not load roles");
  return (data ?? []).map((r: { role: AppRole }) => r.role);
}

async function requireStaff({ supabase, userId }: Ctx) {
  const roles = await rolesOf(supabase, userId);
  if (!isStaff(roles)) throw new Error("Forbidden");
  return roles;
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await rolesOf(context.supabase, context.userId);
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .eq("id", context.userId)
      .maybeSingle();
    return { userId: context.userId, roles, profile, ownerEmailConfigured: Boolean(process.env["OWNER_EMAIL"]) };
  });

export const updateDisplayName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { displayName: string }) => ({ displayName: String(input.displayName ?? "").trim().slice(0, 80) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update({ display_name: data.displayName || null }).eq("id", context.userId);
    if (error) throw new Error("Could not save your name");
    return { ok: true };
  });

export const createInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; role: string; days?: number }) => {
    const email = normalizeEmail(String(input.email ?? ""));
    if (!isValidEmail(email)) throw new Error("Enter a valid email address");
    const days = Math.min(Math.max(Math.round(Number(input.days ?? DEFAULT_INVITE_DAYS)), 1), MAX_INVITE_DAYS);
    return { email, role: String(input.role ?? "member"), days };
  })
  .handler(async ({ data, context }) => {
    const roles = await requireStaff(context);
    if (!canInvite(roles, data.role)) throw new Error("You can't invite someone with that role");
    const token = randomToken();
    const expires = new Date(Date.now() + data.days * 86_400_000).toISOString();
    const { data: row, error } = await context.supabase
      .from("invitations")
      .insert({ email: data.email, role: data.role, token_hash: await sha256Hex(token), created_by: context.userId, expires_at: expires })
      .select("id, email, role, expires_at")
      .single();
    if (error) throw new Error("Could not create the invitation");
    // The raw token is returned once and never stored.
    return { ...row, token };
  });

export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context);
    const { data, error } = await context.supabase
      .from("invitations")
      .select("id, email, role, expires_at, used_at, revoked_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load invitations");
    return data ?? [];
  });

export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const { error } = await context.supabase
      .from("invitations")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("used_at", null)
      .is("revoked_at", null);
    if (error) throw new Error("Could not revoke the invitation");
    return { ok: true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context);
    const [{ data: profiles, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
      context.supabase.from("profiles").select("id, email, display_name, created_at").order("created_at"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (e1 || e2) throw new Error("Could not load members");
    return (profiles ?? []).map((p: any) => ({
      ...p,
      roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role as AppRole),
    }));
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: string }) => ({ userId: String(input.userId), role: String(input.role) }))
  .handler(async ({ data, context }) => {
    const actorRoles = await rolesOf(context.supabase, context.userId);
    const targetRoles = await rolesOf(context.supabase, data.userId);
    if (!canSetRole({ actorId: context.userId, actorRoles, targetId: data.userId, targetRoles, newRole: data.role })) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).in("role", ["admin", "member"]);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role as AppRole });
    if (error) throw new Error("Could not change the role");
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => ({ userId: String(input.userId) }))
  .handler(async ({ data, context }) => {
    const actorRoles = await rolesOf(context.supabase, context.userId);
    const targetRoles = await rolesOf(context.supabase, data.userId);
    if (!canRemove({ actorId: context.userId, actorRoles, targetId: data.userId, targetRoles })) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error("Could not remove the member");
    return { ok: true };
  });

export const claimOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (error || !userData.user) throw new Error("Unauthorized");
    const { data: owners } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "owner");
    const check = checkOwnerClaim({
      configuredOwnerEmail: process.env["OWNER_EMAIL"],
      userEmail: userData.user.email,
      emailConfirmed: Boolean(userData.user.email_confirmed_at),
      existingOwnerIds: (owners ?? []).map((o) => o.user_id),
      userId: context.userId,
    });
    if (!check.ok) return check;
    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "owner" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (insertError) throw new Error("Could not assign owner");
    return check;
  });

// Public: the single-use token is the credential. It never grants owner.
export const previewInvitation = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => ({ token: String(input.token ?? "").slice(0, 200) }))
  .handler(async ({ data }) => {
    if (!data.token) return { ok: false as const, reason: "not_found" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv } = await supabaseAdmin
      .from("invitations")
      .select("email, role, expires_at, used_at, revoked_at")
      .eq("token_hash", await sha256Hex(data.token))
      .maybeSingle();
    const check = checkInvitation(inv);
    if (!check.ok) return check;
    return { ok: true as const, email: inv!.email, role: inv!.role };
  });

export const acceptInvitation = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; password: string; displayName?: string }) => {
    const password = String(input.password ?? "");
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    return { token: String(input.token ?? "").slice(0, 200), password, displayName: String(input.displayName ?? "").trim().slice(0, 80) };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tokenHash = await sha256Hex(data.token);
    const { data: inv } = await supabaseAdmin
      .from("invitations")
      .select("id, email, role, expires_at, used_at, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    const check = checkInvitation(inv);
    if (!check.ok) return check;

    // Atomically claim: only one request can flip used_at from null.
    const { data: claimed } = await supabaseAdmin
      .from("invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", inv!.id)
      .is("used_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .select("id");
    if (!claimed?.length) return { ok: false as const, reason: "used" as const };

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: inv!.email,
      password: data.password,
      // The invitee proves control of the bound address by holding the private link the owner sent them.
      email_confirm: true,
      user_metadata: { display_name: data.displayName },
    });
    if (error || !created.user) {
      await supabaseAdmin.from("invitations").update({ used_at: null }).eq("id", inv!.id);
      return { ok: false as const, reason: "account_exists" as const };
    }
    await supabaseAdmin.from("invitations").update({ used_by: created.user.id }).eq("id", inv!.id);
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: inv!.role });
    return { ok: true as const, email: inv!.email };
  });
