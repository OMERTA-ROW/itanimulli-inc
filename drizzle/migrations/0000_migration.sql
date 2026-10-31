create type public.app_role as enum ('owner', 'admin', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  role public.app_role not null default 'member' check (role in ('admin', 'member')),
  token_hash text not null unique,
  created_by uuid not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.invitations to authenticated;
grant all on public.invitations to service_role;
alter table public.invitations enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('owner', 'admin'))
$$;

create policy "Read own profile or staff reads all" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "Update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Read own roles or staff reads all" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));

create policy "Staff read invitations" on public.invitations for select to authenticated
  using (public.is_staff(auth.uid()));
create policy "Staff create invitations" on public.invitations for insert to authenticated
  with check (
    public.is_staff(auth.uid()) and created_by = auth.uid()
    and (role = 'member' or public.has_role(auth.uid(), 'owner'))
  );
create policy "Staff revoke invitations" on public.invitations for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- Profiles may only change display_name from the client.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
revoke update on public.invitations from authenticated;
grant update (revoked_at) on public.invitations to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, lower(new.email), nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();