-- ============================================================
-- Row Level Security — Galaxy Star Angkor Hotel
-- Enforces: Admin/Manager full access, Receptionist operational
-- access but no deletes, no editing received_by on payments.
-- ============================================================

alter table staff enable row level security;
alter table room_categories enable row level security;
alter table rooms enable row level security;
alter table guests enable row level security;
alter table reservations enable row level security;
alter table payments enable row level security;
alter table activity_logs enable row level security;
alter table shift_handover_notes enable row level security;
alter table hotel_settings enable row level security;

-- Helper: is the current user Admin or Manager?
create or replace function is_admin_or_manager()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from staff
    where staff.id = auth.uid()
    and staff.role in ('ADMIN', 'MANAGER')
  );
$$;

-- ---------- STAFF ----------
create policy "staff view all staff" on staff
  for select using (auth.role() = 'authenticated');
create policy "staff update own profile" on staff
  for update using (auth.uid() = id);
create policy "admin manage staff" on staff
  for insert with check (is_admin_or_manager());
create policy "admin delete staff" on staff
  for delete using (is_admin_or_manager());

-- ---------- ROOM CATEGORIES ----------
create policy "staff view categories" on room_categories
  for select using (auth.role() = 'authenticated');
create policy "admin manage categories" on room_categories
  for all using (is_admin_or_manager()) with check (is_admin_or_manager());

-- ---------- ROOMS ----------
create policy "staff view rooms" on rooms
  for select using (auth.role() = 'authenticated');
create policy "staff update room status" on rooms
  for update using (auth.role() = 'authenticated');
create policy "admin manage rooms" on rooms
  for insert with check (is_admin_or_manager());
create policy "admin delete rooms" on rooms
  for delete using (is_admin_or_manager());

-- ---------- GUESTS ----------
create policy "staff view guests" on guests
  for select using (auth.role() = 'authenticated');
create policy "staff create guests" on guests
  for insert with check (auth.role() = 'authenticated');
create policy "staff update guests" on guests
  for update using (auth.role() = 'authenticated');
create policy "admin delete guests" on guests
  for delete using (is_admin_or_manager());

-- ---------- RESERVATIONS ----------
create policy "staff view reservations" on reservations
  for select using (auth.role() = 'authenticated');
create policy "staff create reservations" on reservations
  for insert with check (auth.role() = 'authenticated');
create policy "staff update reservations" on reservations
  for update using (auth.role() = 'authenticated');
create policy "admin cancel delete reservations" on reservations
  for delete using (is_admin_or_manager());

-- ---------- PAYMENTS ----------
-- Any staff can record a payment, but received_by must equal their own uid
-- (mirrors the spec: receptionists cannot set/alter this field themselves)
create policy "staff record payments" on payments
  for insert with check (
    auth.role() = 'authenticated'
    and received_by = auth.uid()
  );
create policy "staff view payments" on payments
  for select using (auth.role() = 'authenticated');
-- Only Admin/Manager can edit or refund a recorded payment
create policy "admin edit payments" on payments
  for update using (is_admin_or_manager());
-- No delete policy at all — deletions are always denied.
-- Corrections go through the refund workflow instead.

-- ---------- ACTIVITY LOG ----------
create policy "staff view activity" on activity_logs
  for select using (auth.role() = 'authenticated');
create policy "staff write activity" on activity_logs
  for insert with check (auth.role() = 'authenticated');

-- ---------- SHIFT HANDOVER NOTES ----------
create policy "staff view handover notes" on shift_handover_notes
  for select using (auth.role() = 'authenticated');
create policy "staff write handover notes" on shift_handover_notes
  for insert with check (auth.role() = 'authenticated');
create policy "staff resolve handover notes" on shift_handover_notes
  for update using (auth.role() = 'authenticated');

-- ---------- HOTEL SETTINGS ----------
create policy "staff view settings" on hotel_settings
  for select using (auth.role() = 'authenticated');
create policy "admin update settings" on hotel_settings
  for update using (is_admin_or_manager());
