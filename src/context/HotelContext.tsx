import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Language,
  User,
  UserRole,
  Room,
  RoomCategory,
  Guest,
  Reservation,
  Payment,
  ActivityLog,
  Currency,
  PaymentMethod,
  RoomStatus,
  RoomType,
  ShiftHandoverNote,
  HotelSettings,
} from "../types";
import { translations } from "../translations";
import { generateSampleIdCardSvg } from "../utils/idGenerator";
import { supabase } from "../lib/supabase";
import { sendTelegramCheckInNotification, editTelegramCheckInMessage, editTelegramCheckInPhoto, sendTelegramPhotoAsNewMessage, deleteTelegramMessage } from '../utils/telegram';
import { formatDate } from '../utils/dateFormatter';

// Sample Staff Accounts
export const INITIAL_STAFF: User[] = [
  {
    id: "staff-001",
    name: "Somaly Chen",
    nameKm: "ចិន សុម៉ាលី",
    email: "somaly.chen@galaxystarangkor.com",
    role: "RECEPTIONIST",
    preferred_language: "EN",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-002",
    name: "Sopheak Vath",
    nameKm: "វ៉ាត សុភ័ក្ត្រ",
    email: "sopheak.vath@galaxystarangkor.com",
    role: "MANAGER",
    preferred_language: "KM",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-003",
    name: "Sokha Sam",
    nameKm: "សំ សុខា",
    email: "sokha.sam@galaxystarangkor.com",
    role: "ADMIN",
    preferred_language: "EN",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
];

// Sample Hotel Rooms
export const INITIAL_ROOMS: Room[] = [
  {
    id: "room-101",
    number: "101",
    floor: 1,
    type: "DELUXE_ANGKOR",
    status: "OCCUPIED",
    priceUsd: 85,
    priceKhr: 340000,
    amenities: [
      "Angkor View Balcony",
      "King Bed",
      "Rain Shower",
      "Free High-Speed Wi-Fi",
      "Smart TV",
    ],
    maxOccupancy: 2,
    isVip: true,
    currentGuestName: "John Smith",
    currentReservationId: "RES-2026-00125",
  },
  {
    id: "room-102",
    number: "102",
    floor: 1,
    type: "SUPERIOR_TWIN",
    status: "AVAILABLE",
    priceUsd: 65,
    priceKhr: 260000,
    amenities: ["Twin Beds", "Garden View", "Tea/Coffee Maker", "Safe Box"],
    maxOccupancy: 2,
  },
  {
    id: "room-103",
    number: "103",
    floor: 1,
    type: "EXECUTIVE_KING",
    status: "OCCUPIED",
    priceUsd: 110,
    priceKhr: 440000,
    amenities: [
      "Direct Pool Access",
      "Jacuzzi Bathtub",
      "King Bed",
      "Espresso Machine",
    ],
    maxOccupancy: 2,
    isVip: true,
    currentGuestName: "Chan Thida",
    currentReservationId: "RES-2026-00126",
  },
  {
    id: "room-104",
    number: "104",
    floor: 1,
    type: "SUPERIOR_TWIN",
    status: "CLEANING",
    priceUsd: 65,
    priceKhr: 260000,
    amenities: ["Twin Beds", "City View", "Mini Bar", "Bathrobe"],
    maxOccupancy: 2,
  },
  {
    id: "room-201",
    number: "201",
    floor: 2,
    type: "PREMIER_SUITE",
    status: "OCCUPIED",
    priceUsd: 140,
    priceKhr: 560000,
    amenities: [
      "Panoramic Angkor View",
      "Separate Living Room",
      "Deep Soaking Tub",
      "Complimentary Wine",
    ],
    maxOccupancy: 3,
    isVip: true,
    currentGuestName: "Kenji Sato",
    currentReservationId: "RES-2026-00127",
  },
  {
    id: "room-202",
    number: "202",
    floor: 2,
    type: "DELUXE_ANGKOR",
    status: "AVAILABLE",
    priceUsd: 85,
    priceKhr: 340000,
    amenities: ["Balcony View", "King Bed", "Work Desk", "Safe Box"],
    maxOccupancy: 2,
  },
  {
    id: "room-203",
    number: "203",
    floor: 2,
    type: "ROYAL_FAMILY_SUITE",
    status: "RESERVED",
    priceUsd: 190,
    priceKhr: 760000,
    amenities: [
      "2 Bedrooms",
      "Full Living Room",
      "2 Bathrooms",
      "Angkor Sunset View",
    ],
    maxOccupancy: 5,
    isVip: true,
  },
  {
    id: "room-204",
    number: "204",
    floor: 2,
    type: "SUPERIOR_TWIN",
    status: "MAINTENANCE",
    priceUsd: 65,
    priceKhr: 260000,
    amenities: ["Twin Beds", "Balcony", "AC Servicing"],
    maxOccupancy: 2,
  },
  {
    id: "room-301",
    number: "301",
    floor: 3,
    type: "PREMIER_SUITE",
    status: "AVAILABLE",
    priceUsd: 140,
    priceKhr: 560000,
    amenities: ["Top Floor Sky View", "King Bed", "Executive Lounge Access"],
    maxOccupancy: 3,
    isVip: true,
  },
  {
    id: "room-302",
    number: "302",
    floor: 3,
    type: "DELUXE_ANGKOR",
    status: "OCCUPIED",
    priceUsd: 85,
    priceKhr: 340000,
    amenities: ["Balcony", "King Bed", "Rain Shower"],
    maxOccupancy: 2,
    currentGuestName: "Marie Laurent",
    currentReservationId: "RES-2026-00128",
  },
  {
    id: "room-303",
    number: "303",
    floor: 3,
    type: "SUPERIOR_TWIN",
    status: "AVAILABLE",
    priceUsd: 65,
    priceKhr: 260000,
    amenities: ["Twin Beds", "Quiet Corridor", "Safe Box"],
    maxOccupancy: 2,
  },
  {
    id: "room-304",
    number: "304",
    floor: 3,
    type: "ROYAL_FAMILY_SUITE",
    status: "AVAILABLE",
    priceUsd: 190,
    priceKhr: 760000,
    amenities: ["2 Bedrooms", "Balcony", "Kitchenette", "VIP Service"],
    maxOccupancy: 5,
    isVip: true,
  },
];

// Sample Guests
export const INITIAL_ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "cat-one-bed",
    code: "ONE_BED_ROOM",
    name: "One Bed Room",
    nameKm: "បន្ទប់គ្រែមួយ",
    defaultPriceUsd: 45,
    defaultPriceKhr: 184500,
    bedType: "Queen Bed",
    bedTypeKm: "គ្រែឃួន",
    maxOccupancy: 2,
    description:
      "A cozy room with a single queen bed, ideal for solo travelers or couples.",
    descriptionKm:
      "បន្ទប់ស្រួលស្រាលមានគ្រែឃួនមួយ សមស្របសម្រាប់អ្នកធ្វើដំណើរតែម្នាក់ ឬគូស្នេហ៍។",
  },
  {
    id: "cat-twin-bed",
    code: "TWIN_BED_ROOM",
    name: "Twin Bed Room",
    nameKm: "បន្ទប់គ្រែពីរ",
    defaultPriceUsd: 50,
    defaultPriceKhr: 205000,
    bedType: "Twin Beds",
    bedTypeKm: "គ្រែពីរដាច់ដោយឡែក",
    maxOccupancy: 2,
    description:
      "Two separate single beds, perfect for friends or colleagues sharing a room.",
    descriptionKm:
      "គ្រែឯកជនពីរដាច់ដោយឡែកពីគ្នា សមស្របសម្រាប់មិត្តភក្តិ ឬសហការីស្នាក់នៅជាមួយគ្នា។",
  },
  {
    id: "cat-family",
    code: "FAMILY_ROOM",
    name: "Family Room",
    nameKm: "បន្ទប់គ្រួសារ",
    defaultPriceUsd: 95,
    defaultPriceKhr: 389500,
    bedType: "1 King + 2 Singles",
    bedTypeKm: "គ្រែឃីងមួយ និងគ្រែឯកជនពីរ",
    maxOccupancy: 4,
    description:
      "A spacious room designed for families, with extra sleeping space for children.",
    descriptionKm:
      "បន្ទប់ធំទូលាយសម្រាប់គ្រួសារ មានកន្លែងគេងបន្ថែមសម្រាប់កុមារ។",
  },
  {
    id: "cat-deluxe-angkor",
    code: "DELUXE_ANGKOR",
    name: "Deluxe Angkor Room",
    nameKm: "ដឺលុច្ស អង្គរ",
    defaultPriceUsd: 85,
    defaultPriceKhr: 348500,
    bedType: "King Bed",
    bedTypeKm: "គ្រែឃីង",
    maxOccupancy: 2,
    description:
      "Elegant room with Angkor-inspired decor and a private balcony view.",
    descriptionKm: "បន្ទប់ទាន់សម័យតុបតែងតាមរចនាបថអង្គរ មានយ៉រឯកជន។",
  },
  {
    id: "cat-premier-suite",
    code: "PREMIER_SUITE",
    name: "Premier Suite",
    nameKm: "ព្រីមៀ ស្វីត",
    defaultPriceUsd: 140,
    defaultPriceKhr: 574000,
    bedType: "King Bed",
    bedTypeKm: "គ្រែឃីង",
    maxOccupancy: 3,
    description:
      "Spacious suite with a separate living area and premium amenities.",
    descriptionKm:
      "ស្វីតធំទូលាយមានផ្នែកទទួលភ្ញៀវដាច់ដោយឡែក និងសម្ភារៈកម្រិតខ្ពស់។",
  },
  {
    id: "cat-superior-twin",
    code: "SUPERIOR_TWIN",
    name: "Superior Twin Room",
    nameKm: "ស៊ុបភើរៀ គ្រែពីរ",
    defaultPriceUsd: 65,
    defaultPriceKhr: 266500,
    bedType: "Twin Beds",
    bedTypeKm: "គ្រែពីរ",
    maxOccupancy: 2,
    description:
      "Comfortable twin room with modern furnishings and city views.",
    descriptionKm: "បន្ទប់គ្រែពីរស្រួលស្រាលមានគ្រឿងសង្ហារឹមទាន់សម័យ។",
  },
  {
    id: "cat-executive-king",
    code: "EXECUTIVE_KING",
    name: "Executive King Suite",
    nameKm: "អិចស៊ិចឃ្យូទីវ ឃីង",
    defaultPriceUsd: 110,
    defaultPriceKhr: 451000,
    bedType: "King Bed",
    bedTypeKm: "គ្រែឃីង",
    maxOccupancy: 2,
    description:
      "Executive-level room with direct pool access and upgraded finishes.",
    descriptionKm: "បន្ទប់កម្រិតអ្នកគ្រប់គ្រងមានច្រកចេញចូលអាងហែលទឹកផ្ទាល់។",
  },
  {
    id: "cat-royal-family-suite",
    code: "ROYAL_FAMILY_SUITE",
    name: "Royal Family Suite",
    nameKm: "រ៉ូយ៉ាល់ ស្វីតគ្រួសារ",
    defaultPriceUsd: 180,
    defaultPriceKhr: 738000,
    bedType: "1 King + 2 Twins",
    bedTypeKm: "គ្រែឃីងមួយ និងគ្រែពីរ",
    maxOccupancy: 5,
    description:
      "The hotel\u2019s largest suite, built for families who want space and luxury together.",
    descriptionKm:
      "ស្វីតធំបំផុតរបស់សណ្ឋាគារ សម្រាប់គ្រួសារដែលចង់បានទាំងទំហំ និងភាពប្រណីត។",
  },
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: "guest-001",
    name: "John Smith",
    passportOrId: "GBR84920194",
    phone: "+44 7911 123456",
    email: "john.smith@gmail.com",
    nationality: "United Kingdom",
    nationalityKm: "ចក្រភពអង់គ្លេស",
    vipStatus: true,
    notes: "Prefers high floor room, allergic to feathers.",
    roomNumber: "101",
    checkInDate: "2026-08-22",
    checkOutDate: "2026-08-25",
    paidAmountKhr: 500000,
    paidAmountUsd: 0,
    idCardImage: generateSampleIdCardSvg({
      guestName: "John Smith",
      idNumber: "GBR84920194",
      nationality: "United Kingdom",
      docType: "PASSPORT",
      source: "SCANNER",
    }),
    idSource: "SCANNER",
    idScannedAt: "2026-08-20T10:05:00Z",
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "guest-002",
    name: "Chan Thida",
    nameKm: "ចាន់ ធីតា",
    passportOrId: "KHM019384729",
    phone: "+855 12 888 999",
    email: "thida.chan@gmail.com",
    nationality: "Cambodia",
    nationalityKm: "កម្ពុជា",
    vipStatus: true,
    notes: "Regular guest. VIP fruit basket on arrival.",
    roomNumber: "103",
    checkInDate: "2026-08-23",
    checkOutDate: "2026-08-26",
    paidAmountKhr: 0,
    paidAmountUsd: 330,
    idCardImage: generateSampleIdCardSvg({
      guestName: "Chan Thida",
      idNumber: "KHM019384729",
      nationality: "Cambodia",
      docType: "CAMBODIA_ID",
      source: "CAMERA",
    }),
    idSource: "CAMERA",
    idScannedAt: "2026-08-21T14:32:00Z",
    createdAt: "2026-08-21T14:30:00Z",
  },
  {
    id: "guest-003",
    name: "Kenji Sato",
    passportOrId: "JPN92837461",
    phone: "+81 90 1234 5678",
    email: "kenji.sato@yahoo.co.jp",
    nationality: "Japan",
    nationalityKm: "ជប៉ុន",
    vipStatus: true,
    notes: "Requested quiet room for temple photography tour.",
    roomNumber: "201",
    checkInDate: "2026-08-24",
    checkOutDate: "2026-08-27",
    paidAmountKhr: 0,
    paidAmountUsd: 200,
    idCardImage: generateSampleIdCardSvg({
      guestName: "Kenji Sato",
      idNumber: "JPN92837461",
      nationality: "Japan",
      docType: "PASSPORT",
      source: "SCANNER",
    }),
    idSource: "SCANNER",
    idScannedAt: "2026-08-22T08:18:00Z",
    createdAt: "2026-08-22T08:15:00Z",
  },
  {
    id: "guest-004",
    name: "Marie Laurent",
    passportOrId: "FRA48392018",
    phone: "+33 6 12 34 56 78",
    email: "marie.laurent@outlook.fr",
    nationality: "France",
    nationalityKm: "បារាំង",
    vipStatus: false,
    notes: "Late check-out requested if available.",
    roomNumber: "302",
    checkInDate: "2026-08-24",
    checkOutDate: "2026-08-28",
    paidAmountKhr: 1360000,
    paidAmountUsd: 0,
    idCardImage: generateSampleIdCardSvg({
      guestName: "Marie Laurent",
      idNumber: "FRA48392018",
      nationality: "France",
      docType: "PASSPORT",
      source: "CAMERA",
    }),
    idSource: "CAMERA",
    idScannedAt: "2026-08-23T11:47:00Z",
    createdAt: "2026-08-23T11:45:00Z",
  },
];

