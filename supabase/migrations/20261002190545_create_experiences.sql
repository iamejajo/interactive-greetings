-- V1 schema: one row per shareable experience (a Valentine surprise today,
-- other occasions later — distinguished by `type`).

create table public.experiences (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null,
  type           text not null,
  sender_name    text not null,
  recipient_name text not null,
  message        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint experiences_slug_key unique (slug),
  constraint experiences_slug_format check (slug ~ '^[A-Za-z0-9]{6,16}$'),
  -- Adding a new experience type = a migration that widens this list.
  constraint experiences_type_check check (type in ('valentine')),
  constraint experiences_sender_name_length check (char_length(sender_name) between 1 and 50),
  constraint experiences_recipient_name_length check (char_length(recipient_name) between 1 and 50),
  constraint experiences_message_length check (message is null or char_length(message) between 1 and 500)
);

comment on table public.experiences is 'Shareable interactive experiences, addressed publicly by slug.';

-- Keep updated_at honest on every update.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger experiences_set_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

-- Access: the browser never talks to this table. Only the server, using the
-- service role, reads and writes it. RLS stays on with no policies, so the
-- anon/authenticated roles get nothing even if grants are added by mistake.
alter table public.experiences enable row level security;

revoke all on table public.experiences from anon, authenticated;
grant select, insert, delete on table public.experiences to service_role;
