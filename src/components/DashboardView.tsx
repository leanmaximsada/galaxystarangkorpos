import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { formatDate } from '../utils/dateFormatter';
import { RoomStatus, Payment, Reservation } from '../types';
import { 
  BanknotesIcon, 
  BuildingOffice2Icon, 
  KeyIcon, 
  UsersIcon, 
  CalendarDaysIcon, 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon, 
  PrinterIcon, 
  PlusIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  ChevronRightIcon,
  ChartBarIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    language, 
    rooms, 
    roomCategories,
    reservations, 
    payments, 
    activities, 
    openRecordPaymentModal, 
    openReceiptModal, 
    openWalkInModal,
    openCheckInModal,
    openCheckOutModal,
    updateRoomStatus,
    t 
  } = useHotel();

  const isKhmer = language === 'KM';
  const [roomFilter, setRoomFilter] = useState<string>('ALL');

  // Pending arrivals and in-house
  const pendingArrivals = reservations.filter(r => r.status === 'CONFIRMED');
  const inHouseGuests = reservations.filter(r => r.status === 'CHECKED_IN');

  // Compute Revenue Separated by Currency (STRICT REQUIREMENT: NEVER COMBINE KHR AND USD)
  const todayKhrRevenue = payments
    .filter(p => p.currency === 'KHR' && p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const todayUsdRevenue = payments
    .filter(p => p.currency === 'USD' && p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  // Cash Payments Breakdown
  const cashKhr = payments
    .filter(p => p.currency === 'KHR' && p.payment_method === 'CASH' && p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashUsd = payments
    .filter(p => p.currency === 'USD' && p.payment_method === 'CASH' && p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  // Bank Payments Breakdown
  const bankKhr = payments
    .filter(p => p.currency === 'KHR' && p.payment_method === 'BANK' && p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const bankUsd = payments
    .filter(p => p.currency === 'USD' && p.payment_method === 'BANK' && p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  // Room Stats
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length;
  const availableByCategory = roomCategories
    .map(cat => ({
      label: isKhmer ? (cat.nameKm || cat.name) : cat.name,
      count: rooms.filter(r => r.status === 'AVAILABLE' && r.type === cat.code).length,
    }))
    .filter(entry => entry.count > 0);
  const cleaningRooms = rooms.filter(r => r.status === 'CLEANING').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length;
  const occupancyPercentage = Math.round((occupiedRooms / totalRooms) * 100);

  const filteredRooms = roomFilter === 'ALL' 
    ? rooms 
    : rooms.filter(r => r.status === roomFilter);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Banner: Step-by-Step Progress & Staff Greeting */}
      <div className="bg-linear-to-r from-[#111B3A] via-[#1a2b5c] to-[#253B73] rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-[#C9A96E]/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-64 h-64 text-[#C9A96E]">
            <polygon points="50,14 53,24 63,24 55,30 58,40 50,34 42,40 45,30 37,24 47,24" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D81B73] text-white text-[10px] font-bold uppercase tracking-wider">
                {isKhmer ? 'ផ្ទាំងគ្រប់គ្រងរហ័ស' : 'FRONT DESK HUB'}
              </span>
              {/* <span className="text-xs text-[#C9A96E] font-medium flex items-center gap-1">
                <SolidSparklesIcon className="w-3.5 h-3.5" />
                {t.hotelName}
              </span> */}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.dashboard.welcome}, {isKhmer ? currentUser.nameKm : currentUser.name}!
            </h2>
            
            {/* <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              {t.stepNotice}
            </p> */}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={openWalkInModal}
              className="px-4 py-2.5 bg-[#D81B73] hover:bg-[#b0135c] text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>{t.checkInOut.walkInCheckIn}</span>
            </button>
            <button
              onClick={openRecordPaymentModal}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 text-[#C9A96E]" />
              <span>{t.dashboard.recordPayment}</span>
            </button>
          </div>
        </div>

        {/* Step Guide Prompt Alert */}
        {/* <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-ping"></span>
            <span className="text-[#C9A96E] font-bold">{isKhmer ? 'ការណែនាំ៖' : 'Instructions:'}</span>
            <span>{t.stepWaiting}</span>
          </div>
        </div> */}
      </div>

      {/* SECTION 1: DUAL-CURRENCY REVENUE & PAYMENT SPLIT (STRICT REQUIREMENT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Today Revenue KHR */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {isKhmer ? 'ចំណូលប្រាក់រៀលថ្ងៃនេះ' : "Today's Revenue (KHR)"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ៛
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#111B3A] font-mono tracking-tight">
            {todayKhrRevenue.toLocaleString()} <span className="text-xs font-semibold text-gray-500">KHR</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">Front Desk Cash &amp; Bank</span>
          </div>
        </div>

        {/* Total Today Revenue USD */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {isKhmer ? 'ចំណូលប្រាក់ដុល្លារថ្ងៃនេះ' : "Today's Revenue (USD)"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#253B73] flex items-center justify-center font-bold text-xs">
              $
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#111B3A] font-mono tracking-tight">
            ${todayUsdRevenue.toFixed(2)} <span className="text-xs font-semibold text-gray-500">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
            <span className="font-semibold text-[#253B73]">Independent Dual Currency</span>
          </div>
        </div>

        {/* Cash Payments Breakdown (KHR & USD) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {t.dashboard.cashPayments}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <BanknotesIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#111B3A] font-mono">
              {cashKhr.toLocaleString()} KHR
            </div>
            <div className="text-sm font-bold text-gray-700 font-mono">
              ${cashUsd.toFixed(2)} USD
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400">
            {isKhmer ? 'ប្រាក់សុទ្ធនៅតុទទួលភ្ញៀវ' : 'Cash drawer collections'}
          </div>
        </div>

        {/* Bank / ABA / POS Breakdown (KHR & USD) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {t.dashboard.bankPayments}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BuildingOffice2Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#111B3A] font-mono">
              {bankKhr.toLocaleString()} KHR
            </div>
            <div className="text-sm font-bold text-gray-700 font-mono">
              ${bankUsd.toFixed(2)} USD
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400">
            {isKhmer ? 'ABA KHQR, ម៉ាស៊ីន POS, ផ្ទេរប្រាក់' : 'ABA KHQR, Visa POS, Transfers'}
          </div>
        </div>

      </div>

      {/* SECTION 2: ROOM OCCUPANCY & OPERATIONS METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Room Occupancy Overview */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#111B3A]">{t.dashboard.roomOccupancy}</h3>
                <p className="text-xs text-gray-500">{occupancyPercentage}% {isKhmer ? 'ស្នាក់នៅសរុប' : 'Total Occupied'}</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-[#253B73] font-bold text-xs rounded-xl border border-blue-100">
                {occupiedRooms} / {totalRooms} {isKhmer ? 'បន្ទប់' : 'Rooms'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex mb-4">
              <div 
                style={{ width: `${(occupiedRooms / totalRooms) * 100}%` }} 
                className="bg-[#111B3A] h-full" 
                title={`Occupied: ${occupiedRooms}`}
              />
              <div 
                style={{ width: `${(cleaningRooms / totalRooms) * 100}%` }} 
                className="bg-amber-400 h-full" 
                title={`Cleaning: ${cleaningRooms}`}
              />
              <div 
                style={{ width: `${(maintenanceRooms / totalRooms) * 100}%` }} 
                className="bg-orange-500 h-full" 
                title={`Maintenance: ${maintenanceRooms}`}
              />
              <div 
                style={{ width: `${(availableRooms / totalRooms) * 100}%` }} 
                className="bg-emerald-500 h-full" 
                title={`Available: ${availableRooms}`}
              />
            </div>

            {/* Status Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="col-span-2 p-2.5 rounded-xl bg-[#EEF6F1]/70 border border-[#DCEEE3]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#234432] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4C9C70]"></span>
                    {t.roomStatus.AVAILABLE}
                  </span>
                  <span className="font-bold font-mono text-[#29523B]">{availableRooms}</span>
                </div>
                {availableByCategory.length > 0 && (
                  <div className="mt-1.5 pl-4.5 space-y-0.5">
                    {availableByCategory.map(entry => (
                      <div key={entry.label} className="flex items-center justify-between text-[11px] text-[#3A8059] font-medium">
                        <span className="truncate pr-2">{entry.label}</span>
                        <span className="font-mono font-bold shrink-0">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#111B3A]/5 border border-[#111B3A]/15 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#111B3A] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#111B3A]"></span>
                  {t.roomStatus.OCCUPIED}
                </span>
                <span className="font-bold font-mono text-[#111B3A]">{occupiedRooms}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-amber-900 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  {t.roomStatus.CLEANING}
                </span>
                <span className="font-bold font-mono text-amber-800">{cleaningRooms}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-orange-900 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  {t.roomStatus.MAINTENANCE}
                </span>
                <span className="font-bold font-mono text-orange-800">{maintenanceRooms}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>{isKhmer ? 'ស្តង់ដារ ៤ ផ្កាយ' : 'Angkor View Luxury Standard'}</span>
            <span className="text-[#C9A96E] font-bold">★ ★ ★ ★</span>
          </div>
        </div>

        {/* Today's Front Desk Operations Queue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111B3A] mb-1">
              {isKhmer ? 'កិច្ចការប្រតិបត្តិការថ្ងៃនេះ' : "Today's Operations Queue"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isKhmer ? 'ការមកដល់ និងការចាកចេញរបស់ភ្ញៀវ' : 'Guest arrivals, departures & front-desk flow'}
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ArrowDownLeftIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111B3A]">{t.dashboard.expectedCheckIns}</p>
                    <p className="text-[11px] text-gray-500">2 VIP Guests Arrived</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-[#111B3A]">2</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                    <ArrowUpRightIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111B3A]">{t.dashboard.expectedCheckOuts}</p>
                    <p className="text-[11px] text-gray-500">1 Departure Completed</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-[#111B3A]">1</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#253B73] flex items-center justify-center">
                    <UsersIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111B3A]">{t.dashboard.inHouseGuests}</p>
                    <p className="text-[11px] text-gray-500">Currently residing</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-[#111B3A]">7</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-gray-400 text-right">
            {isKhmer ? 'ប្រព័ន្ធទទួលភ្ញៀវស្វ័យប្រវត្តិ' : 'Front desk live sync'}
          </div>
        </div>

        {/* Live Reception Activity Log */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#111B3A]">{t.dashboard.recentActivity}</h3>
              <p className="text-xs text-gray-500">{isKhmer ? 'កំណត់ហេតុសកម្មភាពបុគ្គលិក' : 'Audit trail & staff logs'}</p>
            </div>
            <ClockIcon className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1">
            {activities.map((act, idx) => {
              const timeStr = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={act.id || `act-${idx}`} className="p-3 rounded-2xl bg-[#FAF9F6] border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#253B73]">{act.staffName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{timeStr}</span>
                  </div>
                  <p className="text-gray-700 leading-snug">
                    {isKhmer ? act.descriptionKm : act.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION 3: INTERACTIVE ROOM STATUS GRID */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#111B3A]">
                {isKhmer ? 'តារាងស្ថានភាពបន្ទប់សណ្ឋាគារ' : 'Hotel Room Status & Floor Grid'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#111B3A] text-[#C9A96E] text-[10px] font-bold">
                12 Rooms Total
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isKhmer ? 'ចុចលើបន្ទប់ដើម្បីមើលព័ត៌មាន ឬផ្លាស់ប្តូរស្ថានភាពបន្ទប់' : 'Quickly view occupant details or update housekeeping status'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF9F6] p-1 rounded-xl border border-gray-200">
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setRoomFilter(statusKey)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  roomFilter === statusKey
                    ? 'bg-[#111B3A] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {statusKey === 'ALL' 
                  ? t.common.all 
                  : t.roomStatus[statusKey as RoomStatus]}
              </button>
            ))}
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';
            const isAvailable = room.status === 'AVAILABLE';
            const isCleaning = room.status === 'CLEANING';
            const isMaint = room.status === 'MAINTENANCE';

            return (
              <div 
                key={room.id}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md relative ${
                  isOccupied
                    ? 'bg-white border-[#111B3A]/30 ring-1 ring-[#111B3A]/10'
                    : isAvailable
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : isCleaning
                    ? 'bg-amber-50/20 border-amber-200'
                    : 'bg-orange-50/20 border-orange-200'
                }`}
              >
                {/* Top Badge: Room Number & Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-[#111B3A]">
                      {room.number}
                    </span>
                    {room.isVip && (
                      <span className="px-1.5 py-0.5 rounded bg-[#C9A96E]/20 text-[#8d6f35] text-[10px] font-bold flex items-center gap-0.5">
                        ★ VIP
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isOccupied
                      ? 'bg-[#111B3A] text-white'
                      : isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCleaning
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {t.roomStatus[room.status]}
                  </span>
                </div>

                {/* Room Type */}
                <p className="text-xs font-semibold text-[#253B73] line-clamp-1">
                  {t.roomTypes[room.type as keyof typeof t.roomTypes] || room.type}
                </p>

                {/* Price Display: Both KHR & USD */}
                <div className="mt-1 text-xs text-gray-500 font-mono flex items-center gap-2">
                  <span className="font-bold text-gray-700">${room.priceUsd} USD</span>
                  <span className="text-gray-400">/</span>
                  <span>{room.priceKhr.toLocaleString()} KHR</span>
                </div>

                {/* Occupant / Guest Info */}
                {isOccupied && room.currentGuestName && (
                  <div className="mt-3 p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">{isKhmer ? 'ភ្ញៀវស្នាក់នៅ' : 'In-House Guest'}</span>
                    <span className="font-bold text-[#111B3A]">{room.currentGuestName}</span>
                  </div>
                )}

                {/* Quick Housekeeping Status Toggles */}
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Floor {room.floor}</span>
                  <div className="flex gap-1">
                    {room.status !== 'AVAILABLE' && (
                      <button
                        onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                        className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium hover:bg-emerald-200 cursor-pointer"
                        title="Mark Available"
                      >
                        {isKhmer ? 'ទំនេរ' : 'Avail'}
                      </button>
                    )}
                    {room.status !== 'CLEANING' && (
                      <button
                        onClick={() => updateRoomStatus(room.id, 'CLEANING')}
                        className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 cursor-pointer"
                        title="Mark Cleaning"
                      >
                        {isKhmer ? 'សម្អាត' : 'Clean'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: TODAY'S ARRIVALS & FRONT DESK CHECK-IN FLOW */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#111B3A] flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-[#253B73]" />
                <span>{isKhmer ? 'បញ្ជីភ្ញៀវមកដល់ថ្ងៃនេះ' : "Today's Arrivals & Front Desk Check-In"}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D81B73] text-white font-bold text-xs">
                {pendingArrivals.length} Due
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isKhmer ? 'ចុចប៊ូតុង "Check In" ដើម្បីផ្ទៀងផ្ទាត់បន្ទប់ កាតសោរ និងទូទាត់ប្រាក់កក់' : 'Click "Check In" to verify room, assign keycard, and collect deposits'}
            </p>
          </div>

          <button
            onClick={openWalkInModal}
            className="px-4 py-2 bg-linear-to-r from-[#D81B73] to-[#b0135c] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 transition-all flex items-center gap-2 self-start sm:self-auto active:scale-95 cursor-pointer"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>{t.checkInOut.walkInCheckIn}</span>
          </button>
        </div>

        {pendingArrivals.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-[#FAF9F6] rounded-2xl border border-gray-200/80">
            {isKhmer ? 'គ្មានភ្ញៀវរង់ចាំមកដល់ទៀតទេសម្រាប់ថ្ងៃនេះ។' : 'No more pending arrivals for today.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingArrivals.map((res) => {
              const isKhr = res.currency === 'KHR';
              const balanceDue = isKhr ? res.balance_due_khr : res.balance_due_usd;

              return (
                <div 
                  key={res.id}
                  className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/80 hover:border-[#253B73]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[11px] text-[#253B73] bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {res.id}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#111B3A] bg-[#C9A96E]/20 px-2 py-0.5 rounded-md text-[#8c6d32]">
                        Room {res.room_number}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#111B3A]">{res.guest_name}</h4>
                      <p className="text-[11px] text-gray-500">{t.roomTypes[res.room_type as keyof typeof t.roomTypes] || res.room_type} • {res.nights} {t.checkInOut.nights}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-gray-500">{t.payment.balanceDue}:</span>
                      <span className={`font-mono font-bold ${balanceDue > 0 ? 'text-[#D81B73]' : 'text-emerald-700'}`}>
                        {isKhr ? `${res.balance_due_khr.toLocaleString()} KHR` : `$${res.balance_due_usd} USD`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60">
                    <button
                      onClick={() => openCheckInModal(res)}
                      className="w-full py-2 px-3 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>{t.checkInOut.markCheckedIn}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 5: RECENT PAYMENT TRANSACTIONS & PRINTABLE RECEIPTS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#111B3A]">
                {t.dashboard.recentPayments}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D81B73]/10 text-[#D81B73] font-bold text-xs">
                {payments.length} Transactions
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isKhmer ? 'កត់ត្រាដោយបុគ្គលិកទទួលភ្ញៀវ - អាចបោះពុម្ពបង្កាន់ដៃភ្លាមៗ' : 'Recorded by Front Desk Receptionists — Printable Official Receipts'}
            </p>
          </div>

          <button
            onClick={openRecordPaymentModal}
            className="px-3.5 py-2 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5 text-[#D81B73]" />
            <span>{t.dashboard.recordPayment}</span>
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-[#FAF9F6] text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{t.receipt.receiptNo}</th>
                <th className="py-3 px-4">{t.receipt.guest}</th>
                <th className="py-3 px-4">{t.payment.amount}</th>
                <th className="py-3 px-4">{t.payment.paymentMethod}</th>
                <th className="py-3 px-4">{t.payment.receivedBy}</th>
                <th className="py-3 px-4">{t.receipt.dateTime}</th>
                <th className="py-3 px-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => {
                const isKhr = p.currency === 'KHR';
                const formattedAmt = isKhr
                  ? `${p.amount.toLocaleString()} KHR`
                  : `$${p.amount.toFixed(2)} USD`;
                const dateStr = formatDate(p.created_at, language);
                const timeStr = new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111B3A]">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{p.guest_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.reservation_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111B3A]">
                      <span className={`px-2 py-1 rounded-md ${isKhr ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-[#253B73]'}`}>
                        {formattedAmt}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.payment_method === 'CASH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {p.payment_method === 'CASH' ? t.payment.cash : t.payment.bank}
                      </span>
                      {p.bank_name && (
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          {p.bank_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {p.received_by}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {dateStr} • {timeStr}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReceiptModal(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF9F6] hover:bg-[#253B73] text-[#253B73] hover:text-white border border-gray-300 hover:border-transparent rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
                        title={t.receipt.print}
                      >
                        <PrinterIcon className="w-3.5 h-3.5" />
                        <span>{t.payment.printReceipt}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