// Sample Reservations
export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "RES-2026-00125",
    guest_id: "guest-001",
    guest_name: "John Smith",
    room_id: "room-101",
    room_number: "101",
    room_type: "DELUXE_ANGKOR",
    check_in_date: "2026-08-22",
    check_out_date: "2026-08-25",
    nights: 3,
    adults: 2,
    children: 0,
    total_amount: 1020000,
    currency: "KHR",
    payment_status: "PARTIALLY_PAID",
    paid_amount_khr: 500000,
    paid_amount_usd: 0,
    balance_due_khr: 520000,
    balance_due_usd: 0,
    status: "CHECKED_IN",
    special_requests: "Airport pickup confirmed with hotel tuk-tuk.",
    created_by: "Somaly Chen",
    created_at: "2026-08-20T10:30:00Z",
  },
  {
    id: "RES-2026-00126",
    guest_id: "guest-002",
    guest_name: "Chan Thida",
    room_id: "room-103",
    room_number: "103",
    room_type: "EXECUTIVE_KING",
    check_in_date: "2026-08-23",
    check_out_date: "2026-08-26",
    nights: 3,
    adults: 2,
    children: 1,
    total_amount: 330,
    currency: "USD",
    payment_status: "PAID",
    paid_amount_khr: 0,
    paid_amount_usd: 330,
    balance_due_khr: 0,
    balance_due_usd: 0,
    status: "CHECKED_IN",
    special_requests: "Extra pool towels and baby cot.",
    created_by: "Somaly Chen",
    created_at: "2026-08-21T15:00:00Z",
  },
  {
    id: "RES-2026-00127",
    guest_id: "guest-003",
    guest_name: "Kenji Sato",
    room_id: "room-201",
    room_number: "201",
    room_type: "PREMIER_SUITE",
    check_in_date: "2026-08-24",
    check_out_date: "2026-08-27",
    nights: 3,
    adults: 1,
    children: 0,
    total_amount: 420,
    currency: "USD",
    payment_status: "PARTIALLY_PAID",
    paid_amount_khr: 0,
    paid_amount_usd: 200,
    balance_due_khr: 0,
    balance_due_usd: 220,
    status: "CHECKED_IN",
    special_requests: "Early sunrise breakfast box at 5:00 AM.",
    created_by: "Sopheak Vath",
    created_at: "2026-08-22T09:00:00Z",
  },
  {
    id: "RES-2026-00128",
    guest_id: "guest-004",
    guest_name: "Marie Laurent",
    room_id: "room-302",
    room_number: "302",
    room_type: "DELUXE_ANGKOR",
    check_in_date: "2026-08-24",
    check_out_date: "2026-08-28",
    nights: 4,
    adults: 2,
    children: 0,
    total_amount: 1360000,
    currency: "KHR",
    payment_status: "PAID",
    paid_amount_khr: 1360000,
    paid_amount_usd: 0,
    balance_due_khr: 0,
    balance_due_usd: 0,
    status: "CHECKED_IN",
    special_requests: "Vegetarian breakfast preference.",
    created_by: "Somaly Chen",
    created_at: "2026-08-23T12:00:00Z",
  },
];

// Sample Initial Payments (Strictly separating KHR and USD, Cash and Bank)
export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "PAY-2026-000121",
    reservation_id: "RES-2026-00125",
    guest_id: "guest-001",
    guest_name: "John Smith",
    amount: 500000,
    currency: "KHR",
    payment_method: "CASH",
    note: "Initial deposit upon check-in at front desk",
    payment_status: "PAID",
    received_by: "Somaly Chen",
    received_by_role: "RECEPTIONIST",
    created_at: "2026-08-22T14:15:00Z",
    updated_at: "2026-08-22T14:15:00Z",
  },
  {
    id: "PAY-2026-000122",
    reservation_id: "RES-2026-00126",
    guest_id: "guest-002",
    guest_name: "Chan Thida",
    amount: 330,
    currency: "USD",
    payment_method: "BANK",
    bank_name: "ABA Bank KHQR",
    transaction_reference: "ABA-984210398",
    note: "Full stay pre-payment settled via ABA scan",
    payment_status: "PAID",
    received_by: "Somaly Chen",
    received_by_role: "RECEPTIONIST",
    created_at: "2026-08-23T15:30:00Z",
    updated_at: "2026-08-23T15:30:00Z",
  },
  {
    id: "PAY-2026-000123",
    reservation_id: "RES-2026-00127",
    guest_id: "guest-003",
    guest_name: "Kenji Sato",
    amount: 200,
    currency: "USD",
    payment_method: "BANK",
    bank_name: "Canadia Visa POS",
    transaction_reference: "CAN-POS-55421",
    note: "Partial stay deposit on Visa terminal",
    payment_status: "PAID",
    received_by: "Sopheak Vath",
    received_by_role: "MANAGER",
    created_at: "2026-08-24T09:40:00Z",
    updated_at: "2026-08-24T09:40:00Z",
  },
  {
    id: "PAY-2026-000124",
    reservation_id: "RES-2026-00128",
    guest_id: "guest-004",
    guest_name: "Marie Laurent",
    amount: 1360000,
    currency: "KHR",
    payment_method: "CASH",
    note: "Full 4-night stay cash settlement",
    payment_status: "PAID",
    received_by: "Somaly Chen",
    received_by_role: "RECEPTIONIST",
    created_at: "2026-08-24T11:10:00Z",
    updated_at: "2026-08-24T11:10:00Z",
  },
];

export const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: "act-1",
    type: "PAYMENT",
    descriptionEn:
      "Recorded KHR 1,360,000 Cash payment from Marie Laurent (Room 302)",
    descriptionKm:
      "បានកត់ត្រាការទូទាត់ប្រាក់សុទ្ធ ១,៣៦០,០០០ រៀល ពីភ្ញៀវ Marie Laurent (បន្ទប់ ៣០២)",
    staffName: "Somaly Chen",
    timestamp: "2026-08-24T11:10:00Z",
  },
  {
    id: "act-2",
    type: "CHECK_IN",
    descriptionEn:
      "Completed Check-In for Marie Laurent into Room 302 (Deluxe Angkor View)",
    descriptionKm:
      "បានបញ្ចប់ការចូលស្នាក់នៅរបស់ Marie Laurent ក្នុងបន្ទប់ ៣០២ (ដឺលុច្ស បែរមុខទៅប្រាសាទ)",
    staffName: "Somaly Chen",
    timestamp: "2026-08-24T11:05:00Z",
  },
  {
    id: "act-3",
    type: "PAYMENT",
    descriptionEn:
      "Recorded $200.00 USD Bank POS payment from Kenji Sato (Room 201)",
    descriptionKm:
      "បានកត់ត្រាការទូទាត់តាមធនាគារ POS ចំនួន $200.00 USD ពីភ្ញៀវ Kenji Sato (បន្ទប់ ២០១)",
    staffName: "Sopheak Vath",
    timestamp: "2026-08-24T09:40:00Z",
  },
  {
    id: "act-4",
    type: "ROOM_STATUS",
    descriptionEn: "Room 104 moved to Housekeeping Cleaning status",
    descriptionKm: "បន្ទប់ ១០៤ ត្រូវបានប្តូរទៅស្ថានភាពកំពុងសម្អាតបន្ទប់",
    staffName: "Somaly Chen",
    timestamp: "2026-08-24T08:30:00Z",
  },
];

export const INITIAL_HANDOVER_NOTES: ShiftHandoverNote[] = [
  {
    id: "note-1",
    shift: "MORNING",
    author: "Somaly Chen",
    priority: "URGENT",
    roomNumber: "201",
    guestName: "Kenji Sato",
    content:
      "Guest requested early wake-up call at 05:00 AM tomorrow for Angkor Wat sunrise tour. Breakfast picnic box prepared with kitchen.",
    isResolved: false,
    createdAt: "2026-08-24T08:15:00Z",
  },
  {
    id: "note-2",
    shift: "MORNING",
    author: "Somaly Chen",
    priority: "IMPORTANT",
    roomNumber: "101",
    guestName: "John Smith",
    content:
      "Requested airport shuttle tuk-tuk tomorrow at 11:30 AM to Siem Reap Angkor International Airport (SAI). Hotel driver assigned.",
    isResolved: false,
    createdAt: "2026-08-24T09:30:00Z",
  },
  {
    id: "note-3",
    shift: "EVENING",
    author: "Sopheak Vath",
    priority: "NORMAL",
    roomNumber: "104",
    content:
      "Housekeeping finished deep sanitizing and linen replacement for room 104. Ready for front desk inspection.",
    isResolved: true,
    createdAt: "2026-08-24T10:00:00Z",
  },
];

export const INITIAL_SETTINGS: HotelSettings = {
  nameEn: "Galaxy Star Angkor Hotel",
  nameKm: "សណ្ឋាគារ ហ្គាឡាក់ស៊ី ស្តារ អង្គរ",
  subtitleEn: "Hotel & Restaurant Management System",
  subtitleKm: "ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារ និងភោជនីយដ្ឋាន",
  locationEn: "Pokambor Ave, Krong Siem Reap, Kingdom of Cambodia",
  locationKm: "វិថីពោធិកំបោរ ក្រុងសៀមរាប ព្រះរាជាណាចក្រកម្ពុជា",
  phone: "+855 (0) 63 963 888",
  email: "info@galaxystarangkor.com",
  website: "www.galaxystarangkor.com",
  vatNumber: "K005-901827461",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  exchangeRateUsdToKhr: 4000,
  wifiSsid: "GalaxyStar_Guest_HighSpeed",
  wifiPass: "AngkorStar2026",
  receiptFooterNoteEn:
    "Thank you for staying with us at Galaxy Star Angkor Hotel! Enjoy your memorable journey in the Kingdom of Wonder.",
  receiptFooterNoteKm:
    "សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះការស្នាក់នៅសណ្ឋាគារ ផ្កាយហ្គាឡាក់ស៊ី អង្គរ! សូមជូនពរឱ្យការធ្វើដំណើរកាន់តែរីករាយ។",
};

interface HotelContextType {
  currentUser: User;
  language: Language;
  t: (typeof translations)["EN"];
  staffList: User[];
  rooms: Room[];
  roomsLoading: boolean;
  roomCategories: RoomCategory[];
  guests: Guest[];
  reservations: Reservation[];
  payments: Payment[];
  activities: ActivityLog[];
  handoverNotes: ShiftHandoverNote[];
  settings: HotelSettings;
  activeReceipt: Payment | null;
  isRecordPaymentOpen: boolean;
  isWalkInModalOpen: boolean;
  isNewReservationModalOpen: boolean;
  isShiftCloseoutOpen: boolean;
  selectedCheckInReservation: Reservation | null;
  selectedCheckOutReservation: Reservation | null;
  selectedVoucherReservation: Reservation | null;
  selectedIdGuest: Guest | null;
  selectedEditRoom: Room | null;
  preselectedWalkInRoomId: string | null;

  // Actions
  setLanguage: (lang: Language) => void;
  updateOwnProfile: (data: { name?: string; nameKm?: string; avatar?: string }) => Promise<void>;
    isEditProfileOpen: boolean;
  selectedTelegramEditReservation: Reservation | null;
  openTelegramEditModal: (res: Reservation) => void;
  closeTelegramEditModal: () => void;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  switchUser: (userId: string) => void;
  openRecordPaymentModal: () => void;
  closeRecordPaymentModal: () => void;
  openReceiptModal: (payment: Payment) => void;
  closeReceiptModal: () => void;
  openWalkInModal: () => void;
  openWalkInModalWithRoom: (roomId: string) => void;
  closeWalkInModal: () => void;
  openNewReservationModal: () => void;
  closeNewReservationModal: () => void;
  openVoucherModal: (res: Reservation) => void;
  closeVoucherModal: () => void;
  openShiftCloseoutModal: () => void;
  closeShiftCloseoutModal: () => void;
  openEditRoomModal: (room: Room) => void;
  closeEditRoomModal: () => void;
  openCheckInModal: (res: Reservation) => void;
  closeCheckInModal: () => void;
  openCheckOutModal: (res: Reservation) => void;
  closeCheckOutModal: () => void;
  openIdViewerModal: (guest: Guest) => void;
  closeIdViewerModal: () => void;
  recordPayment: (
    paymentData: {
      reservation_id: string;
      guest_name: string;
      amount: number;
      currency: Currency;
      payment_method: PaymentMethod;
      bank_name?: string;
      transaction_reference?: string;
      note?: string;
    },
    waitFor?: PromiseLike<any>,
  ) => Payment;
  checkInReservation: (
    reservationId: string,
    options?: {
      assignedRoomId?: string;
      depositAmount?: number;
      depositCurrency?: Currency;
      depositMethod?: PaymentMethod;
      bankName?: string;
      txnRef?: string;
      keyCardNumber?: string;
      specialNote?: string;
    },
  ) => void;
  walkInCheckIn: (data: {
    guestName: string;
    guestNameKm?: string;
    passportOrId: string;
    phone: string;
    email?: string;
    nationality: string;
    nationalityKm?: string;
    roomIds: string[];
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    adults: number;
    children: number;
    currency: Currency;
    stayType?: 'OVERNIGHT' | 'HOURLY';
    hourlyRatePerRoom?: number; // flat amount per room, in `currency`, used when stayType is 'HOURLY'
    depositAmount?: number;
    depositMethod?: PaymentMethod;
    bankName?: string;
    txnRef?: string;
    specialRequests?: string;
    isVip?: boolean;
    keyCardNumber?: string;
    idCardImage?: string;
    idSource?: "CAMERA" | "SCANNER" | "UPLOAD";
    idScannedAt?: string;
  }) => {
    reservations: Reservation[];
    reservation: Reservation;
    payment?: Payment;
  };

