create or replace function public.expected_target(range_start date, range_end date)
returns integer
language plpgsql
immutable
as $$
declare
  s date := range_start;
  e date := range_end;
  cursor_date date;
  month_end date;
  overlap_days integer;
  expected numeric := 0;
begin
  if e < s then
    raise exception 'Invalid range';
  end if;

  cursor_date := s;
  while cursor_date <= e loop
    month_end := (date_trunc('month', cursor_date) + interval '1 month - 1 day')::date;
    if month_end > e then month_end := e; end if;

    overlap_days := (month_end - cursor_date) + 1;
    expected := expected + (20::numeric * overlap_days::numeric)
      / extract(day from (date_trunc('month', cursor_date) + interval '1 month - 1 day'));

    cursor_date := (date_trunc('month', cursor_date) + interval '1 month')::date;
  end loop;

  return ceil(expected);
end;
$$;

create or replace view public.v_colleague_ojt_days as
select
  sa.colleague_id,
  ts.property_id,
  ts.division_id,
  ts.training_date,
  count(*) filter (where tt.code = 'OJT') as ojt_events,
  max(ts.duration_minutes) as max_duration_minutes
from session_attendees sa
join training_sessions ts on ts.id = sa.session_id and ts.is_deleted = false
join training_types tt on tt.id = ts.training_type_id and tt.deleted_at is null
where sa.is_deleted = false
group by sa.colleague_id, ts.property_id, ts.division_id, ts.training_date;

create or replace function public.colleague_report(
  in_property_id uuid,
  in_division_id uuid,
  in_colleague_id uuid,
  in_start date,
  in_end date
)
returns table(
  training_date date,
  duration_minutes integer,
  training_type text,
  title text,
  total_duration_minutes bigint,
  ojt_days bigint,
  target_days integer,
  compliant boolean
)
language sql
stable
as $$
with rows as (
  select
    ts.training_date,
    ts.duration_minutes,
    tt.name as training_type,
    ts.title
  from training_sessions ts
  join session_attendees sa on sa.session_id = ts.id and sa.is_deleted = false
  join training_types tt on tt.id = ts.training_type_id
  where ts.is_deleted = false
    and sa.colleague_id = in_colleague_id
    and ts.property_id = in_property_id
    and ts.division_id = in_division_id
    and ts.training_date between in_start and in_end
), summary as (
  select
    coalesce(sum(duration_minutes),0) as total_duration_minutes,
    coalesce(count(distinct training_date) filter (where training_type = 'On-the-Job Training'),0) as ojt_days,
    public.expected_target(in_start, in_end) as target_days
  from rows
)
select
  r.training_date,
  r.duration_minutes,
  r.training_type,
  r.title,
  s.total_duration_minutes,
  s.ojt_days,
  s.target_days,
  (s.ojt_days >= s.target_days) as compliant
from rows r
cross join summary s
order by r.training_date;
$$;

create policy "capture sessions by P/G/GA" on training_sessions for insert to authenticated
with check (exists (
  select 1 from colleagues c
  where c.id = auth.uid()
    and c.admin_level in ('P','G','GA')
));

create policy "manage colleagues by P/G/GA" on colleagues for update to authenticated
using (exists (
  select 1 from colleagues c where c.id = auth.uid() and c.admin_level in ('P','G','GA')
));
