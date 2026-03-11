create extension if not exists "pgcrypto";

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Legacy table kept for compatibility only.
create table if not exists operational_divisions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, name)
);

create table if not exists job_titles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists colleagues (
  id uuid primary key default gen_random_uuid(),
  gid text not null unique,
  first_name text not null,
  last_name text not null,
  email text,
  property_id uuid not null references properties(id),
  division_id uuid references operational_divisions(id), -- legacy compatibility
  department text, -- new canonical field (enforced later in 003/004)
  job_title_id uuid not null references job_titles(id),
  admin_level text not null check (admin_level in ('N','P','G','GA','GM')),
  active boolean not null default true,
  id_number text,
  passport_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint colleague_ident check (id_number is not null or passport_number is not null)
);

create table if not exists training_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists training_sessions (
  id uuid primary key,
  property_id uuid not null references properties(id),
  division_id uuid references operational_divisions(id), -- legacy compatibility
  department text, -- new canonical field (filled by app / later migration)
  training_type_id uuid not null references training_types(id),
  title varchar(90) not null,
  description varchar(256),
  facilitator_gid text,
  facilitator_name text,
  training_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes int generated always as (extract(epoch from (end_time - start_time))/60) stored,
  created_by uuid,
  client_updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  is_deleted boolean not null default false,
  check (start_time < end_time)
);

create table if not exists session_attendees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id),
  colleague_id uuid not null references colleagues(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  is_deleted boolean not null default false,
  unique(session_id, colleague_id)
);

create table if not exists audit_logs (
  id bigserial primary key,
  actor_user_id uuid,
  actor_gid text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists sync_conflicts (
  id bigserial primary key,
  entity_type text not null,
  entity_id uuid not null,
  incoming_data jsonb not null,
  existing_data jsonb not null,
  resolved_with text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_colleagues_property on colleagues(property_id);
create index if not exists idx_colleagues_division on colleagues(division_id);
create index if not exists idx_colleagues_department on colleagues(department);
create index if not exists idx_sessions_property on training_sessions(property_id);
create index if not exists idx_sessions_division on training_sessions(division_id);
create index if not exists idx_sessions_department on training_sessions(department);
create index if not exists idx_sessions_type on training_sessions(training_type_id);
create index if not exists idx_sessions_date on training_sessions(training_date);
create index if not exists idx_attendees_colleague on session_attendees(colleague_id);

alter table properties enable row level security;
alter table operational_divisions enable row level security;
alter table job_titles enable row level security;
alter table colleagues enable row level security;
alter table training_types enable row level security;
alter table training_sessions enable row level security;
alter table session_attendees enable row level security;
alter table audit_logs enable row level security;
alter table sync_conflicts enable row level security;

drop policy if exists "authenticated read masters" on properties;
create policy "authenticated read masters" on properties
for select to authenticated using (true);

drop policy if exists "authenticated read divisions" on operational_divisions;
create policy "authenticated read divisions" on operational_divisions
for select to authenticated using (true);

drop policy if exists "authenticated read job_titles" on job_titles;
create policy "authenticated read job_titles" on job_titles
for select to authenticated using (true);

drop policy if exists "authenticated read types" on training_types;
create policy "authenticated read types" on training_types
for select to authenticated using (deleted_at is null);

drop policy if exists "ga manage training types" on training_types;
create policy "ga manage training types" on training_types for all to authenticated
using (exists (select 1 from colleagues c where c.id = auth.uid() and c.admin_level = 'GA'))
with check (exists (select 1 from colleagues c where c.id = auth.uid() and c.admin_level = 'GA'));

drop policy if exists "gm read all sessions" on training_sessions;
create policy "gm read all sessions" on training_sessions for select to authenticated
using (exists (select 1 from colleagues c where c.id = auth.uid() and c.admin_level in ('GM','G','GA','P','N')));

create or replace function upsert_training_with_attendees(payload jsonb)
returns void
language plpgsql
security definer
as $$
declare
  existing_ts timestamptz;
  incoming_ts timestamptz;
  att text;
  c_id uuid;
begin
  incoming_ts := (payload->>'client_updated_at')::timestamptz;
  select client_updated_at into existing_ts from training_sessions where id = (payload->>'id')::uuid;

  if existing_ts is not null and existing_ts > incoming_ts then
    insert into sync_conflicts(entity_type, entity_id, incoming_data, existing_data, resolved_with)
    select 'training_sessions', (payload->>'id')::uuid, payload, to_jsonb(ts), 'latest_existing'
    from training_sessions ts where ts.id = (payload->>'id')::uuid;
    return;
  end if;

  insert into training_sessions(
    id, property_id, division_id, department, training_type_id, title, description,
    facilitator_gid, facilitator_name, training_date, start_time, end_time, client_updated_at
  )
  values (
    (payload->>'id')::uuid,
    (payload->>'property_id')::uuid,
    nullif(payload->>'division_id','')::uuid,
    nullif(payload->>'department',''),
    (payload->>'training_type_id')::uuid,
    payload->>'title',
    payload->>'description',
    payload->>'facilitator_gid',
    payload->>'facilitator_name',
    (payload->>'training_date')::date,
    (payload->>'start_time')::time,
    (payload->>'end_time')::time,
    incoming_ts
  )
  on conflict (id) do update set
    property_id = excluded.property_id,
    division_id = excluded.division_id,
    department = excluded.department,
    training_type_id = excluded.training_type_id,
    title = excluded.title,
    description = excluded.description,
    facilitator_gid = excluded.facilitator_gid,
    facilitator_name = excluded.facilitator_name,
    training_date = excluded.training_date,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    client_updated_at = excluded.client_updated_at,
    updated_at = now();

  delete from session_attendees where session_id = (payload->>'id')::uuid;

  for att in select jsonb_array_elements_text(payload->'attendees')
  loop
    select id into c_id from colleagues where gid = att and active = true;
    if c_id is not null then
      insert into session_attendees(session_id, colleague_id)
      values ((payload->>'id')::uuid, c_id)
      on conflict(session_id, colleague_id) do nothing;
    end if;
  end loop;

  insert into audit_logs(action, entity_type, entity_id, new_data)
  values ('upsert', 'training_sessions', payload->>'id', payload);
end;
$$;