    updateTelegramNotification: (data: {
    reservationId: string;
    guestName: string;
    roomNumbers: string;
    checkInDate: string; // ISO
    checkOutDate: string; // ISO
    paidAmount: string;
    paymentMethod: string;
    newIdCardImage?: string;
  }) => Promise<{ ok: boolean; error?: string }>;

  addRoomForGuest: (data: {
    guestId: string;
    guestName: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    adults: number;
    children: number;
    currency: Currency;
    depositAmount?: number;
    depositMethod?: PaymentMethod;
    bankName?: string;
    txnRef?: string;
    specialRequests?: string;
    keyCardNumber?: string;
  }) => { reservation: Reservation; payment?: Payment };
  selectedAddRoomGuest: Guest | null;
  openAddRoomModal: (guest: Guest) => void;
  closeAddRoomModal: () => void;
  createAdvanceReservation: (data: {
    guestName: string;
    guestNameKm?: string;
    passportOrId: string;
    phone: string;
    email?: string;
    nationality: string;
    nationalityKm?: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    adults: number;
    children: number;
    roomRate: number;
    currency: Currency;
    depositAmount?: number;
    depositMethod?: PaymentMethod;
    bankName?: string;
    txnRef?: string;
    specialRequests?: string;
    isVip?: boolean;
  }) => { reservation: Reservation; payment?: Payment };
  cancelReservation: (reservationId: string) => void;
  checkOutGuest: (
    reservationId: string,
    options?: {
      settlementAmount?: number;
      settlementMethod?: PaymentMethod;
      bankName?: string;
      txnRef?: string;
      extraCharges?: number;
    },
  ) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  saveRoomDetails: (roomData: Partial<Room> & { id: string }) => void;
  addNewRoom: (roomData: Omit<Room, "id">) => void;
    deleteRoom: (roomId: string) => void;
  addRoomCategory: (categoryData: Omit<RoomCategory, "id">) => void;
  updateRoomCategory: (
    categoryId: string,
    updatedData: Partial<RoomCategory>,
  ) => void;
  deleteRoomCategory: (categoryId: string) => void;
  refundPayment: (paymentId: string) => void;
  updateGuest: (guestId: string, updatedData: Partial<Guest>) => void;
  addHandoverNote: (data: {
    shift: "MORNING" | "EVENING" | "NIGHT";
    priority: "NORMAL" | "IMPORTANT" | "URGENT";
    roomNumber?: string;
    guestName?: string;
    content: string;
  }) => void;
  toggleHandoverNoteResolved: (noteId: string) => void;
  updateSettings: (newSettings: Partial<HotelSettings>) => void;
}

