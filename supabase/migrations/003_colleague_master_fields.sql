alter table colleagues
  add column if not exists full_names text,
  add column if not exists surname text,
  add column if not exists date_of_birth date,
  add column if not exists race text,
  add column if not exists gender text,
  add column if not exists department text,
  add column if not exists property_code text;

-- Keep legacy column only for backward compatibility.
alter table colleagues
  add column if not exists operational_division_name text;

update colleagues
set
  full_names = coalesce(full_names, first_name),
  surname = coalesce(surname, last_name),
  property_code = coalesce(property_code, (select p.code from properties p where p.id = colleagues.property_id)),
  department = coalesce(department, operational_division_name, (select od.name from operational_divisions od where od.id = colleagues.division_id)),
  operational_division_name = coalesce(operational_division_name, (select od.name from operational_divisions od where od.id = colleagues.division_id));

create index if not exists idx_colleagues_property_code on colleagues(property_code);
create index if not exists idx_colleagues_active on colleagues(active);
create index if not exists idx_colleagues_admin_level on colleagues(admin_level);
create index if not exists idx_colleagues_department on colleagues(department);

create or replace view public.v_colleague_master as
select
  c.id,
  c.property_code as property,
  c.gid,
  c.surname,
  c.full_names,
  c.id_number,
  c.passport_number,
  c.date_of_birth,
  c.race,
  c.gender,
  jt.name as job_title,
  c.department,
  case when c.active then 'Y' else 'N' end as active,
  c.admin_level
from colleagues c
left join job_titles jt on jt.id = c.job_title_id
where c.deleted_at is null;
