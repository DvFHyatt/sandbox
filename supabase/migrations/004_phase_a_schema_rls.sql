-- Phase A alignment for PRD v1.1
create extension if not exists "pgcrypto";

create table if not exists departments (
  name text primary key,
  created_at timestamptz not null default now()
);

create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  colleague_gid text not null references colleagues(gid),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table training_types
  add column if not exists counts_for_ojt boolean not null default false;

alter table colleagues
  add column if not exists surname text,
  add column if not exists name text,
  add column if not exists date_of_birth date,
  add column if not exists race text,
  add column if not exists gender text,
  add column if not exists department text,
  add column if not exists property_code text,
  add column if not exists admin_level_v2 text,
  add column if not exists active_flag text;

update colleagues c
set
  surname = coalesce(c.surname, c.last_name),
  name = coalesce(c.name, c.first_name),
  property_code = coalesce(c.property_code, p.code),
  admin_level_v2 = coalesce(c.admin_level_v2, case
    when c.admin_level in ('GA','G') then 'SU'
    when c.admin_level = 'P' then 'HR'
    when c.admin_level = 'GM' then 'GM'
    else 'N'
  end),
  active_flag = coalesce(c.active_flag, case when c.active then 'Y' else 'N' end),
  department = coalesce(c.department, (select od.name from operational_divisions od where od.id = c.division_id))
from properties p
where p.id = c.property_id;

alter table colleagues
  alter column surname set not null,
  alter column name set not null,
  alter column property_code set not null,
  alter column department set not null,
  alter column admin_level_v2 set not null,
  alter column active_flag set not null;

alter table colleagues
  add constraint colleagues_admin_level_v2_check
    check (admin_level_v2 in ('N','GM','HR','SU')),
  add constraint colleagues_active_flag_check
    check (active_flag in ('Y','N')),
  add constraint colleagues_race_check
    check (race is null or race in ('African','Coloured','Indian','Other','White')),
  add constraint colleagues_gender_check
    check (gender is null or gender in ('Male','Female')),
  add constraint colleagues_department_fk
    foreign key (department) references departments(name),
  add constraint colleagues_property_code_fk
    foreign key (property_code) references properties(code),
  add constraint colleagues_identity_requirement
    check (nullif(trim(coalesce(id_number, '')), '') is not null or nullif(trim(coalesce(passport_number, '')), '') is not null);

create unique index if not exists idx_user_profiles_colleague_gid on user_profiles(colleague_gid);
create index if not exists idx_colleagues_property_code on colleagues(property_code);
create index if not exists idx_colleagues_department on colleagues(department);

create table if not exists gm_colleague_reporting_view_grants (
  id bigserial primary key,
  granted_at timestamptz not null default now()
);

drop view if exists v_colleagues_reporting_safe;
create view v_colleagues_reporting_safe as
select
  gid,
  surname,
  name,
  job_title_id,
  department,
  property_code,
  admin_level_v2 as admin_level,
  active_flag as active
from colleagues
where deleted_at is null;

alter table user_profiles enable row level security;

drop policy if exists "user_profiles self read" on user_profiles;
create policy "user_profiles self read" on user_profiles
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_profiles su manage" on user_profiles;
create policy "user_profiles su manage" on user_profiles
for all to authenticated
using (
  exists (
    select 1
    from user_profiles up
    join colleagues c on c.gid = up.colleague_gid
    where up.user_id = auth.uid()
      and c.admin_level_v2 = 'SU'
      and c.active_flag = 'Y'
  )
)
with check (
  exists (
    select 1
    from user_profiles up
    join colleagues c on c.gid = up.colleague_gid
    where up.user_id = auth.uid()
      and c.admin_level_v2 = 'SU'
      and c.active_flag = 'Y'
  )
);

drop policy if exists "gm read all sessions" on training_sessions;

drop policy if exists "sessions select by role and property" on training_sessions;
create policy "sessions select by role and property" on training_sessions
for select to authenticated
using (
  exists (
    select 1
    from user_profiles up
    join colleagues c on c.gid = up.colleague_gid
    where up.user_id = auth.uid()
      and c.active_flag = 'Y'
      and (
        c.admin_level_v2 = 'SU'
        or (c.admin_level_v2 = 'HR' and c.property_code = 'NBODO')
        or (c.admin_level_v2 in ('HR','GM') and exists (select 1 from properties p2 where p2.id = training_sessions.property_id and p2.code = c.property_code))
      )
  )
);

-- property scoped inserts for HR, cross-property only for NBODO HR/SU
drop policy if exists "sessions insert by role" on training_sessions;
create policy "sessions insert by role" on training_sessions
for insert to authenticated
with check (
  exists (
    select 1
    from user_profiles up
    join colleagues c on c.gid = up.colleague_gid
    join properties p on p.code = c.property_code
    where up.user_id = auth.uid()
      and c.active_flag = 'Y'
      and (
        c.admin_level_v2 = 'SU'
        or (c.admin_level_v2 = 'HR' and c.property_code = 'NBODO')
        or (c.admin_level_v2 = 'HR' and p.id = training_sessions.property_id)
      )
  )
);
