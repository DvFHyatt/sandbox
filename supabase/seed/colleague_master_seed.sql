-- Minimal starter import from provided Colleague Master.
-- Add the remaining rows via CSV import to table `colleagues` after this baseline seed.

with src(property_code,gid,surname,full_names,id_number,passport_number,date_of_birth,race,gender,job_title,department,operational_division,active_flag,admin_level) as (
  values
  ('CPTRC','4834276','Abrahams','Shameemah','8810210227082',null,'1988-10-21','Coloured','Female','Room Attendant','Housekeeping','Housekeeping','Y','N'),
  ('JOHPJ','4796033','Aidoo','Abeiku',null,'G3505713','1984-09-28','African','Male','Night Auditor','Front Office','Front Office','Y','N'),
  ('NBODO','4788671','Chetty','Neesan','9302255125081',null,'1993-02-25','Indian','Male','HR Director','Human Resources','HR','Y','G'),
  ('JOHPJ','4789758','Gemmell','Mitch','8412215090084',null,'1984-12-21','White','Male','General Manager','Executive','Administration','Y','GM'),
  ('CPTRC','4844546','Lewin','Sasha','9611210133083',null,'1996-11-21','Coloured','Female','HR Coordinator','Human Resources','Administration','Y','P'),
  ('CPTRC','4743566','Prince','Natasha','8206280348082',null,'1982-06-28','Coloured','Female','HR Manager','Human Resources','HR','Y','P'),
  ('JOHPJ','4789369','Ndaba','Gugu','8301101107088',null,'1983-01-10','African','Female','Assistant Human Resources Manager','Human Resources','HR','Y','G'),
  ('NBODO','4789361','Van Flymen','Debi','6912260247085',null,'1969-12-26','White','Female','Director of Culture','Human Resources','HR','Y','G'),
  ('CPTRC','4765069','Shanker','Gallo','7708095131083',null,'1977-08-09','Indian','Male','General Manager','Executive','Administration','Y','GM'),
  ('JOHXR','4523269','Soliman','Atef Guindy Fahmy','7610096004188',null,'1976-10-09','Other','Male','Hotel Manager','Executive','Administration','Y','GM')
),
resolved as (
  select
    p.id as property_id,
    od.id as division_id,
    jt.id as job_title_id,
    s.*
  from src s
  join properties p on p.code = s.property_code
  join operational_divisions od on od.property_id = p.id and lower(od.name) = lower(s.operational_division)
  left join job_titles jt on lower(jt.name) = lower(s.job_title)
),
ins_titles as (
  insert into job_titles(name)
  select distinct job_title from resolved where job_title_id is null
  on conflict (name) do nothing
  returning id, name
),
final_rows as (
  select
    r.property_id,
    r.division_id,
    coalesce(r.job_title_id, jt.id) as job_title_id,
    r.gid,
    split_part(r.full_names,' ',1) as first_name,
    r.surname as last_name,
    r.full_names,
    r.surname,
    r.id_number,
    r.passport_number,
    r.date_of_birth::date,
    r.race,
    r.gender,
    r.department,
    r.operational_division as operational_division_name,
    r.property_code,
    (r.active_flag = 'Y') as active,
    r.admin_level
  from resolved r
  left join job_titles jt on lower(jt.name) = lower(r.job_title)
)
insert into colleagues(
  property_id, division_id, job_title_id, gid,
  first_name, last_name, full_names, surname,
  id_number, passport_number, date_of_birth, race, gender,
  department, operational_division_name, property_code,
  active, admin_level
)
select * from final_rows
on conflict (gid) do update set
  property_id = excluded.property_id,
  division_id = excluded.division_id,
  job_title_id = excluded.job_title_id,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  full_names = excluded.full_names,
  surname = excluded.surname,
  id_number = excluded.id_number,
  passport_number = excluded.passport_number,
  date_of_birth = excluded.date_of_birth,
  race = excluded.race,
  gender = excluded.gender,
  department = excluded.department,
  operational_division_name = excluded.operational_division_name,
  property_code = excluded.property_code,
  active = excluded.active,
  admin_level = excluded.admin_level,
  updated_at = now();
