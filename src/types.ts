export type Language = 'EN' | 'KM';

export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST';

export interface User {
  id: string;
  name: string;
  nameKm: string;
  email: string;
  role: UserRole;
  preferred_language: Language;
  avatar?: string;
}

export type Currency = 'KHR' | 'USD';

export type PaymentMethod = 'CASH' | 'BANK';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Payment {
  id: string;
  reservation_id: string;
  guest_id: string;
  guest_name: string;
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  bank_name?: string;
  transaction_reference?: string;
  note?: string;
  payment_status: PaymentStatus;
  received_by: string; // Staff member name / ID
  received_by_role?: UserRole;
  created_at: string;
  updated_at: string;
}

export type RoomStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'RESERVED' 
  | 'CLEANING' 
  | 'MAINTENANCE' 
  | 'OUT_OF_SERVICE';

export interface RoomCategory {
  id: string;
  code: string;
  name: string;
  nameKm: string;
  defaultPriceUsd: number;
  defaultPriceKhr: number;
  bedType: string;
  bedTypeKm?: string;
  maxOccupancy: number;
  description?: string;
  descriptionKm?: string;
}

export type RoomType = 
  | 'ONE_BED_ROOM'
  | 'TWIN_BED_ROOM'
  | 'FAMILY_ROOM'
  | 'DELUXE_ANGKOR' 
  | 'PREMIER_SUITE' 
  | 'SUPERIOR_TWIN' 
  | 'EXECUTIVE_KING' 
  | 'ROYAL_FAMILY_SUITE'
  | string;

export type RoomFloor = number | 'G';

export type RoomPlaceCategory =
  | 'BACK'            // ខាងក្រោយ
  | 'OUTER_STAIRS'     // ជណ្ដើរក្រៅ
  | 'INNER_STAIRS'     // ជណ្ដើរក្នុង
  | string;

export interface Room {
  id: string;
  number: string;
  floor: RoomFloor;
  type: RoomType;
  categoryCode?: string;
  categoryName?: string;
  placeCategory?: RoomPlaceCategory;
  status: RoomStatus;
  priceUsd: number;
  priceKhr: number;
  amenities: string[];
  maxOccupancy: number;
  bedType?: string;
  isVip?: boolean;
  currentGuestName?: string;
  currentReservationId?: string;
}

export interface Guest {
  id: string;
  name: string;
  nameKm?: string;
  passportOrId: string;
  phone: string;
  email?: string;
  nationality: string;
  nationalityKm?: string;
  vipStatus: boolean;
  notes?: string;
  idCardImage?: string;
  idSource?: 'CAMERA' | 'SCANNER' | 'UPLOAD';
  idScannedAt?: string;
  createdAt: string;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  paidAmountUsd?: number;
  paidAmountKhr?: number;
}

export type ReservationStatus = 
  | 'CONFIRMED' 
  | 'CHECKED_IN' 
  | 'CHECKED_OUT' 
  | 'CANCELLED';

export interface Reservation {
    telegramMessageId?: string;
  telegramHasPhoto?: boolean;
  id: string;
  guest_id: string;
  guest_name: string;
  room_id: string;
  room_number: string;
  room_type: RoomType;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  total_amount: number;
  currency: Currency;
  payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  paid_amount_khr: number;
  paid_amount_usd: number;
  balance_due_khr: number;
  balance_due_usd: number;
  status: ReservationStatus;
  special_requests?: string;
  idCardImage?: string;
  idSource?: 'CAMERA' | 'SCANNER' | 'UPLOAD';
  created_by: string;
  created_at: string;
  actual_check_in_time?: string;
  actual_check_out_time?: string;
}

export interface ActivityLog {
  id: string;
  type: 'PAYMENT' | 'CHECK_IN' | 'CHECK_OUT' | 'RESERVATION' | 'ROOM_STATUS';
  descriptionEn: string;
  descriptionKm: string;
  staffName: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface ShiftHandoverNote {
  id: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  author: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  roomNumber?: string;
  guestName?: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
}

export interface HotelSettings {
  nameEn: string;
  nameKm: string;
  subtitleEn: string;
  subtitleKm: string;
  locationEn: string;
  locationKm: string;
  phone: string;
  email: string;
  website: string;
  vatNumber: string;
  checkInTime: string;
  checkOutTime: string;
  exchangeRateUsdToKhr: number;
  wifiSsid: string;
  wifiPass: string;
  receiptFooterNoteEn: string;
  receiptFooterNoteKm: string;
  telegramEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}