let idCounter = 0;
export const generateUniqueId = (prefix: string = "id"): string => {
  idCounter += 1;
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${idCounter}-${rand}`;
};

// Safe deduplicator for items loaded from localStorage to prevent duplicate key errors
function sanitizeItems<T extends { id: string }>(
  items: T[],
  prefix: string,
): T[] {
  const seen = new Set<string>();
  return items.map((item) => {
    if (!item.id || seen.has(item.id)) {
      const newId = generateUniqueId(prefix);
      seen.add(newId);
      return { ...item, id: newId };
    }
    seen.add(item.id);
    return item;
  });
}
function isKhmer(lang: Language): boolean {
  return lang === 'KM';
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

// ============================================================
// Supabase <-> app-shape mappers for rooms & room categories.
// DB columns are snake_case; the app uses camelCase.
// ============================================================
function mapRoomFromDb(row: any): Room {
  return {
    id: row.id,
    number: row.number,
    floor: row.floor === "G" ? "G" : Number(row.floor),
    type: row.type,
    categoryCode: row.category_code || undefined,
    categoryName: row.category_name || undefined,
    placeCategory: row.place_category || undefined,
    status: row.status,
    priceUsd: Number(row.price_usd),
    priceKhr: Number(row.price_khr),
    amenities: row.amenities || [],
    maxOccupancy: row.max_occupancy,
    bedType: row.bed_type || undefined,
    isVip: row.is_vip || false,
    currentGuestName: row.current_guest_name || undefined,
    currentReservationId: row.current_reservation_id || undefined,
  };
}

function mapRoomToDb(room: Partial<Room>): Record<string, any> {
  const row: Record<string, any> = {};
  if (room.number !== undefined) row.number = room.number;
  if (room.floor !== undefined) row.floor = String(room.floor);
  if (room.type !== undefined) row.type = room.type;
  if (room.categoryCode !== undefined) row.category_code = room.categoryCode;
  if (room.categoryName !== undefined) row.category_name = room.categoryName;
  if (room.placeCategory !== undefined)
    row.place_category = room.placeCategory || null;
  if (room.status !== undefined) row.status = room.status;
  if (room.priceUsd !== undefined) row.price_usd = room.priceUsd;
  if (room.priceKhr !== undefined) row.price_khr = room.priceKhr;
  if (room.amenities !== undefined) row.amenities = room.amenities;
  if (room.maxOccupancy !== undefined) row.max_occupancy = room.maxOccupancy;
  if (room.bedType !== undefined) row.bed_type = room.bedType;
  if (room.isVip !== undefined) row.is_vip = room.isVip;
  if (room.currentGuestName !== undefined)
    row.current_guest_name = room.currentGuestName || null;
  if (room.currentReservationId !== undefined)
    row.current_reservation_id = room.currentReservationId || null;
  return row;
}

function mapCategoryFromDb(row: any): RoomCategory {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    nameKm: row.name_km || "",
    defaultPriceUsd: Number(row.default_price_usd),
    defaultPriceKhr: Number(row.default_price_khr),
    bedType: row.bed_type,
    bedTypeKm: row.bed_type_km || undefined,
    maxOccupancy: row.max_occupancy,
    description: row.description || undefined,
    descriptionKm: row.description_km || undefined,
  };
}

function mapCategoryToDb(cat: Partial<RoomCategory>): Record<string, any> {
  const row: Record<string, any> = {};
  if (cat.code !== undefined) row.code = cat.code;
  if (cat.name !== undefined) row.name = cat.name;
  if (cat.nameKm !== undefined) row.name_km = cat.nameKm;
  if (cat.defaultPriceUsd !== undefined)
    row.default_price_usd = cat.defaultPriceUsd;
  if (cat.defaultPriceKhr !== undefined)
    row.default_price_khr = cat.defaultPriceKhr;
  if (cat.bedType !== undefined) row.bed_type = cat.bedType;
  if (cat.bedTypeKm !== undefined) row.bed_type_km = cat.bedTypeKm;
  if (cat.maxOccupancy !== undefined) row.max_occupancy = cat.maxOccupancy;
  if (cat.description !== undefined) row.description = cat.description;
  if (cat.descriptionKm !== undefined) row.description_km = cat.descriptionKm;
  return row;
}

// ============================================================
// Guest mappers
// ============================================================
function mapGuestFromDb(row: any): Guest {
  return {
    id: row.id,
    name: row.name,
    nameKm: row.name_km || undefined,
    passportOrId: row.passport_or_id || "",
    phone: row.phone || "",
    email: row.email || undefined,
    nationality: row.nationality || "",
    nationalityKm: row.nationality_km || undefined,
    vipStatus: row.vip_status || false,
    notes: row.notes || undefined,
    idCardImage: row.id_card_image || undefined,
    idSource: row.id_source || undefined,
    idScannedAt: row.id_scanned_at || undefined,
    createdAt: row.created_at,
    roomNumber: row.room_number || undefined,
    checkInDate: row.check_in_date || undefined,
    checkOutDate: row.check_out_date || undefined,
    paidAmountUsd:
      row.paid_amount_usd !== null ? Number(row.paid_amount_usd) : undefined,
    paidAmountKhr:
      row.paid_amount_khr !== null ? Number(row.paid_amount_khr) : undefined,
  };
}

function mapGuestToDb(g: Partial<Guest>): Record<string, any> {
  const row: Record<string, any> = {};
  if (g.name !== undefined) row.name = g.name;
  if (g.nameKm !== undefined) row.name_km = g.nameKm;
  if (g.passportOrId !== undefined) row.passport_or_id = g.passportOrId;
  if (g.phone !== undefined) row.phone = g.phone;
  if (g.email !== undefined) row.email = g.email;
  if (g.nationality !== undefined) row.nationality = g.nationality;
  if (g.nationalityKm !== undefined) row.nationality_km = g.nationalityKm;
  if (g.vipStatus !== undefined) row.vip_status = g.vipStatus;
  if (g.notes !== undefined) row.notes = g.notes;
  if (g.idCardImage !== undefined) row.id_card_image = g.idCardImage;
  if (g.idSource !== undefined) row.id_source = g.idSource;
  if (g.idScannedAt !== undefined) row.id_scanned_at = g.idScannedAt;
  if (g.roomNumber !== undefined) row.room_number = g.roomNumber;
  if (g.checkInDate !== undefined) row.check_in_date = g.checkInDate || null;
  if (g.checkOutDate !== undefined) row.check_out_date = g.checkOutDate || null;
  if (g.paidAmountUsd !== undefined) row.paid_amount_usd = g.paidAmountUsd;
  if (g.paidAmountKhr !== undefined) row.paid_amount_khr = g.paidAmountKhr;
  return row;
}

// ============================================================
// Payment mappers
// ============================================================
function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    reservation_id: row.reservation_id || "",
    guest_id: row.guest_id || "",
    guest_name: row.guest_name,
    amount: Number(row.amount),
    currency: row.currency,
    payment_method: row.payment_method,
    bank_name: row.bank_name || undefined,
    transaction_reference: row.transaction_reference || undefined,
    note: row.note || undefined,
    payment_status: row.payment_status,
    received_by: row.received_by,
    received_by_role: row.received_by_role || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// A "sentinel" id like RES-FRONT-DESK / guest-misc means "no real record" —
// write NULL to the DB so the foreign key doesn't reject it.
function realIdOrNull(id: string | undefined, prefix: string): string | null {
  if (!id) return null;
  if (!id.includes("-") || id.startsWith(prefix)) return null;
  return id;
}

// ============================================================
// Activity log mappers
// ============================================================
function mapActivityFromDb(row: any): ActivityLog {
  return {
    id: row.id,
    type: row.type,
    descriptionEn: row.description_en,
    descriptionKm: row.description_km,
    staffName: row.staff_name,
    timestamp: row.timestamp,
    meta: row.meta || undefined,
  };
}

// ============================================================
// Shift handover note mappers
// ============================================================
function mapHandoverFromDb(row: any): ShiftHandoverNote {
  return {
    id: row.id,
    shift: row.shift,
    author: row.author,
    priority: row.priority,
    roomNumber: row.room_number || undefined,
    guestName: row.guest_name || undefined,
    content: row.content,
    isResolved: row.is_resolved,
    createdAt: row.created_at,
  };
}

// ============================================================
// Hotel settings mappers (singleton row, id = 1)
// ============================================================
function mapSettingsFromDb(row: any): HotelSettings {
  return {
    nameEn: row.name_en,
    nameKm: row.name_km,
    subtitleEn: row.subtitle_en,
    subtitleKm: row.subtitle_km,
    locationEn: row.location_en,
    locationKm: row.location_km,
    phone: row.phone,
    email: row.email,
    website: row.website,
    vatNumber: row.vat_number,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    exchangeRateUsdToKhr: Number(row.exchange_rate_usd_to_khr),
    wifiSsid: row.wifi_ssid,
    wifiPass: row.wifi_pass,
    receiptFooterNoteEn: row.receipt_footer_note_en,
    receiptFooterNoteKm: row.receipt_footer_note_km,
        telegramEnabled: row.telegram_enabled || false,
    telegramBotToken: row.telegram_bot_token || undefined,
    telegramChatId: row.telegram_chat_id || undefined,
  };
}

function mapSettingsToDb(s: Partial<HotelSettings>): Record<string, any> {
  const row: Record<string, any> = {};
  if (s.nameEn !== undefined) row.name_en = s.nameEn;
  if (s.nameKm !== undefined) row.name_km = s.nameKm;
  if (s.subtitleEn !== undefined) row.subtitle_en = s.subtitleEn;
  if (s.subtitleKm !== undefined) row.subtitle_km = s.subtitleKm;
  if (s.locationEn !== undefined) row.location_en = s.locationEn;
  if (s.locationKm !== undefined) row.location_km = s.locationKm;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.email !== undefined) row.email = s.email;
  if (s.website !== undefined) row.website = s.website;
  if (s.vatNumber !== undefined) row.vat_number = s.vatNumber;
  if (s.checkInTime !== undefined) row.check_in_time = s.checkInTime;
  if (s.checkOutTime !== undefined) row.check_out_time = s.checkOutTime;
  if (s.exchangeRateUsdToKhr !== undefined)
    row.exchange_rate_usd_to_khr = s.exchangeRateUsdToKhr;
  if (s.wifiSsid !== undefined) row.wifi_ssid = s.wifiSsid;
  if (s.wifiPass !== undefined) row.wifi_pass = s.wifiPass;
  if (s.receiptFooterNoteEn !== undefined)
    row.receipt_footer_note_en = s.receiptFooterNoteEn;
  if (s.receiptFooterNoteKm !== undefined)
    row.receipt_footer_note_km = s.receiptFooterNoteKm;
  if (s.telegramEnabled !== undefined) row.telegram_enabled = s.telegramEnabled;
  if (s.telegramBotToken !== undefined) row.telegram_bot_token = s.telegramBotToken;
  if (s.telegramChatId !== undefined) row.telegram_chat_id = s.telegramChatId;
  return row;
}

// ============================================================
// Staff mappers (full list, beyond the logged-in user's own profile)
// ============================================================
function mapStaffFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    nameKm: row.name_km || row.name,
    email: row.email,
    role: row.role,
    preferred_language: row.preferred_language,
    avatar: row.avatar || undefined,
  };
}

function mapReservationFromDb(row: any): Reservation {
  return {
    id: row.id,
    guest_id: row.guest_id,
    guest_name: row.guest_name,
    room_id: row.room_id,
    room_number: row.room_number,
    room_type: row.room_type,
    check_in_date: row.check_in_date,
    check_out_date: row.check_out_date,
    nights: row.nights,
    adults: row.adults,
    children: row.children,
    total_amount: Number(row.total_amount),
    currency: row.currency,
    payment_status: row.payment_status,
    paid_amount_khr: Number(row.paid_amount_khr),
    paid_amount_usd: Number(row.paid_amount_usd),
    balance_due_khr: Number(row.balance_due_khr),
    balance_due_usd: Number(row.balance_due_usd),
    status: row.status,
    special_requests: row.special_requests || undefined,
    idCardImage: row.id_card_image || undefined,
    idSource: row.id_source || undefined,
    created_by: row.created_by || "",
    created_at: row.created_at,
    actual_check_in_time: row.actual_check_in_time || undefined,
    actual_check_out_time: row.actual_check_out_time || undefined,
    telegramMessageId: row.telegram_message_id || undefined,
    telegramHasPhoto: row.telegram_has_photo || false,
  };
}

function mapReservationToDb(r: Partial<Reservation>): Record<string, any> {
  const row: Record<string, any> = {};
  if (r.guest_id !== undefined) row.guest_id = r.guest_id;
  if (r.guest_name !== undefined) row.guest_name = r.guest_name;
  if (r.room_id !== undefined) row.room_id = r.room_id;
  if (r.room_number !== undefined) row.room_number = r.room_number;
  if (r.room_type !== undefined) row.room_type = r.room_type;
  if (r.check_in_date !== undefined) row.check_in_date = r.check_in_date;
  if (r.check_out_date !== undefined) row.check_out_date = r.check_out_date;
  if (r.nights !== undefined) row.nights = r.nights;
  if (r.adults !== undefined) row.adults = r.adults;
  if (r.children !== undefined) row.children = r.children;
  if (r.total_amount !== undefined) row.total_amount = r.total_amount;
  if (r.currency !== undefined) row.currency = r.currency;
  if (r.payment_status !== undefined) row.payment_status = r.payment_status;
  if (r.paid_amount_khr !== undefined) row.paid_amount_khr = r.paid_amount_khr;
  if (r.paid_amount_usd !== undefined) row.paid_amount_usd = r.paid_amount_usd;
  if (r.balance_due_khr !== undefined) row.balance_due_khr = r.balance_due_khr;
  if (r.balance_due_usd !== undefined) row.balance_due_usd = r.balance_due_usd;
  if (r.status !== undefined) row.status = r.status;
  if (r.special_requests !== undefined)
    row.special_requests = r.special_requests;
  if (r.idCardImage !== undefined) row.id_card_image = r.idCardImage;
  if (r.idSource !== undefined) row.id_source = r.idSource;
  if (r.created_by !== undefined) row.created_by = r.created_by;
  if (r.actual_check_in_time !== undefined)
    row.actual_check_in_time = r.actual_check_in_time;
  if (r.actual_check_out_time !== undefined)
    row.actual_check_out_time = r.actual_check_out_time;
  if (r.telegramMessageId !== undefined) row.telegram_message_id = r.telegramMessageId;
  if (r.telegramHasPhoto !== undefined) row.telegram_has_photo = r.telegramHasPhoto;
  return row;
}

export const HotelProvider: React.FC<{
  children: React.ReactNode;
  authStaff: User;
}> = ({ children, authStaff }) => {
  // Staff: the logged-in user's own profile always comes from Supabase auth
  // (authStaff). The rest of the roster is fetched from Supabase below.
  const [staffList, setStaffList] = useState<User[]>([authStaff]);
  const [currentUserId, setCurrentUserId] = useState<string>(authStaff.id);

  const currentUser =
    staffList.find((s) => s.id === currentUserId) || staffList[0];
  const language = currentUser.preferred_language || "EN";
  const t = translations[language] || translations.EN;

  // Everything below lives in Supabase now — start empty and fetch below.
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(true);
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [handoverNotes, setHandoverNotes] = useState<ShiftHandoverNote[]>([]);
  const [settings, setSettings] = useState<HotelSettings>(INITIAL_SETTINGS);

  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] =
    useState<boolean>(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState<boolean>(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
    const [selectedTelegramEditReservation, setSelectedTelegramEditReservation] = useState<Reservation | null>(null);
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] =
    useState<boolean>(false);
  const [isShiftCloseoutOpen, setIsShiftCloseoutOpen] =
    useState<boolean>(false);
  const [selectedCheckInReservation, setSelectedCheckInReservation] =
    useState<Reservation | null>(null);
  const [selectedCheckOutReservation, setSelectedCheckOutReservation] =
    useState<Reservation | null>(null);
  const [selectedVoucherReservation, setSelectedVoucherReservation] =
    useState<Reservation | null>(null);
  const [selectedIdGuest, setSelectedIdGuest] = useState<Guest | null>(null);
  const [selectedEditRoom, setSelectedEditRoom] = useState<Room | null>(null);
  const [preselectedWalkInRoomId, setPreselectedWalkInRoomId] = useState<
    string | null
  >(null);
  const [selectedAddRoomGuest, setSelectedAddRoomGuest] =
    useState<Guest | null>(null);

  // Fetch rooms & room categories from Supabase once, on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRoomsLoading(true);
      const [
        { data: catRows, error: catErr },
        { data: roomRows, error: roomErr },
      ] = await Promise.all([
        supabase
          .from("room_categories")
          .select("*")
          .order("name", { ascending: true }),
        supabase.from("rooms").select("*").order("number", { ascending: true }),
      ]);
      if (cancelled) return;
      if (catErr)
        console.error("Failed to load room categories:", catErr.message);
      if (roomErr) console.error("Failed to load rooms:", roomErr.message);
      setRoomCategories((catRows || []).map(mapCategoryFromDb));
      setRooms((roomRows || []).map(mapRoomFromDb));
      setRoomsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch staff roster, guests, reservations, payments, activities,
  // handover notes and settings from Supabase once, on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [
        { data: staffRows, error: staffErr },
        { data: guestRows, error: guestErr },
        { data: reservationRows, error: reservationErr },
        { data: paymentRows, error: paymentErr },
        { data: activityRows, error: activityErr },
        { data: noteRows, error: noteErr },
        { data: settingsRow, error: settingsErr },
      ] = await Promise.all([
        supabase.from("staff").select("*").order("name", { ascending: true }),
        supabase
          .from("guests")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("reservations")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("activity_logs")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(200),
        supabase
          .from("shift_handover_notes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("hotel_settings").select("*").eq("id", 1).single(),
      ]);
      if (cancelled) return;

      if (staffErr) console.error("Failed to load staff:", staffErr.message);
      if (staffRows && staffRows.length > 0) {
        const mapped = staffRows.map(mapStaffFromDb);
        const withoutDupe = mapped.filter((s) => s.id !== authStaff.id);
        setStaffList([authStaff, ...withoutDupe]);
      }

      if (guestErr) console.error("Failed to load guests:", guestErr.message);
      setGuests((guestRows || []).map(mapGuestFromDb));

      if (reservationErr)
        console.error("Failed to load reservations:", reservationErr.message);
      setReservations((reservationRows || []).map(mapReservationFromDb));

      if (paymentErr)
        console.error("Failed to load payments:", paymentErr.message);
      setPayments((paymentRows || []).map(mapPaymentFromDb));

      if (activityErr)
        console.error("Failed to load activity log:", activityErr.message);
      setActivities((activityRows || []).map(mapActivityFromDb));

      if (noteErr)
        console.error("Failed to load handover notes:", noteErr.message);
      setHandoverNotes((noteRows || []).map(mapHandoverFromDb));

      if (settingsErr)
        console.error("Failed to load hotel settings:", settingsErr.message);
      if (settingsRow) setSettings(mapSettingsFromDb(settingsRow));
    })();
    return () => {
      cancelled = true;
    };
  }, [authStaff.id]);

  // reservations now persist to Supabase via each function below —
  // no localStorage sync needed.

  // Language switch handler: saves preferred_language to current user profile
  const setLanguage = (newLang: Language) => {
    setStaffList((prev) =>
      prev.map((staff) =>
        staff.id === currentUser.id
          ? { ...staff, preferred_language: newLang }
          : staff,
      ),
    );
    supabase
      .from("staff")
      .update({ preferred_language: newLang })
      .eq("id", currentUser.id)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to save language preference in Supabase:",
            error.message,
          );
      });
  };

  const switchUser = (userId: string) => {
    const selected = staffList.find((s) => s.id === userId);
    if (selected) {
      setCurrentUserId(userId);
    }
  };

    const updateOwnProfile = async (data: { name?: string; nameKm?: string; avatar?: string }) => {
    setStaffList(prev => prev.map(s => s.id === currentUser.id ? { ...s, ...data } : s));

    const row: Record<string, any> = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.nameKm !== undefined) row.name_km = data.nameKm;
    if (data.avatar !== undefined) row.avatar = data.avatar;

    const { error } = await supabase.from('staff').update(row).eq('id', currentUser.id);
    if (error) {
      console.error('Failed to update profile in Supabase:', error.message);
      throw error;
    }
  };

  // Centralized activity logger: updates local state immediately and
  // persists to Supabase in the background. All activity-log call sites
  // funnel through this instead of touching setActivities directly.
  const logActivity = (entry: Omit<ActivityLog, "id">) => {
    const newActivity: ActivityLog = { ...entry, id: generateUniqueId("act") };
    setActivities((prev) => [newActivity, ...prev]);
    supabase
      .from("activity_logs")
      .insert({
        type: entry.type,
        description_en: entry.descriptionEn,
        description_km: entry.descriptionKm,
        staff_name: entry.staffName,
        timestamp: entry.timestamp,
        meta: entry.meta || null,
      })
      .then(({ error }) => {
        if (error)
          console.error("Failed to log activity in Supabase:", error.message);
      });
  };
    // Silently corrects the Telegram message linked to a reservation, using
  // whatever the reservation's current (already-updated) data is. Called
  // automatically from Guest/Check-In/Check-Out edits — never surfaced to
  // staff as a separate step.
  const syncTelegramForReservation = (res: Reservation, newIdCardImage?: string) => {
    if (!res.telegramMessageId) return;

    const isKhr = res.currency === 'KHR';
    const paidAmountText = isKhr
      ? `${res.paid_amount_khr.toLocaleString()} KHR`
      : `$${res.paid_amount_usd.toFixed(2)}`;
    const paymentMethodText = res.payment_status === 'PAID'
      ? (isKhmer(language) ? 'បង់ប្រាក់ពេញ' : 'Paid in Full')
      : res.payment_status === 'PARTIALLY_PAID'
        ? (isKhmer(language) ? 'បង់ខ្លះ' : 'Partial Payment')
        : (isKhmer(language) ? 'មិនទាន់បង់' : 'Unpaid');

    const notifData = {
      guestName: res.guest_name,
      staffName: currentUser.name,
      roomNumbers: res.room_number,
      checkInDate: formatDate(res.check_in_date, language),
      checkOutDate: formatDate(res.check_out_date, language),
      paidAmount: paidAmountText,
      paymentMethod: paymentMethodText,
    };

    if (newIdCardImage && res.telegramHasPhoto) {
      // Message already has a photo — swap it directly via edit
      editTelegramCheckInPhoto(settings, res.telegramMessageId, newIdCardImage, notifData)
        .catch(err => console.error('Telegram photo auto-sync failed:', err));
    } else if (newIdCardImage && !res.telegramHasPhoto) {
      // Original message was text-only — Telegram can't retrofit a photo
      // onto it via edit, so send a fresh replacement message with the
      // photo, delete the old text-only one, and track the new message
      // for any future edits — ends up as a single message, not two.
      const oldMessageId = res.telegramMessageId;
      sendTelegramPhotoAsNewMessage(settings, newIdCardImage, notifData).then(result => {
        if (!result.messageId) return;
        setReservations(prev => prev.map(r => r.id === res.id
          ? { ...r, telegramMessageId: result.messageId, telegramHasPhoto: true }
          : r
        ));
        supabase.from('reservations').update({
          telegram_message_id: result.messageId,
          telegram_has_photo: true,
        }).eq('id', res.id).then(({ error }) => {
          if (error) console.error('Failed to save new telegram_message_id in Supabase:', error.message);
        });
        deleteTelegramMessage(settings, oldMessageId);
      }).catch(err => console.error('Telegram new-photo-message send failed:', err));
    } else {
      editTelegramCheckInMessage(settings, res.telegramMessageId, !!res.telegramHasPhoto, notifData)
        .catch(err => console.error('Telegram auto-sync failed:', err));
    }
  };

  const openRecordPaymentModal = () => setIsRecordPaymentOpen(true);
  const closeRecordPaymentModal = () => setIsRecordPaymentOpen(false);

  const openReceiptModal = (payment: Payment) => setActiveReceipt(payment);
  const closeReceiptModal = () => setActiveReceipt(null);

  const openWalkInModal = () => {
    setPreselectedWalkInRoomId(null);
    setIsWalkInModalOpen(true);
  };
  const openWalkInModalWithRoom = (roomId: string) => {
    setPreselectedWalkInRoomId(roomId);
    setIsWalkInModalOpen(true);
  };
  const closeWalkInModal = () => {
    setIsWalkInModalOpen(false);
    setPreselectedWalkInRoomId(null);
  };

  const openNewReservationModal = () => setIsNewReservationModalOpen(true);
  const closeNewReservationModal = () => setIsNewReservationModalOpen(false);

  const openVoucherModal = (res: Reservation) =>
    setSelectedVoucherReservation(res);
  const closeVoucherModal = () => setSelectedVoucherReservation(null);

  const openShiftCloseoutModal = () => setIsShiftCloseoutOpen(true);
  const closeShiftCloseoutModal = () => setIsShiftCloseoutOpen(false);

  const openEditRoomModal = (room: Room) => setSelectedEditRoom(room);
  const closeEditRoomModal = () => setSelectedEditRoom(null);

  const openCheckInModal = (res: Reservation) =>
    setSelectedCheckInReservation(res);
  const closeCheckInModal = () => setSelectedCheckInReservation(null);

  const openCheckOutModal = (res: Reservation) =>
    setSelectedCheckOutReservation(res);
  const openAddRoomModal = (guest: Guest) => setSelectedAddRoomGuest(guest);
  const closeAddRoomModal = () => setSelectedAddRoomGuest(null);
    const openEditProfileModal = () => setIsEditProfileOpen(true);
  const closeEditProfileModal = () => setIsEditProfileOpen(false);
  const openTelegramEditModal = (res: Reservation) => setSelectedTelegramEditReservation(res);
  const closeTelegramEditModal = () => setSelectedTelegramEditReservation(null);
  const closeCheckOutModal = () => setSelectedCheckOutReservation(null);

  const openIdViewerModal = (guest: Guest) => setSelectedIdGuest(guest);
  const closeIdViewerModal = () => setSelectedIdGuest(null);

  // Record Payment: Receptionist manually enters payment, server automatically tags received_by
  const recordPayment = (
    data: {
      reservation_id: string;
      guest_name: string;
      amount: number;
      currency: Currency;
      payment_method: PaymentMethod;
      bank_name?: string;
      transaction_reference?: string;
      note?: string;
    },
    waitFor?: PromiseLike<any>,
  ): Payment => {
    const newId = `PAY-2026-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const timestamp = new Date().toISOString();

    const newPayment: Payment = {
      id: newId,
      reservation_id: data.reservation_id || "RES-FRONT-DESK",
      guest_id: "guest-misc",
      guest_name: data.guest_name,
      amount: Number(data.amount),
      currency: data.currency,
      payment_method: data.payment_method,
      bank_name: data.payment_method === "BANK" ? data.bank_name : undefined,
      transaction_reference:
        data.payment_method === "BANK" ? data.transaction_reference : undefined,
      note: data.note,
      payment_status: "PAID",
      received_by: currentUser.name,
      received_by_role: currentUser.role,
      created_at: timestamp,
      updated_at: timestamp,
    };

    setPayments((prev) => [newPayment, ...prev]);

    const insertPayment = () =>
      supabase
        .from("payments")
        .insert({
          id: newId,
          reservation_id: realIdOrNull(
            newPayment.reservation_id,
            "RES-FRONT-DESK",
          ),
          guest_id: null, // recordPayment only receives guest_name, not a real guest_id
          guest_name: newPayment.guest_name,
          amount: newPayment.amount,
          currency: newPayment.currency,
          payment_method: newPayment.payment_method,
          bank_name: newPayment.bank_name || null,
          transaction_reference: newPayment.transaction_reference || null,
          note: newPayment.note || null,
          payment_status: newPayment.payment_status,
          received_by: currentUser.name,
          received_by_id: currentUser.id,
          received_by_role: currentUser.role,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Failed to save payment in Supabase:", error.message);
            setPayments((prev) => prev.filter((p) => p.id !== newId));
          }
        });

    // If this payment belongs to a reservation that's still being created
    // (e.g. walk-in check-in), wait for that insert to land first so the
    // reservation_id foreign key on this payment doesn't fail.
    if (waitFor) {
      waitFor.then(insertPayment);
    } else {
      insertPayment();
    }

    // Update reservation paid balance if exists
    if (data.reservation_id) {
      let updatedFields: any = null;
      setReservations((prev) =>
        prev.map((res) => {
          if (res.id === data.reservation_id) {
            const isKhr = data.currency === "KHR";
            const newPaidKhr = isKhr
              ? res.paid_amount_khr + Number(data.amount)
              : res.paid_amount_khr;
            const newPaidUsd = !isKhr
              ? res.paid_amount_usd + Number(data.amount)
              : res.paid_amount_usd;

            let newStatus = res.payment_status;
            if (isKhr && res.currency === "KHR") {
              newStatus =
                newPaidKhr >= res.total_amount
                  ? "PAID"
                  : newPaidKhr > 0
                    ? "PARTIALLY_PAID"
                    : "UNPAID";
            } else if (!isKhr && res.currency === "USD") {
              newStatus =
                newPaidUsd >= res.total_amount
                  ? "PAID"
                  : newPaidUsd > 0
                    ? "PARTIALLY_PAID"
                    : "UNPAID";
            }

            updatedFields = {
              paid_amount_khr: newPaidKhr,
              paid_amount_usd: newPaidUsd,
              balance_due_khr: Math.max(0, res.total_amount - newPaidKhr),
              balance_due_usd: Math.max(0, res.total_amount - newPaidUsd),
              payment_status: newStatus,
            };

            return { ...res, ...updatedFields };
          }
          return res;
        }),
      );

      if (
        updatedFields &&
        realIdOrNull(data.reservation_id, "RES-FRONT-DESK")
      ) {
        supabase
          .from("reservations")
          .update(updatedFields)
          .eq("id", data.reservation_id)
          .then(({ error }) => {
            if (error)
              console.error(
                "Failed to update reservation balance in Supabase:",
                error.message,
              );
          });
      }
    }

    // Log Activity
    const formattedAmount =
      data.currency === "KHR"
        ? `${Number(data.amount).toLocaleString()} KHR`
        : `$${Number(data.amount).toFixed(2)} USD`;

    logActivity({
      type: "PAYMENT",
      descriptionEn: `Recorded ${formattedAmount} ${data.payment_method === "CASH" ? "Cash" : "Bank"} payment from ${data.guest_name}`,
      descriptionKm: `បានកត់ត្រាការទូទាត់ ${formattedAmount} ជា${data.payment_method === "CASH" ? "សាច់ប្រាក់" : "ធនាគារ"} ពីភ្ញៀវ ${data.guest_name}`,
      staffName: currentUser.name,
      timestamp,
    });

    return newPayment;
  };

  // Process Scheduled Reservation Check-In
  const checkInReservation = (
    reservationId: string,
    options?: {
      keyCardNumber?: string;
      depositAmount?: number;
      depositCurrency?: Currency;
      depositMethod?: PaymentMethod;
      bankName?: string;
      txnRef?: string;
      specialNote?: string;
      assignedRoomId?: string;
    },
  ) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    const targetRoomId = options?.assignedRoomId || res.room_id;
    const targetRoom = rooms.find((r) => r.id === targetRoomId);

    // Update reservation
    const timestamp = new Date().toISOString();
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === reservationId) {
          return {
            ...r,
            status: "CHECKED_IN",
            room_id: targetRoomId,
            room_number: targetRoom ? targetRoom.number : r.room_number,
            actual_check_in_time: timestamp,
          };
        }
        return r;
      }),
    );
    supabase
      .from("reservations")
      .update({
        status: "CHECKED_IN",
        room_id: targetRoomId,
        room_number: targetRoom ? targetRoom.number : res.room_number,
        actual_check_in_time: timestamp,
      })
      .eq("id", reservationId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to check in reservation in Supabase:",
            error.message,
          );
      });

    // Update guest's stay info
    const matchedGuest = guests.find(
      (g) =>
        g.id === res.guest_id ||
        g.name.toLowerCase() === res.guest_name.toLowerCase(),
    );
    setGuests((prev) =>
      prev.map((g) => {
        if (
          g.id === res.guest_id ||
          g.name.toLowerCase() === res.guest_name.toLowerCase()
        ) {
          return {
            ...g,
            roomNumber: targetRoom ? targetRoom.number : res.room_number,
            checkInDate: res.check_in_date,
            checkOutDate: res.check_out_date,
          };
        }
        return g;
      }),
    );
    if (matchedGuest) {
      supabase
        .from("guests")
        .update({
          room_number: targetRoom ? targetRoom.number : res.room_number,
          check_in_date: res.check_in_date,
          check_out_date: res.check_out_date,
        })
        .eq("id", matchedGuest.id)
        .then(({ error }) => {
          if (error)
            console.error(
              "Failed to update guest stay info in Supabase:",
              error.message,
            );
        });
    }

    // Update room to OCCUPIED
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === targetRoomId) {
          return {
            ...r,
            status: "OCCUPIED",
            currentGuestName: res.guest_name,
            currentReservationId: res.id,
          };
        }
        return r;
      }),
    );
    supabase
      .from("rooms")
      .update({
        status: "OCCUPIED",
        current_guest_name: res.guest_name,
        current_reservation_id: res.id,
      })
      .eq("id", targetRoomId)
      .then(({ error }) => {
        if (error)
          console.error("Failed to update room in Supabase:", error.message);
      });

    // Record deposit/payment if provided
    if (options?.depositAmount && options.depositAmount > 0) {
      recordPayment({
        reservation_id: res.id,
        guest_name: res.guest_name,
        amount: options.depositAmount,
        currency: options.depositCurrency || res.currency,
        payment_method: options.depositMethod || "CASH",
        bank_name: options.bankName,
        transaction_reference: options.txnRef,
        note:
          options.specialNote ||
          `Check-in deposit for Room ${targetRoom ? targetRoom.number : res.room_number}`,
      });
    }

    // Activity log
    logActivity({
      type: "CHECK_IN",
      descriptionEn: `Checked in guest ${res.guest_name} to Room ${targetRoom ? targetRoom.number : res.room_number}${options?.keyCardNumber ? ` (Key: ${options.keyCardNumber})` : ""}`,
      descriptionKm: `បានបញ្ចប់ការចូលស្នាក់នៅរបស់ភ្ញៀវ ${res.guest_name} ក្នុងបន្ទប់លេខ ${targetRoom ? targetRoom.number : res.room_number}${options?.keyCardNumber ? ` (កាត៖ ${options.keyCardNumber})` : ""}`,
      staffName: currentUser.name,
      timestamp,
    });

        // Auto-correct the linked Telegram message with the confirmed check-in details
    if (res.telegramMessageId) {
      syncTelegramForReservation({
        ...res,
        room_number: targetRoom ? targetRoom.number : res.room_number,
      });
    }
  };

  const walkInCheckIn = (data: {
    stayType?: 'OVERNIGHT' | 'HOURLY';
    hourlyRatePerRoom?: number;
    guestName: string;
    guestNameKm?: string;
    passportOrId: string;
    phone: string;
    email?: string;
    nationality: string;
    nationalityKm?: string;
    roomIds: string[];
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    adults: number;
    children: number;
    currency: Currency;
    depositAmount?: number;
    depositMethod?: PaymentMethod;
    bankName?: string;
    txnRef?: string;
    specialRequests?: string;
    isVip?: boolean;
    keyCardNumber?: string;
    idCardImage?: string;
    idSource?: "CAMERA" | "SCANNER" | "UPLOAD";
    idScannedAt?: string;
  }) => {
    const timestamp = new Date().toISOString();
    const targetRooms = data.roomIds
      .map((id) => rooms.find((r) => r.id === id))
      .filter((r): r is Room => !!r);
    if (targetRooms.length === 0) throw new Error("No rooms found");

    const isKhr = data.currency === "KHR";

    const roomAmounts = targetRooms.map(room => ({
      room,
      total: (data.stayType === 'HOURLY' && data.hourlyRatePerRoom !== undefined)
        ? data.hourlyRatePerRoom
        : data.nights * (isKhr ? room.priceKhr : room.priceUsd),
    }));
    const groupTotal = roomAmounts.reduce((sum, r) => sum + r.total, 0);

    let remainingDeposit = data.depositAmount || 0;

    const newGuestId = generateUniqueId("guest");
    const roomNumbersList = targetRooms.map((r) => r.number).join(", ");
    const newGuest: Guest = {
      id: newGuestId,
      name: data.guestName,
      passportOrId: data.passportOrId,
      phone: data.phone,
      email: data.email,
      nationality: data.nationality,
      nationalityKm: data.nationalityKm,
      vipStatus: !!data.isVip,
      notes: data.specialRequests,
      roomNumber: roomNumbersList,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      paidAmountKhr: isKhr ? Math.min(remainingDeposit, groupTotal) : 0,
      paidAmountUsd: !isKhr ? Math.min(remainingDeposit, groupTotal) : 0,
      idCardImage: data.idCardImage,
      idSource: data.idSource,
      idScannedAt: data.idScannedAt || timestamp,
      createdAt: timestamp,
    };
    setGuests((prev) => [newGuest, ...prev]);
    const guestInsertPromise = supabase
      .from("guests")
      .insert({
        id: newGuestId,
        name: newGuest.name,
        name_km: newGuest.nameKm || null,
        passport_or_id: newGuest.passportOrId,
        phone: newGuest.phone,
        email: newGuest.email || null,
        nationality: newGuest.nationality,
        nationality_km: newGuest.nationalityKm || null,
        vip_status: newGuest.vipStatus,
        notes: newGuest.notes || null,
        room_number: newGuest.roomNumber,
        check_in_date: newGuest.checkInDate,
        check_out_date: newGuest.checkOutDate,
        paid_amount_khr: newGuest.paidAmountKhr,
        paid_amount_usd: newGuest.paidAmountUsd,
        id_card_image: newGuest.idCardImage || null,
        id_source: newGuest.idSource || null,
        id_scanned_at: newGuest.idScannedAt,
        created_at: newGuest.createdAt,
      })
      .then(({ error }) => {
        if (error)
          console.error("Failed to save guest in Supabase:", error.message);
        return error;
      });

    const newReservations: Reservation[] = [];
    const reservationInsertPromises: PromiseLike<any>[] = [];

    roomAmounts.forEach(({ room, total }, index) => {
      const depositForThisRoom = Math.max(0, Math.min(remainingDeposit, total));
      remainingDeposit -= depositForThisRoom;

      const paidKhr = isKhr ? depositForThisRoom : 0;
      const paidUsd = !isKhr ? depositForThisRoom : 0;
      const isFullPaid = depositForThisRoom >= total;

      const newResId = `RES-2026-${Date.now().toString().slice(-6)}-${index}-${Math.floor(Math.random() * 900 + 100)}`;
      const newReservation: Reservation = {
        id: newResId,
        guest_id: newGuestId,
        guest_name: data.guestName,
        room_id: room.id,
        room_number: room.number,
        room_type: room.type,
        check_in_date: data.checkInDate,
        check_out_date: data.checkOutDate,
        nights: data.nights,
        adults: data.adults,
        children: data.children,
        total_amount: total,
        currency: data.currency,
        payment_status: isFullPaid
          ? "PAID"
          : depositForThisRoom > 0
            ? "PARTIALLY_PAID"
            : "UNPAID",
        paid_amount_khr: paidKhr,
        paid_amount_usd: paidUsd,
        balance_due_khr: isKhr ? Math.max(0, total - paidKhr) : 0,
        balance_due_usd: !isKhr ? Math.max(0, total - paidUsd) : 0,
        status: "CHECKED_IN",
        special_requests: data.specialRequests,
        idCardImage: data.idCardImage,
        idSource: data.idSource,
        actual_check_in_time: timestamp,
        created_by: currentUser.name,
        created_at: timestamp,
      };
      newReservations.push(newReservation);

      const reservationInsertPromise = guestInsertPromise
        .then(() =>
          supabase.from("reservations").insert({
            id: newResId,
            guest_id: newGuestId,
            guest_name: newReservation.guest_name,
            room_id: newReservation.room_id,
            room_number: newReservation.room_number,
            room_type: newReservation.room_type,
            check_in_date: newReservation.check_in_date,
            check_out_date: newReservation.check_out_date,
            nights: newReservation.nights,
            adults: newReservation.adults,
            children: newReservation.children,
            total_amount: newReservation.total_amount,
            currency: newReservation.currency,
            payment_status: newReservation.payment_status,
            paid_amount_khr: newReservation.paid_amount_khr,
            paid_amount_usd: newReservation.paid_amount_usd,
            balance_due_khr: newReservation.balance_due_khr,
            balance_due_usd: newReservation.balance_due_usd,
            status: newReservation.status,
            special_requests: newReservation.special_requests || null,
            id_card_image: newReservation.idCardImage || null,
            id_source: newReservation.idSource || null,
            actual_check_in_time: newReservation.actual_check_in_time,
            created_by: currentUser.id,
            created_at: newReservation.created_at,
          }),
        )
        .then(({ error }) => {
          if (error)
            console.error(
              "Failed to save reservation in Supabase:",
              error.message,
            );
          return error;
        });
      reservationInsertPromises.push(reservationInsertPromise);

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === room.id) {
            return {
              ...r,
              status: "OCCUPIED",
              currentGuestName: data.guestName,
              currentReservationId: newResId,
            };
          }
          return r;
        }),
      );
      reservationInsertPromise.then(() => {
        supabase
          .from("rooms")
          .update({
            status: "OCCUPIED",
            current_guest_name: data.guestName,
            current_reservation_id: newResId,
          })
          .eq("id", room.id)
          .then(({ error }) => {
            if (error)
              console.error(
                "Failed to update room in Supabase:",
                error.message,
              );
          });
      });
    });

    setReservations((prev) => [...newReservations, ...prev]);

    let createdPayment: Payment | undefined;
    const totalDeposit = data.depositAmount || 0;
    if (totalDeposit > 0 && newReservations.length > 0) {
      createdPayment = recordPayment(
        {
          reservation_id: newReservations[0].id,
          guest_name: data.guestName,
          amount: totalDeposit,
          currency: data.currency,
          payment_method: data.depositMethod || "CASH",
          bank_name: data.bankName,
          transaction_reference: data.txnRef,
          note: `Walk-in check-in payment for Room(s) ${roomNumbersList}`,
        },
        Promise.all(reservationInsertPromises),
      );
    }

    logActivity({
      type: 'CHECK_IN',
      descriptionEn: `Walk-in check-in: ${data.guestName} into Room(s) ${roomNumbersList} (${data.nights} nights)${data.keyCardNumber ? ` Key: ${data.keyCardNumber}` : ''}`,
      descriptionKm: `ភ្ញៀវដើរចូលស្នាក់នៅ៖ ${data.guestName} បន្ទប់លេខ ${roomNumbersList} (${data.nights} យប់)${data.keyCardNumber ? ` កាត៖ ${data.keyCardNumber}` : ''}`,
      staffName: currentUser.name,
      timestamp
    });

    // Notify Telegram (fire-and-forget — never blocks or fails check-in)
    const paidAmountText = isKhr
      ? `${totalDeposit.toLocaleString()} KHR`
      : `$${totalDeposit.toFixed(2)}`;
    const paymentMethodText = totalDeposit > 0
      ? (data.depositMethod === 'BANK' ? (data.bankName || 'Bank') : 'Cash')
      : 'Not Paid';

    sendTelegramCheckInNotification(settings, {
      guestName: data.guestName,
      staffName: currentUser.name,
      roomNumbers: roomNumbersList,
      checkInDate: formatDate(data.checkInDate, language),
      checkOutDate: formatDate(data.checkOutDate, language),
      paidAmount: paidAmountText,
      paymentMethod: paymentMethodText,
      idCardImage: data.idCardImage,
    }).then(result => {
      if (!result.messageId) return;
      // Store the Telegram message ID on every reservation in this group so
      // staff can later correct the notification from any of the rooms.
      setReservations(prev => prev.map(r =>
        newReservations.some(nr => nr.id === r.id)
          ? { ...r, telegramMessageId: result.messageId, telegramHasPhoto: result.hasPhoto }
          : r
      ));
      newReservations.forEach(nr => {
        supabase.from('reservations').update({
          telegram_message_id: result.messageId,
          telegram_has_photo: result.hasPhoto,
        }).eq('id', nr.id).then(({ error }) => {
          if (error) console.error('Failed to save telegram_message_id in Supabase:', error.message);
        });
      });
    });

    return { reservations: newReservations, reservation: newReservations[0], payment: createdPayment };
  };

  const updateTelegramNotification = async (data: {
    reservationId: string;
    guestName: string;
    roomNumbers: string;
    checkInDate: string;
    checkOutDate: string;
    paidAmount: string;
    paymentMethod: string;
    newIdCardImage?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const res = reservations.find(r => r.id === data.reservationId);
    if (!res) {
      return { ok: false, error: 'Reservation not found.' };
    }

    // ---- 1. Sync guest name / dates / room to the actual database ----
    const trimmedRoomNumber = data.roomNumbers.trim();
    const roomChanged = trimmedRoomNumber !== res.room_number;
    const newRoom = roomChanged ? rooms.find(r => r.number === trimmedRoomNumber) : undefined;

    if (roomChanged && !newRoom) {
      return { ok: false, error: `No room found with number "${trimmedRoomNumber}". Room was not changed.` };
    }

    const recalculatedNights = Math.max(
      1,
      Math.round((new Date(data.checkOutDate).getTime() - new Date(data.checkInDate).getTime()) / 86400000)
    );
    // Total amount scales with the corrected nights, based on the room's nightly rate
    const roomForRate = newRoom || rooms.find(r => r.id === res.room_id);
    const isKhr = res.currency === 'KHR';
    const nightlyRate = roomForRate ? (isKhr ? roomForRate.priceKhr : roomForRate.priceUsd) : 0;
    const recalculatedTotal = nightlyRate * recalculatedNights;

    const reservationUpdate: Partial<Reservation> = {
      guest_name: data.guestName,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      nights: recalculatedNights,
      total_amount: recalculatedTotal,
      balance_due_khr: isKhr ? Math.max(0, recalculatedTotal - res.paid_amount_khr) : 0,
      balance_due_usd: !isKhr ? Math.max(0, recalculatedTotal - res.paid_amount_usd) : 0,
    };
    if (newRoom) {
      reservationUpdate.room_id = newRoom.id;
      reservationUpdate.room_number = newRoom.number;
      reservationUpdate.room_type = newRoom.type;
    }

    setReservations(prev => prev.map(r => r.id === res.id ? { ...r, ...reservationUpdate } : r));
    await supabase.from('reservations').update(mapReservationToDb(reservationUpdate)).eq('id', res.id);

    // Sync the linked guest record too, so the Guests page reflects the correction
    const linkedGuest = guests.find(g => g.id === res.guest_id || g.name === res.guest_name);
    if (linkedGuest) {
      const guestUpdate: Partial<Guest> = {
        name: data.guestName,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        ...(newRoom ? { roomNumber: newRoom.number } : {}),
      };
      setGuests(prev => prev.map(g => g.id === linkedGuest.id ? { ...g, ...guestUpdate } : g));
      await supabase.from('guests').update(mapGuestToDb(guestUpdate)).eq('id', linkedGuest.id);
    }

    // If the room was actually reassigned, release the old room and occupy the new one
    if (newRoom) {
      const oldRoom = rooms.find(r => r.id === res.room_id);
      if (oldRoom && oldRoom.currentReservationId === res.id) {
        setRooms(prev => prev.map(r => r.id === oldRoom.id
          ? { ...r, status: 'AVAILABLE', currentGuestName: undefined, currentReservationId: undefined }
          : r));
        await supabase.from('rooms').update({
          status: 'AVAILABLE', current_guest_name: null, current_reservation_id: null,
        }).eq('id', oldRoom.id);
      }
      setRooms(prev => prev.map(r => r.id === newRoom.id
        ? { ...r, status: 'OCCUPIED', currentGuestName: data.guestName, currentReservationId: res.id }
        : r));
      await supabase.from('rooms').update({
        status: 'OCCUPIED', current_guest_name: data.guestName, current_reservation_id: res.id,
      }).eq('id', newRoom.id);
    }

    logActivity({
      type: 'RESERVATION',
      descriptionEn: `Corrected check-in details for ${data.guestName} (Room ${trimmedRoomNumber})`,
      descriptionKm: `បានកែតម្រូវព័ត៌មានចូលស្នាក់នៅសម្រាប់ ${data.guestName} (បន្ទប់ ${trimmedRoomNumber})`,
      staffName: currentUser.name,
      timestamp: new Date().toISOString()
    });

    // ---- 2. Also correct the Telegram message text (cosmetic only for paid amount/method) ----
    if (!res.telegramMessageId) {
      return { ok: true }; // DB corrected fine; there was just no Telegram message to edit
    }

    const notifData = {
      guestName: data.guestName,
      staffName: currentUser.name,
      roomNumbers: trimmedRoomNumber,
      checkInDate: formatDate(data.checkInDate, language),
      checkOutDate: formatDate(data.checkOutDate, language),
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
    };

    if (data.newIdCardImage && res.telegramHasPhoto) {
      return editTelegramCheckInPhoto(settings, res.telegramMessageId, data.newIdCardImage, notifData);
    }
    return editTelegramCheckInMessage(settings, res.telegramMessageId, !!res.telegramHasPhoto, notifData);
  };

  const addRoomForGuest = (data: {
    guestId: string;
    guestName: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    adults: number;
    children: number;
    currency: Currency;
    depositAmount?: number;
    depositMethod?: PaymentMethod;
    bankName?: string;
    txnRef?: string;
    specialRequests?: string;
    keyCardNumber?: string;
  }) => {
    const timestamp = new Date().toISOString();
    const targetRoom = rooms.find(r => r.id === data.roomId);
    if (!targetRoom) throw new Error('Room not found');

    const isKhr = data.currency === 'KHR';
    const totalAmount = data.nights * (isKhr ? targetRoom.priceKhr : targetRoom.priceUsd);
    const depositAmt = data.depositAmount || 0;
    const paidKhr = isKhr ? Math.min(depositAmt, totalAmount) : 0;
    const paidUsd = !isKhr ? Math.min(depositAmt, totalAmount) : 0;
    const isFullPaid = depositAmt >= totalAmount;

    const newResId = `RES-2026-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newReservation: Reservation = {
      id: newResId,
      guest_id: data.guestId,
      guest_name: data.guestName,
      room_id: targetRoom.id,
      room_number: targetRoom.number,
      room_type: targetRoom.type,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      nights: data.nights,
      adults: data.adults,
      children: data.children,
      total_amount: totalAmount,
      currency: data.currency,
      payment_status: isFullPaid ? 'PAID' : (depositAmt > 0 ? 'PARTIALLY_PAID' : 'UNPAID'),
      paid_amount_khr: paidKhr,
      paid_amount_usd: paidUsd,
      balance_due_khr: isKhr ? Math.max(0, totalAmount - paidKhr) : 0,
      balance_due_usd: !isKhr ? Math.max(0, totalAmount - paidUsd) : 0,
      status: 'CHECKED_IN',
      special_requests: data.specialRequests,
      actual_check_in_time: timestamp,
      created_by: currentUser.name,
      created_at: timestamp,
    };
    setReservations(prev => [newReservation, ...prev]);

    const reservationInsertPromise = supabase.from('reservations').insert({
      id: newResId,
      guest_id: data.guestId,
      guest_name: newReservation.guest_name,
      room_id: newReservation.room_id,
      room_number: newReservation.room_number,
      room_type: newReservation.room_type,
      check_in_date: newReservation.check_in_date,
      check_out_date: newReservation.check_out_date,
      nights: newReservation.nights,
      adults: newReservation.adults,
      children: newReservation.children,
      total_amount: newReservation.total_amount,
      currency: newReservation.currency,
      payment_status: newReservation.payment_status,
      paid_amount_khr: newReservation.paid_amount_khr,
      paid_amount_usd: newReservation.paid_amount_usd,
      balance_due_khr: newReservation.balance_due_khr,
      balance_due_usd: newReservation.balance_due_usd,
      status: newReservation.status,
      special_requests: newReservation.special_requests || null,
      actual_check_in_time: newReservation.actual_check_in_time,
      created_by: currentUser.id,
      created_at: newReservation.created_at,
    }).then(({ error }) => {
      if (error) console.error('Failed to save extra room reservation in Supabase:', error.message);
      return error;
    });

    setRooms(prev => prev.map(r => {
      if (r.id === targetRoom.id) {
        return { ...r, status: 'OCCUPIED', currentGuestName: data.guestName, currentReservationId: newResId };
      }
      return r;
    }));
    reservationInsertPromise.then(() => {
      supabase.from('rooms').update({
        status: 'OCCUPIED',
        current_guest_name: data.guestName,
        current_reservation_id: newResId,
      }).eq('id', targetRoom.id).then(({ error }) => {
        if (error) console.error('Failed to update room in Supabase:', error.message);
      });
    });

    let createdPayment: Payment | undefined;
    if (depositAmt > 0) {
      createdPayment = recordPayment({
        reservation_id: newResId,
        guest_name: data.guestName,
        amount: depositAmt,
        currency: data.currency,
        payment_method: data.depositMethod || 'CASH',
        bank_name: data.bankName,
        transaction_reference: data.txnRef,
        note: `Extra room added for ${data.guestName} — Room ${targetRoom.number}`,
      }, reservationInsertPromise);
    }

    logActivity({
      type: 'CHECK_IN',
      descriptionEn: `Added extra Room ${targetRoom.number} for existing guest ${data.guestName}${data.keyCardNumber ? ` (Key: ${data.keyCardNumber})` : ''}`,
      descriptionKm: `បានបន្ថែមបន្ទប់ ${targetRoom.number} សម្រាប់ភ្ញៀវ ${data.guestName}${data.keyCardNumber ? ` (កាត៖ ${data.keyCardNumber})` : ''}`,
      staffName: currentUser.name,
      timestamp
    });

    return { reservation: newReservation, payment: createdPayment };
  };

  // Create Advance Reservation
  const createAdvanceReservation = (data: {
    guestName: string;
    guestNameKm?: string;
    passportOrId: string;
    phone: string;
    email?: string;
    nationality: string;
    nationalityKm?: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    adults: number;
    children: number;
    roomRate: number;
    currency: Currency;
    depositAmount?: number;
    depositMethod?: PaymentMethod;
    bankName?: string;
    txnRef?: string;
    specialRequests?: string;
    isVip?: boolean;
  }) => {
    const timestamp = new Date().toISOString();
    const targetRoom = rooms.find((r) => r.id === data.roomId);
    if (!targetRoom) throw new Error("Room not found");

    // Create / find Guest record
    let guest = guests.find(
      (g) =>
        g.passportOrId.toLowerCase() === data.passportOrId.toLowerCase() ||
        g.name.toLowerCase() === data.guestName.toLowerCase(),
    );
    let guestInsertPromise: PromiseLike<any> = Promise.resolve();
    if (!guest) {
      guest = {
        id: generateUniqueId("guest"),
        name: data.guestName,
        passportOrId: data.passportOrId,
        phone: data.phone,
        email: data.email,
        nationality: data.nationality,
        nationalityKm: data.nationalityKm,
        vipStatus: !!data.isVip,
        notes: data.specialRequests,
        createdAt: timestamp,
      };
      setGuests((prev) => [guest!, ...prev]);
      guestInsertPromise = supabase
        .from("guests")
        .insert({
          id: guest.id,
          name: guest.name,
          passport_or_id: guest.passportOrId,
          phone: guest.phone,
          email: guest.email || null,
          nationality: guest.nationality,
          nationality_km: guest.nationalityKm || null,
          vip_status: guest.vipStatus,
          notes: guest.notes || null,
          created_at: guest.createdAt,
        })
        .then(({ error }) => {
          if (error)
            console.error("Failed to save guest in Supabase:", error.message);
        });
    }

    // Calculate total
    const totalAmount = data.nights * data.roomRate;
    const isKhr = data.currency === "KHR";
    const depositAmt = data.depositAmount || 0;
    const paidKhr = isKhr ? depositAmt : 0;
    const paidUsd = !isKhr ? depositAmt : 0;
    const isFullPaid = depositAmt >= totalAmount;

    // Create Reservation
    const newResId = `RES-2026-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newReservation: Reservation = {
      id: newResId,
      guest_id: guest.id,
      guest_name: data.guestName,
      room_id: data.roomId,
      room_number: targetRoom.number,
      room_type: targetRoom.type,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      nights: data.nights,
      adults: data.adults,
      children: data.children,
      total_amount: totalAmount,
      currency: data.currency,
      payment_status: isFullPaid
        ? "PAID"
        : depositAmt > 0
          ? "PARTIALLY_PAID"
          : "UNPAID",
      paid_amount_khr: paidKhr,
      paid_amount_usd: paidUsd,
      balance_due_khr: isKhr ? Math.max(0, totalAmount - paidKhr) : 0,
      balance_due_usd: !isKhr ? Math.max(0, totalAmount - paidUsd) : 0,
      status: "CONFIRMED",
      special_requests: data.specialRequests,
      created_by: currentUser.name,
      created_at: timestamp,
    };
    setReservations((prev) => [newReservation, ...prev]);

    // Reservation insert must wait for the guest insert (FK), and the
    // deposit payment insert must wait for the reservation insert (FK).
    const reservationInsertPromise = guestInsertPromise.then(() =>
      supabase
        .from("reservations")
        .insert({
          id: newResId,
          guest_id: guest!.id,
          guest_name: newReservation.guest_name,
          room_id: newReservation.room_id,
          room_number: newReservation.room_number,
          room_type: newReservation.room_type,
          check_in_date: newReservation.check_in_date,
          check_out_date: newReservation.check_out_date,
          nights: newReservation.nights,
          adults: newReservation.adults,
          children: newReservation.children,
          total_amount: newReservation.total_amount,
          currency: newReservation.currency,
          payment_status: newReservation.payment_status,
          paid_amount_khr: newReservation.paid_amount_khr,
          paid_amount_usd: newReservation.paid_amount_usd,
          balance_due_khr: newReservation.balance_due_khr,
          balance_due_usd: newReservation.balance_due_usd,
          status: newReservation.status,
          special_requests: newReservation.special_requests || null,
          created_by: currentUser.id,
          created_at: newReservation.created_at,
        })
        .then(({ error }) => {
          if (error)
            console.error(
              "Failed to save reservation in Supabase:",
              error.message,
            );
        }),
    );

    // Update room status to RESERVED if not currently occupied
    if (targetRoom.status === "AVAILABLE") {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId ? { ...r, status: "RESERVED" } : r,
        ),
      );
      supabase
        .from("rooms")
        .update({ status: "RESERVED" })
        .eq("id", data.roomId)
        .then(({ error }) => {
          if (error)
            console.error(
              "Failed to update room status in Supabase:",
              error.message,
            );
        });
    }

    // Record advance deposit if collected
    let createdPayment: Payment | undefined;
    if (depositAmt > 0) {
      createdPayment = recordPayment(
        {
          reservation_id: newResId,
          guest_name: data.guestName,
          amount: depositAmt,
          currency: data.currency,
          payment_method: data.depositMethod || "CASH",
          bank_name: data.bankName,
          transaction_reference: data.txnRef,
          note: `Advance deposit for booking ${newResId} (Room ${targetRoom.number})`,
        },
        reservationInsertPromise,
      );
    }

    // Activity log
    logActivity({
      type: "RESERVATION",
      descriptionEn: `Advance reservation ${newResId} created for ${data.guestName} (Room ${targetRoom.number}, ${data.checkInDate} to ${data.checkOutDate})`,
      descriptionKm: `បានបង្កើតការកក់ទុកជាមុន ${newResId} សម្រាប់ភ្ញៀវ ${data.guestName} (បន្ទប់ ${targetRoom.number} ពីថ្ងៃ ${data.checkInDate} ដល់ ${data.checkOutDate})`,
      staffName: currentUser.name,
      timestamp,
    });

    return { reservation: newReservation, payment: createdPayment };
  };

  // Cancel Reservation
  const cancelReservation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: "CANCELLED" } : r,
      ),
    );
    supabase
      .from("reservations")
      .update({ status: "CANCELLED" })
      .eq("id", reservationId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to cancel reservation in Supabase:",
            error.message,
          );
      });

    // If room was reserved for this booking, return to AVAILABLE
    const targetRoom = rooms.find(
      (r) => r.id === res.room_id || r.number === res.room_number,
    );
    if (targetRoom && targetRoom.status === "RESERVED") {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === targetRoom.id ? { ...r, status: "AVAILABLE" } : r,
        ),
      );
      supabase
        .from("rooms")
        .update({ status: "AVAILABLE" })
        .eq("id", targetRoom.id)
        .then(({ error }) => {
          if (error)
            console.error(
              "Failed to update room status in Supabase:",
              error.message,
            );
        });
    }

    const timestamp = new Date().toISOString();
    logActivity({
      type: "RESERVATION",
      descriptionEn: `Cancelled reservation ${reservationId} for ${res.guest_name}`,
      descriptionKm: `បានបោះបង់ការកក់បន្ទប់ ${reservationId} របស់ភ្ញៀវ ${res.guest_name}`,
      staffName: currentUser.name,
      timestamp,
    });
  };

  // Process Check-Out
  const checkOutGuest = (
    reservationId: string,
    options?: {
      settlementAmount?: number;
      settlementMethod?: PaymentMethod;
      bankName?: string;
      txnRef?: string;
      extraCharges?: number;
    },
  ) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    let createdPayment: Payment | undefined;

    // Record remaining settlement if specified
    if (options?.settlementAmount && options.settlementAmount > 0) {
      createdPayment = recordPayment({
        reservation_id: res.id,
        guest_name: res.guest_name,
        amount: options.settlementAmount,
        currency: res.currency,
        payment_method: options.settlementMethod || "CASH",
        bank_name: options.bankName,
        transaction_reference: options.txnRef,
        note: `Final check-out folio settlement for Room ${res.room_number}`,
      });
    }

    const timestamp = new Date().toISOString();

    // Update reservation status
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === reservationId) {
          return {
            ...r,
            status: "CHECKED_OUT",
            balance_due_khr: 0,
            balance_due_usd: 0,
            payment_status: "PAID",
            actual_check_out_time: timestamp,
          };
        }
        return r;
      }),
    );
    supabase
      .from("reservations")
      .update({
        status: "CHECKED_OUT",
        balance_due_khr: 0,
        balance_due_usd: 0,
        payment_status: "PAID",
        actual_check_out_time: timestamp,
      })
      .eq("id", reservationId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to check out reservation in Supabase:",
            error.message,
          );
      });

    // Update Room status to CLEANING (Housekeeping)
    const checkoutRoom = rooms.find(
      (r) => r.id === res.room_id || r.number === res.room_number,
    );
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === res.room_id || r.number === res.room_number) {
          return {
            ...r,
            status: "CLEANING",
            currentGuestName: undefined,
            currentReservationId: undefined,
          };
        }
        return r;
      }),
    );
    if (checkoutRoom) {
      supabase
        .from("rooms")
        .update({
          status: "CLEANING",
          current_guest_name: null,
          current_reservation_id: null,
        })
        .eq("id", checkoutRoom.id)
        .then(({ error }) => {
          if (error)
            console.error(
              "Failed to update room status in Supabase:",
              error.message,
            );
        });
    }

    // Activity Log
    logActivity({
      type: "CHECK_OUT",
      descriptionEn: `Checked out guest ${res.guest_name} from Room ${res.room_number}. Room set to Cleaning.`,
      descriptionKm: `បានបញ្ចប់ការចាកចេញរបស់ភ្ញៀវ ${res.guest_name} ពីបន្ទប់លេខ ${res.room_number}។ បន្ទប់បានប្តូរទៅស្ថានភាពកំពុងសម្អាត។`,
      staffName: currentUser.name,
      timestamp,
    });

        // Auto-correct the linked Telegram message to reflect the completed checkout
    if (res.telegramMessageId) {
      syncTelegramForReservation({
        ...res,
        payment_status: 'PAID',
        paid_amount_khr: res.currency === 'KHR' ? res.total_amount : res.paid_amount_khr,
        paid_amount_usd: res.currency === 'USD' ? res.total_amount : res.paid_amount_usd,
      });
    }

    return { payment: createdPayment };
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status } : r)),
    );

    supabase
      .from("rooms")
      .update({ status })
      .eq("id", roomId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to update room status in Supabase:",
            error.message,
          );
      });

    if (targetRoom) {
      logActivity({
        type: "ROOM_STATUS",
        descriptionEn: `Room ${targetRoom.number} status updated to ${status}`,
        descriptionKm: `បន្ទប់ ${targetRoom.number} ត្រូវបានប្តូរទៅស្ថានភាព ${status}`,
        staffName: currentUser.name,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const saveRoomDetails = (roomData: Partial<Room> & { id: string }) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomData.id ? { ...r, ...roomData } : r)),
    );

    const { id, ...rest } = roomData;
    supabase
      .from("rooms")
      .update(mapRoomToDb(rest))
      .eq("id", id)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to save room details in Supabase:",
            error.message,
          );
      });
  };

  const addNewRoom = (roomData: Omit<Room, "id">): void => {
    const tempId = `temp-${Date.now()}`;
    const optimisticRoom: Room = { ...roomData, id: tempId };
    setRooms((prev) => [...prev, optimisticRoom]);

    supabase
      .from("rooms")
      .insert(mapRoomToDb(roomData))
      .select()
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Failed to add room in Supabase:", error?.message);
          setRooms((prev) => prev.filter((r) => r.id !== tempId));
          alert(
            language === "KM"
              ? "មិនអាចបន្ថែមបន្ទប់បានទេ។ សូមព្យាយាមម្តងទៀត។"
              : "Failed to add room. Please try again.",
          );
          return;
        }
        const realRoom = mapRoomFromDb(data);
        setRooms((prev) => prev.map((r) => (r.id === tempId ? realRoom : r)));
      });
  };

  const addRoomCategory = (categoryData: Omit<RoomCategory, "id">): void => {
    const tempId = `temp-cat-${Date.now()}`;
    const optimisticCategory: RoomCategory = { ...categoryData, id: tempId };
    setRoomCategories((prev) => [...prev, optimisticCategory]);

    supabase
      .from("room_categories")
      .insert(mapCategoryToDb(categoryData))
      .select()
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error(
            "Failed to add room category in Supabase:",
            error?.message,
          );
          setRoomCategories((prev) => prev.filter((c) => c.id !== tempId));
          alert(
            language === "KM"
              ? "មិនអាចបន្ថែមប្រភេទបន្ទប់បានទេ។ សូមព្យាយាមម្តងទៀត។"
              : "Failed to add room category. Please try again.",
          );
          return;
        }
        const realCategory = mapCategoryFromDb(data);
        setRoomCategories((prev) =>
          prev.map((c) => (c.id === tempId ? realCategory : c)),
        );
      });
  };
    const deleteRoom = (roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    if (targetRoom.status === 'OCCUPIED' || targetRoom.currentReservationId) {
      alert(language === 'KM'
        ? 'មិនអាចលុបបន្ទប់នេះបានទេ ព្រោះមានភ្ញៀវកំពុងស្នាក់នៅ។'
        : 'This room cannot be deleted because a guest is currently checked in.');
      return;
    }

    const hasActiveReservation = reservations.some(r => r.room_id === roomId && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN'));
    if (hasActiveReservation) {
      alert(language === 'KM'
        ? 'មិនអាចលុបបន្ទប់នេះបានទេ ព្រោះមានការកក់សកម្មភ្ជាប់នឹងបន្ទប់នេះ។'
        : 'This room cannot be deleted because it has an active reservation linked to it.');
      return;
    }

    const removedRoom = targetRoom;
    setRooms(prev => prev.filter(r => r.id !== roomId));

    supabase.from('rooms').delete().eq('id', roomId).then(({ error }) => {
      if (error) {
        console.error('Failed to delete room in Supabase:', error.message);
        setRooms(prev => [...prev, removedRoom]);
        alert(language === 'KM'
          ? 'មិនអាចលុបបន្ទប់បានទេ។ សូមព្យាយាមម្តងទៀត។'
          : 'Failed to delete room. Please try again.');
        return;
      }
      logActivity({
        type: 'ROOM_STATUS',
        descriptionEn: `Room ${removedRoom.number} was deleted`,
        descriptionKm: `បន្ទប់ ${removedRoom.number} ត្រូវបានលុប`,
        staffName: currentUser.name,
        timestamp: new Date().toISOString()
      });
    });
  };

  const updateRoomCategory = (
    categoryId: string,
    updatedData: Partial<RoomCategory>,
  ) => {
    setRoomCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updatedData } : c)),
    );

    supabase
      .from("room_categories")
      .update(mapCategoryToDb(updatedData))
      .eq("id", categoryId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to update room category in Supabase:",
            error.message,
          );
      });
  };

  const deleteRoomCategory = (categoryId: string) => {
    const inUse = rooms.some((r) => {
      const cat = roomCategories.find((c) => c.id === categoryId);
      return cat && r.type === cat.code;
    });
    if (inUse) {
      alert(
        language === "KM"
          ? "មិនអាចលុបប្រភេទបន្ទប់នេះបានទេ ព្រោះមានបន្ទប់កំពុងប្រើប្រភេទនេះ។"
          : "This category cannot be deleted because one or more rooms are still using it.",
      );
      return;
    }

    const removedCategory = roomCategories.find((c) => c.id === categoryId);
    setRoomCategories((prev) => prev.filter((c) => c.id !== categoryId));

    supabase
      .from("room_categories")
      .delete()
      .eq("id", categoryId)
      .then(({ error }) => {
        if (error) {
          console.error(
            "Failed to delete room category in Supabase:",
            error.message,
          );
          if (removedCategory)
            setRoomCategories((prev) => [...prev, removedCategory]);
          alert(
            language === "KM"
              ? "មិនអាចលុបប្រភេទបន្ទប់បានទេ។ សូមព្យាយាមម្តងទៀត។"
              : "Failed to delete room category. Please try again.",
          );
        }
      });
  };

  const refundPayment = (paymentId: string) => {
    if (currentUser.role === "RECEPTIONIST") {
      alert(
        language === "KM"
          ? "បុគ្គលិកទទួលភ្ញៀវមិនមានសិទ្ធិលុប ឬសងប្រាក់វិញទេ។ សូមទាក់ទងប្រធាន ឬអគ្គនាយក។"
          : "Receptionists cannot refund payments. Please contact Front Desk Manager or Admin.",
      );
      return;
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              payment_status: "REFUNDED",
              updated_at: new Date().toISOString(),
            }
          : p,
      ),
    );
    supabase
      .from("payments")
      .update({
        payment_status: "REFUNDED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .then(({ error }) => {
        if (error)
          console.error("Failed to refund payment in Supabase:", error.message);
      });
    const refundedPay = payments.find((p) => p.id === paymentId);
    if (refundedPay) {
      logActivity({
        type: "PAYMENT",
        descriptionEn: `Authorized refund for payment ${refundedPay.id} (${refundedPay.amount} ${refundedPay.currency})`,
        descriptionKm: `បានអនុម័តការសងប្រាក់វិញលើបង្កាន់ដៃ ${refundedPay.id} (${refundedPay.amount} ${refundedPay.currency})`,
        staffName: currentUser.name,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const updateGuest = (guestId: string, updatedData: Partial<Guest>) => {
    const targetGuest = guests.find((g) => g.id === guestId);

    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === guestId) {
          return { ...g, ...updatedData };
        }
        return g;
      }),
    );

    supabase
      .from("guests")
      .update(mapGuestToDb(updatedData))
      .eq("id", guestId)
      .then(({ error }) => {
        if (error)
          console.error("Failed to update guest in Supabase:", error.message);
      });

    // If guest name, room, or dates changed, sync any corresponding active reservation
    setReservations((prev) =>
      prev.map((r) => {
        if (
          r.guest_id === guestId ||
          (r.guest_name &&
            targetGuest &&
            r.guest_name.toLowerCase() === targetGuest.name.toLowerCase())
        ) {
          const nextRoomNumber =
            updatedData.roomNumber !== undefined
              ? updatedData.roomNumber
              : r.room_number;
          const nextCheckIn =
            updatedData.checkInDate !== undefined
              ? updatedData.checkInDate
              : r.check_in_date;
          const nextCheckOut =
            updatedData.checkOutDate !== undefined
              ? updatedData.checkOutDate
              : r.check_out_date;
          const nextGuestName =
            updatedData.name !== undefined ? updatedData.name : r.guest_name;

          let nextPaidKhr = r.paid_amount_khr;
          let nextPaidUsd = r.paid_amount_usd;
          if (updatedData.paidAmountKhr !== undefined)
            nextPaidKhr = updatedData.paidAmountKhr;
          if (updatedData.paidAmountUsd !== undefined)
            nextPaidUsd = updatedData.paidAmountUsd;

          return {
            ...r,
            guest_name: nextGuestName,
            room_number: nextRoomNumber,
            check_in_date: nextCheckIn,
            check_out_date: nextCheckOut,
            paid_amount_khr: nextPaidKhr,
            paid_amount_usd: nextPaidUsd,
          };
        }
        return r;
      }),
    );

    // If room number changed, update room guest mapping
    // If room number changed, properly swap room occupancy: free the old
    // room, occupy the new one, and keep the linked reservation in sync.
    if (updatedData.roomNumber && targetGuest && updatedData.roomNumber !== targetGuest.roomNumber) {
      const oldRoom = rooms.find(room => room.number === targetGuest.roomNumber);
      const newRoom = rooms.find(room => room.number === updatedData.roomNumber);
      const guestDisplayNameForRoom = updatedData.name || targetGuest.name;

      // Find the guest's active (checked-in) reservation to move along with them
      const activeRes = reservations.find(r =>
        r.status === 'CHECKED_IN' &&
        (r.guest_id === guestId || r.guest_name.toLowerCase() === targetGuest.name.toLowerCase())
      );

      if (newRoom) {
        setRooms(prev => prev.map(room => {
          if (room.id === newRoom.id) {
            return { ...room, status: 'OCCUPIED', currentGuestName: guestDisplayNameForRoom, currentReservationId: activeRes?.id };
          }
          if (oldRoom && room.id === oldRoom.id) {
            return { ...room, status: 'AVAILABLE', currentGuestName: undefined, currentReservationId: undefined };
          }
          return room;
        }));

        supabase.from('rooms').update({
          status: 'OCCUPIED',
          current_guest_name: guestDisplayNameForRoom,
          current_reservation_id: activeRes?.id || null,
        }).eq('id', newRoom.id).then(({ error }) => {
          if (error) console.error('Failed to occupy new room in Supabase:', error.message);
        });

        if (oldRoom) {
          supabase.from('rooms').update({
            status: 'AVAILABLE',
            current_guest_name: null,
            current_reservation_id: null,
          }).eq('id', oldRoom.id).then(({ error }) => {
            if (error) console.error('Failed to free old room in Supabase:', error.message);
          });
        }

        // Keep the reservation itself pointing at the correct room
        if (activeRes) {
          setReservations(prev => prev.map(r => r.id === activeRes.id
            ? { ...r, room_id: newRoom.id, room_number: newRoom.number, room_type: newRoom.type }
            : r));
          supabase.from('reservations').update({
            room_id: newRoom.id,
            room_number: newRoom.number,
            room_type: newRoom.type,
          }).eq('id', activeRes.id).then(({ error }) => {
            if (error) console.error('Failed to update reservation room in Supabase:', error.message);
          });
        }
      }
    }



    const guestDisplayName = updatedData.name || targetGuest?.name || "Guest";

        // Auto-correct any linked Telegram message(s) — no manual step needed
    const guestNameForSync = updatedData.name || targetGuest?.name;
    reservations
      .filter(r => (r.guest_id === guestId || (guestNameForSync && r.guest_name.toLowerCase() === guestNameForSync.toLowerCase())) && r.telegramMessageId)
      .forEach(r => {
        const isThisTheReassignedRoom = updatedData.roomNumber && targetGuest && updatedData.roomNumber !== targetGuest.roomNumber && r.status === 'CHECKED_IN';
        const newRoomForSync = isThisTheReassignedRoom ? rooms.find(room => room.number === updatedData.roomNumber) : undefined;
        syncTelegramForReservation({
          ...r,
          guest_name: guestNameForSync || r.guest_name,
          check_in_date: updatedData.checkInDate !== undefined ? updatedData.checkInDate! : r.check_in_date,
          check_out_date: updatedData.checkOutDate !== undefined ? updatedData.checkOutDate! : r.check_out_date,
          room_number: newRoomForSync ? newRoomForSync.number : r.room_number,
        }, updatedData.idCardImage);
      });

    logActivity({
      type: "RESERVATION",
      descriptionEn: `Updated guest details for ${guestDisplayName}${updatedData.roomNumber ? ` (Room ${updatedData.roomNumber})` : ""}`,
      descriptionKm: `បានកែប្រែព័ត៌មានភ្ញៀវ ${guestDisplayName}${updatedData.roomNumber ? ` (បន្ទប់ ${updatedData.roomNumber})` : ""}`,
      staffName: currentUser.name,
      timestamp: new Date().toISOString(),
    });
  };
  

  const addHandoverNote = (data: {
    shift: "MORNING" | "EVENING" | "NIGHT";
    priority: "NORMAL" | "IMPORTANT" | "URGENT";
    roomNumber?: string;
    guestName?: string;
    content: string;
  }) => {
    const tempId = `temp-note-${Date.now()}`;
    const optimisticNote: ShiftHandoverNote = {
      id: tempId,
      shift: data.shift,
      priority: data.priority,
      roomNumber: data.roomNumber,
      guestName: data.guestName,
      content: data.content,
      author: currentUser.name,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    setHandoverNotes((prev) => [optimisticNote, ...prev]);

    supabase
      .from("shift_handover_notes")
      .insert({
        shift: data.shift,
        priority: data.priority,
        room_number: data.roomNumber || null,
        guest_name: data.guestName || null,
        content: data.content,
        author: currentUser.name,
        is_resolved: false,
      })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          console.error(
            "Failed to save handover note in Supabase:",
            error?.message,
          );
          setHandoverNotes((prev) => prev.filter((n) => n.id !== tempId));
          return;
        }
        setHandoverNotes((prev) =>
          prev.map((n) => (n.id === tempId ? mapHandoverFromDb(row) : n)),
        );
      });
  };

  const toggleHandoverNoteResolved = (noteId: string) => {
    const target = handoverNotes.find((n) => n.id === noteId);
    const nextResolved = target ? !target.isResolved : true;
    setHandoverNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, isResolved: nextResolved } : n,
      ),
    );

    supabase
      .from("shift_handover_notes")
      .update({ is_resolved: nextResolved })
      .eq("id", noteId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to update handover note in Supabase:",
            error.message,
          );
      });
  };

  const updateSettings = (newSettings: Partial<HotelSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    supabase
      .from("hotel_settings")
      .update(mapSettingsToDb(newSettings))
      .eq("id", 1)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to update hotel settings in Supabase:",
            error.message,
          );
      });
  };

  return (
    <HotelContext.Provider
      value={{
        currentUser,
        language,
        t,
        staffList,
        rooms,
        roomsLoading,
        roomCategories,
        guests,
        reservations,
        payments,
        activities,
        handoverNotes,
        settings,
        activeReceipt,
        isRecordPaymentOpen,
        isWalkInModalOpen,
        isNewReservationModalOpen,
        isShiftCloseoutOpen,
        selectedCheckInReservation,
        selectedCheckOutReservation,
        selectedVoucherReservation,
        selectedIdGuest,
        selectedEditRoom,
        preselectedWalkInRoomId,
        setLanguage,
        updateOwnProfile,
        isEditProfileOpen,
        selectedTelegramEditReservation,
      openTelegramEditModal,
      closeTelegramEditModal,
        openEditProfileModal,
        closeEditProfileModal,
        switchUser,
        openRecordPaymentModal,
        closeRecordPaymentModal,
        openReceiptModal,
        closeReceiptModal,
        openWalkInModal,
        openWalkInModalWithRoom,
        closeWalkInModal,
        openNewReservationModal,
        closeNewReservationModal,
        openVoucherModal,
        closeVoucherModal,
        openShiftCloseoutModal,
        closeShiftCloseoutModal,
        openEditRoomModal,
        closeEditRoomModal,
        openCheckInModal,
        closeCheckInModal,
        openCheckOutModal,
        closeCheckOutModal,
        openIdViewerModal,
        closeIdViewerModal,
        recordPayment,
        checkInReservation,
        walkInCheckIn,
        updateTelegramNotification,
        addRoomForGuest,
        selectedAddRoomGuest,
        openAddRoomModal,
        closeAddRoomModal,
        createAdvanceReservation,
        cancelReservation,
        checkOutGuest,
        updateRoomStatus,
        saveRoomDetails,
        addNewRoom,
        deleteRoom,
        addRoomCategory,
        updateRoomCategory,
        deleteRoomCategory,
        refundPayment,
        updateGuest,
        addHandoverNote,
        toggleHandoverNoteResolved,
        updateSettings,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
};
