-- ============================================================
-- Galaxy Star Angkor Hotel — Supabase Schema
-- Mirrors src/types.ts exactly. camelCase TS fields map to
-- snake_case columns (mapping handled in the data-access layer,
-- coming in Step 3).
-- ============================================================

-- ---------- ENUMS ----------
create type user_role as enum ('ADMIN', 'MANAGER', 'RECEPTIONIST');
create type language_code as enum ('EN', 'KM');
create type currency_code as enum ('KHR', 'USD');
create type payment_method_type as enum ('CASH', 'BANK');
create type payment_status_type as enum ('PENDING', 'PAID', 'REFUNDED');
create type room_status_type as enum ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE');
create type reservation_status_type as enum ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
create type reservation_payment_status as enum ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');
create type id_source_type as enum ('CAMERA', 'SCANNER', 'UPLOAD');
create type activity_type as enum ('PAYMENT', 'CHECK_IN', 'CHECK_OUT', 'RESERVATION', 'ROOM_STATUS');
create type shift_type as enum ('MORNING', 'EVENING', 'NIGHT');
create type note_priority as enum ('NORMAL', 'IMPORTANT', 'URGENT');

-- ---------- STAFF (extends Supabase auth.users) ----------
create table staff (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  name_km text,
  email text not null unique,
  role user_role not null default 'RECEPTIONIST',
  preferred_language language_code not null default 'EN',
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ROOM CATEGORIES ----------
create table room_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  name_km text,
  default_price_usd numeric(10,2) not null,
  default_price_khr numeric(14,0) not null,
  bed_type text not null,
  bed_type_km text,
  max_occupancy int not null default 2,
  description text,
  description_km text
);

-- ---------- ROOMS ----------
create table rooms (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  floor int not null,
  type text not null,                     -- RoomType string, e.g. DELUXE_ANGKOR
  category_code text references room_categories(code),
  category_name text,
  status room_status_type not null default 'AVAILABLE',
  price_usd numeric(10,2) not null,
  price_khr numeric(14,0) not null,
  amenities text[] not null default '{}',
  max_occupancy int not null default 2,
  bed_type text,
  is_vip boolean not null default false,
  current_guest_name text,
  current_reservation_id uuid,            -- FK added after reservations exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- GUESTS ----------
create table guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_km text,
  passport_or_id text,
  phone text,
  email text,
  nationality text,
  nationality_km text,
  vip_status boolean not null default false,
  notes text,
  id_card_image text,                     -- storage URL
  id_source id_source_type,
  id_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  room_number text,
  check_in_date date,
  check_out_date date,
  paid_amount_usd numeric(12,2) default 0,
  paid_amount_khr numeric(14,0) default 0
);

-- ---------- RESERVATIONS ----------
create table reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_code text not null unique,        -- RES-2026-00125 style
  guest_id uuid not null references guests(id),
  guest_name text not null,                     -- denormalized for fast display
  room_id uuid not null references rooms(id),
  room_number text not null,
  room_type text not null,
  check_in_date date not null,
  check_out_date date not null,
  nights int not null,
  adults int not null default 1,
  children int not null default 0,
  total_amount numeric(12,2) not null,
  currency currency_code not null,
  payment_status reservation_payment_status not null default 'UNPAID',
  paid_amount_khr numeric(14,0) not null default 0,
  paid_amount_usd numeric(12,2) not null default 0,
  balance_due_khr numeric(14,0) not null default 0,
  balance_due_usd numeric(12,2) not null default 0,
  status reservation_status_type not null default 'CONFIRMED',
  special_requests text,
  id_card_image text,
  id_source id_source_type,
  created_by uuid references staff(id),
  created_at timestamptz not null default now(),
  actual_check_in_time timestamptz,
  actual_check_out_time timestamptz
);

alter table rooms
  add constraint fk_rooms_current_reservation
  foreign key (current_reservation_id) references reservations(id) on delete set null;

-- ---------- PAYMENTS ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id),
  guest_id uuid not null references guests(id),
  guest_name text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency currency_code not null,
  payment_method payment_method_type not null,
  bank_name text,
  transaction_reference text,
  note text,
  payment_status payment_status_type not null default 'PAID',
  received_by uuid not null references staff(id),   -- server-enforced, see RLS
  received_by_role user_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ACTIVITY LOG ----------
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  type activity_type not null,
  description_en text not null,
  description_km text not null,
  staff_name text not null,
  timestamp timestamptz not null default now(),
  meta jsonb
);

-- ---------- SHIFT HANDOVER NOTES ----------
create table shift_handover_notes (
  id uuid primary key default gen_random_uuid(),
  shift shift_type not null,
  author text not null,
  priority note_priority not null default 'NORMAL',
  room_number text,
  guest_name text,
  content text not null,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- HOTEL SETTINGS (singleton row) ----------
create table hotel_settings (
  id int primary key default 1,
  name_en text not null default 'Galaxy Star Angkor Hotel',
  name_km text,
  subtitle_en text,
  subtitle_km text,
  location_en text,
  location_km text,
  phone text,
  email text,
  website text,
  vat_number text,
  check_in_time text default '14:00',
  check_out_time text default '12:00',
  exchange_rate_usd_to_khr numeric(10,2) default 4100,
  wifi_ssid text,
  wifi_pass text,
  receipt_footer_note_en text,
  receipt_footer_note_km text,
  constraint single_row check (id = 1)
);
insert into hotel_settings (id) values (1);

-- ---------- INDEXES ----------
create index idx_payments_reservation on payments(reservation_id);
create index idx_payments_created_at on payments(created_at desc);
create index idx_reservations_dates on reservations(check_in_date, check_out_date);
create index idx_reservations_guest on reservations(guest_id);
create index idx_reservations_room on reservations(room_id);
create index idx_activity_timestamp on activity_logs(timestamp desc);
create index idx_rooms_status on rooms(status);
