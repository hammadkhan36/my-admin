-- Apply to the intended admin database before deploying the matching code.
begin;
alter table public.business_settings add column if not exists timezone text not null default 'UTC';
alter table public.business_hours add column if not exists break_starts_at time;
alter table public.business_hours add column if not exists break_ends_at time;
alter table public.business_hours drop constraint if exists business_hours_break_window_check;
alter table public.business_hours add constraint business_hours_break_window_check check (
 (break_starts_at is null and break_ends_at is null)
 or (not is_closed and not is_24h and opens_at is not null and closes_at is not null
 and break_starts_at is not null and break_ends_at is not null
 and opens_at < break_starts_at and break_starts_at < break_ends_at and break_ends_at < closes_at)
);
commit;
