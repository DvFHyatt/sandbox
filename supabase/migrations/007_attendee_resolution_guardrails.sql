-- Strengthen attendee resolution and fail sync if no selected attendees can be resolved
create or replace function public.upsert_training_with_attendees(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_ts timestamptz;
  incoming_ts timestamptz;
  actor_role text;
  actor_property_code text;
  target_property_code text;
  capture_date date;
  start_t time;
  end_t time;
  duration_minutes integer;
  attendee_entry jsonb;
  attendee_token text;
  first_unresolved_token text;
  resolved_colleague_id uuid;
  requested_attendee_count integer := 0;
  inserted_attendee_count integer := 0;
begin
  select c.role, c.property_code
  into actor_role, actor_property_code
  from user_profiles up
  join colleagues c on c.id = up.colleague_id
  where up.user_id = auth.uid()
    and upper(trim(c.active_flag)) = 'Y';

  if actor_role is null then
    raise exception 'Unauthorized capture user';
  end if;

  if actor_role in ('GM', 'C') then
    raise exception 'Role % cannot capture training', actor_role;
  end if;

  select p.code into target_property_code
  from properties p
  where p.id = (payload->>'property_id')::uuid;

  if target_property_code is null then
    raise exception 'Invalid property';
  end if;

  if actor_role = 'HR' and actor_property_code <> 'NBODO' and target_property_code <> actor_property_code then
    raise exception 'HR can only capture for assigned property';
  end if;

  capture_date := (payload->>'training_date')::date;
  if capture_date > current_date then
    raise exception 'Training date cannot be in the future';
  end if;

  if actor_role = 'HR' and capture_date < (current_date - 7) then
    raise exception 'HR can only capture within the last 7 calendar days';
  end if;

  start_t := (payload->>'start_time')::time;
  end_t := (payload->>'end_time')::time;

  if end_t <= start_t then
    raise exception 'End time must be after start time';
  end if;

  duration_minutes := floor(extract(epoch from (end_t - start_t)) / 60);
  if duration_minutes < 10 then
    raise exception 'Session duration must be at least 10 minutes';
  end if;

  incoming_ts := (payload->>'client_updated_at')::timestamptz;
  select client_updated_at into existing_ts from training_sessions where id = (payload->>'id')::uuid;

  if existing_ts is not null and existing_ts > incoming_ts then
    insert into sync_conflicts(entity_type, entity_id, incoming_data, existing_data, resolved_with)
    select 'training_sessions', (payload->>'id')::uuid, payload, to_jsonb(ts), 'latest_existing'
    from training_sessions ts where ts.id = (payload->>'id')::uuid;
    return;
  end if;

  insert into training_sessions(
    id, property_id, department, training_type_id, title, description,
    facilitator_name, training_date, start_time, end_time, client_updated_at
  )
  values (
    (payload->>'id')::uuid,
    (payload->>'property_id')::uuid,
    nullif(payload->>'department',''),
    (payload->>'training_type_id')::uuid,
    payload->>'title',
    payload->>'description',
    payload->>'facilitator_name',
    capture_date,
    start_t,
    end_t,
    incoming_ts
  )
  on conflict (id) do update set
    property_id = excluded.property_id,
    department = excluded.department,
    training_type_id = excluded.training_type_id,
    title = excluded.title,
    description = excluded.description,
    facilitator_name = excluded.facilitator_name,
    training_date = excluded.training_date,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    client_updated_at = excluded.client_updated_at,
    updated_at = now();

  delete from session_attendees where session_id = (payload->>'id')::uuid;

  for attendee_entry in select value from jsonb_array_elements(coalesce(payload->'attendees', '[]'::jsonb))
  loop
    attendee_token := null;
    resolved_colleague_id := null;
    requested_attendee_count := requested_attendee_count + 1;

    if jsonb_typeof(attendee_entry) = 'string' then
      attendee_token := trim(both '"' from attendee_entry::text);
    elsif jsonb_typeof(attendee_entry) = 'object' then
      attendee_token := coalesce(
        attendee_entry->>'id',
        attendee_entry->>'colleague_id',
        attendee_entry->>'gid'
      );
    end if;

    if attendee_token is null or attendee_token = '' then
      if first_unresolved_token is null then
        first_unresolved_token := '[empty]';
      end if;
      continue;
    end if;

    select c.id
    into resolved_colleague_id
    from colleagues c
    where upper(trim(c.active_flag)) = 'Y'
      and (c.id::text = attendee_token or c.gid = attendee_token)
    limit 1;

    if resolved_colleague_id is null then
      if first_unresolved_token is null then
        first_unresolved_token := attendee_token;
      end if;
      continue;
    end if;

    insert into session_attendees(session_id, colleague_id)
    values ((payload->>'id')::uuid, resolved_colleague_id)
    on conflict(session_id, colleague_id, attendance_role) do nothing;

    inserted_attendee_count := inserted_attendee_count + 1;
  end loop;

  if requested_attendee_count > 0 and inserted_attendee_count = 0 then
    raise exception 'No attendees could be resolved. First unresolved identifier: %', coalesce(first_unresolved_token, '[unknown]');
  end if;

  insert into audit_logs(action, entity_type, entity_id, new_data)
  values ('upsert', 'training_sessions', payload->>'id', payload);
end;
$$;