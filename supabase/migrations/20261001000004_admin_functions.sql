-- ═══════════════════════════════════════════════════════════════════════
-- Admin dashboard helpers. Each function checks the caller's role itself.
-- ═══════════════════════════════════════════════════════════════════════

-- Aggregate figures for the dashboard (real data only).
create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.is_staff() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'projects',            (select count(*) from projects),
    'projects_published',  (select count(*) from projects where published),
    'gallery',             (select count(*) from gallery),
    'messages_new',        (select count(*) from contact_messages where status = 'new'),
    'enquiries_new',       (select count(*) from partnership_enquiries where status = 'new'),
    'donations',           case when public.is_admin() then (
                              select jsonb_build_object(
                                'completed_count', count(*) filter (where payment_status = 'completed'),
                                'pending_count',   count(*) filter (where payment_status in ('pending', 'pledged')),
                                'totals',          coalesce((
                                  select jsonb_object_agg(currency, total) from (
                                    select currency, sum(amount) as total from donations where payment_status = 'completed' group by currency
                                  ) t), '{}'::jsonb)
                              ) from donations)
                            else null end
  ) into result;
  return result;
end $$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- Admins can promote/demote staff by email (the user must have signed up first).
create or replace function public.admin_set_role(target_email text, new_role public.user_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  update public.profiles set role = new_role where lower(email) = lower(target_email);
  if not found then
    raise exception 'No account found for %', target_email;
  end if;
end $$;

revoke all on function public.admin_set_role(text, public.user_role) from public, anon;
grant execute on function public.admin_set_role(text, public.user_role) to authenticated;
