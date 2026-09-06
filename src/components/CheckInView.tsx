import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import { Reservation } from '../types';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  KeyIcon, 
  CreditCardIcon, 
  PhoneIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  UsersIcon,
  FunnelIcon,
  ExclamationCircleIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  PrinterIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';

type ViewMode = 'ALL' | 'ARRIVALS' | 'CHECKOUT_READY' | 'DEPARTED';

export const CheckInView: React.FC = () => {
  const { 
    reservations, 
    rooms, 
    guests, 
    payments,
    language, 
    t, 
    openCheckInModal, 
    openCheckOutModal,
    openWalkInModal,
    openIdViewerModal,
    openTelegramEditModal,
    openReceiptModal
  } = useHotel();

  const isKhmer = language === 'KM';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ViewMode>('ALL');

  // Search filter helper
  const filterByQuery = (list: Reservation[]) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(res => 
      res.guest_name.toLowerCase().includes(q) ||
      res.id.toLowerCase().includes(q) ||
      res.room_number.includes(q) ||
      res.room_type.toLowerCase().includes(q)
    );
  };

  // Grouped reservation lists
  const pendingArrivals = filterByQuery(reservations.filter(r => r.status === 'CONFIRMED'));
  const inHouseGuests = filterByQuery(reservations.filter(r => r.status === 'CHECKED_IN'));
  const departedGuests = filterByQuery(reservations.filter(r => r.status === 'CHECKED_OUT'));

  const pendingCount = reservations.filter(r => r.status === 'CONFIRMED').length;
  const inHouseCount = reservations.filter(r => r.status === 'CHECKED_IN').length;
  const departedCount = reservations.filter(r => r.status === 'CHECKED_OUT').length;
  const availableRoomsCount = rooms.filter(r => r.status === 'AVAILABLE').length;

  const formatLeavingTime = (timestamp?: string) => {
    if (!timestamp) return isKhmer ? 'បានចាកចេញ' : 'Departed today';
    try {
      const d = new Date(timestamp);
      return formatDateTime(d.toISOString(), language);
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Banner with Front Desk Overview */}
      <div className="bg-linear-to-r from-[#111B3A] via-[#1a2b5c] to-[#253B73] p-6 rounded-3xl text-white shadow-xl border border-[#C9A96E]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D81B73] text-white text-[10px] font-bold uppercase tracking-wider">
                {isKhmer ? 'តុប្រតិបត្តិការទទួលភ្ញៀវ' : 'FRONT DESK RECEPTION & DISPATCH'}
              </span>
              <span className="text-xs text-[#C9A96E] font-medium flex items-center gap-1">
                <SolidSparklesIcon className="w-3.5 h-3.5" />
                {t.hotelName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isKhmer ? 'ការចូលស្នាក់នៅ & ការចាកចេញ (Check-In & Check-Out)' : 'Check-In Arrivals & Check-Out Departures'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              {isKhmer 
                ? 'គ្រប់គ្រងការចូលស្នាក់នៅ ការទូទាត់ប្រាក់ ព្រមទាំងកត់ត្រាពេលវេលាភ្ញៀវចាកចេញច្បាស់លាស់' 
                : 'Process arrivals, manage room keys, and record exact guest departure times upon check-out'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openWalkInModal}
              className="px-4 py-2.5 bg-linear-to-r from-[#D81B73] to-[#b0135c] hover:brightness-110 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>{t.checkInOut.walkInCheckIn}</span>
            </button>
          </div>
        </div>

        {/* Mini stats counters */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left text-xs">
          <div 
            onClick={() => setActiveTab('ARRIVALS')} 
            className="cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-xl bg-white/5"
          >
            <span className="text-[10px] uppercase font-bold text-gray-300 block">{t.checkInOut.arrivingToday}</span>
            <span className="text-lg font-bold text-[#C9A96E] font-mono">{pendingCount}</span>
          </div>

          <div 
            onClick={() => setActiveTab('CHECKOUT_READY')} 
            className="cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-xl bg-white/5"
          >
            <span className="text-[10px] uppercase font-bold text-gray-300 block">{isKhmer ? 'ភ្ញៀវកំពុងស្នាក់នៅ (អាចចេញ)' : 'In-House (Check-Out)'}</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{inHouseCount}</span>
          </div>

          <div 
            onClick={() => setActiveTab('DEPARTED')} 
            className="cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-xl bg-white/5"
          >
            <span className="text-[10px] uppercase font-bold text-gray-300 block">{isKhmer ? 'បានចាកចេញរួច (Departed)' : 'Departed / Checked Out'}</span>
            <span className="text-lg font-bold text-sky-300 font-mono">{departedCount}</span>
          </div>

          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-300 block">{t.dashboard.availableRooms}</span>
            <span className="text-lg font-bold text-white font-mono">{availableRoomsCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះភ្ញៀវ, លេខបន្ទប់, លេខកក់...' : 'Search by guest name, room #, reservation ID...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAF9F6] text-xs font-medium focus:ring-2 focus:ring-[#253B73] focus:bg-white focus:outline-hidden transition-all"
          />
        </div>

        {/* Section Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#111B3A] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isKhmer ? 'ទាំងអស់ (All Flow)' : 'All Flow'} ({reservations.length})
          </button>

          <button
            onClick={() => setActiveTab('ARRIVALS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ARRIVALS'
                ? 'bg-[#D81B73] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserPlusIcon className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'ភ្ញៀវត្រូវចូល' : 'Arrivals'} ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('CHECKOUT_READY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CHECKOUT_READY'
                ? 'bg-[#253B73] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{isKhmer ? 'ភ្ញៀវត្រូវចេញ (Check-Out)' : 'Check-Out Section'} ({inHouseCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPARTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DEPARTED'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'បានចាកចេញ' : 'Departed Log'} ({departedCount})</span>
          </button>
        </div>
      </div>

      {/* 1. ARRIVALS SECTION (Pending Check-In) */}
      {(activeTab === 'ALL' || activeTab === 'ARRIVALS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111B3A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D81B73]" />
              <span>{isKhmer ? 'ភ្ញៀវរង់ចាំ Check-In (Expected Arrivals)' : 'Expected Check-In Arrivals'}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#D81B73]/10 text-[#D81B73] text-xs font-bold">
                {pendingArrivals.length}
              </span>
            </h3>
          </div>

          {pendingArrivals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center max-w-md mx-auto space-y-2">
              <ClockIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">
                {isKhmer ? 'គ្មានភ្ញៀវរង់ចាំ Check-In ទេ' : 'No Pending Arrivals'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingArrivals.map((res) => {
                const isKhr = res.currency === 'KHR';
                const balanceDue = isKhr ? res.balance_due_khr : res.balance_due_usd;
                const room = rooms.find(r => r.id === res.room_id) || rooms.find(r => r.number === res.room_number);
                const guestObj = guests.find(g => g.id === res.guest_id || g.name === res.guest_name);

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#111B3A]">{res.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {isKhmer ? 'រង់ចាំមកដល់' : 'Expected'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#111B3A] mt-1">{res.guest_name}</h3>
                        </div>

                        <div className="text-right">
                          <div className="w-12 h-12 rounded-2xl bg-[#253B73] text-white flex flex-col items-center justify-center shadow-xs">
                            <span className="text-[9px] uppercase font-bold text-[#C9A96E]">ROOM</span>
                            <span className="text-sm font-extrabold font-mono leading-none">{res.room_number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stay Period & Details */}
                      <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-gray-700 font-semibold">
                          <span className="text-[#253B73]">{t.roomTypes[res.room_type as keyof typeof t.roomTypes] || res.room_type}</span>
                          <span className="text-gray-400">Floor {room?.floor || 1}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                          <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{formatDate(res.check_in_date, language)} → {formatDate(res.check_out_date, language)} ({res.nights} {t.checkInOut.nights})</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                          <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{res.adults} {t.checkInOut.adults}{res.children > 0 ? `, ${res.children} ${t.checkInOut.children}` : ''}</span>
                        </div>
                      </div>

                      {/* Financial breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t.checkInOut.totalCost}</span>
                          <span className="font-mono font-bold text-[#111B3A]">
                            {isKhr ? `${res.total_amount.toLocaleString()} KHR` : `$${res.total_amount} USD`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t.payment.balanceDue}</span>
                          <span className={`font-mono font-bold ${balanceDue > 0 ? 'text-[#D81B73]' : 'text-emerald-600'}`}>
                            {isKhr ? `${res.balance_due_khr.toLocaleString()} KHR` : `$${res.balance_due_usd} USD`}
                          </span>
                        </div>
                      </div>

                      {guestObj?.idCardImage && (
                        <button
                          onClick={() => openIdViewerModal(guestObj)}
                          className="w-full p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isKhmer ? 'អត្តសញ្ញាណប័ណ្ណភ្ជាប់រួច' : 'Scanned ID Card Attached'}</span>
                          </span>
                          <EyeIcon className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50/80 border-t border-gray-100">
                      <button
                        onClick={() => openCheckInModal(res)}
                        className="w-full py-2.5 px-4 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                      >
                        <UserPlusIcon className="w-4 h-4 text-[#C9A96E]" />
                        <span>{t.checkInOut.markCheckedIn}</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. CHECK-OUT SECTION ON THE CHECK-IN PAGE (In-House Guests Ready for Departure) */}
      {(activeTab === 'ALL' || activeTab === 'CHECKOUT_READY') && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#253B73] flex items-center gap-2">
                <ArrowRightOnRectangleIcon className="w-4 h-4 text-[#D81B73]" />
                <span>{isKhmer ? 'ផ្នែកចាកចេញ & បញ្ចប់ការស្នាក់នៅ (Check-Out Section)' : 'Check-Out & Departure Section'}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#253B73]/10 text-[#253B73] text-xs font-bold">
                  {inHouseGuests.length}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {isKhmer ? 'ទូទាត់សមតុល្យចុងក្រោយ ទទួលកាតសោរ និងកត់ត្រាពេលភ្ញៀវចាកចេញ' : 'Process guest departures directly from here, settle folios, collect keycards & record leaving time'}
              </p>
            </div>
          </div>

          {inHouseGuests.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center max-w-md mx-auto space-y-2">
              <CheckCircleIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">
                {isKhmer ? 'គ្មានភ្ញៀវកំពុងស្នាក់នៅដែលត្រូវចាកចេញទេ' : 'No in-house guests currently available for check-out'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inHouseGuests.map((res) => {
                const isKhr = res.currency === 'KHR';
                const balanceDue = isKhr ? res.balance_due_khr : res.balance_due_usd;
                const room = rooms.find(r => r.id === res.room_id) || rooms.find(r => r.number === res.room_number);
                const guestObj = guests.find(g => g.id === res.guest_id || g.name === res.guest_name);

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl border border-emerald-200/80 bg-emerald-50/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#111B3A]">{res.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              {isKhmer ? 'កំពុងស្នាក់នៅ' : 'In-House'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#111B3A] mt-1">{res.guest_name}</h3>
                        </div>

                        <div className="text-right">
                          <div className="w-12 h-12 rounded-2xl bg-[#253B73] text-white flex flex-col items-center justify-center shadow-xs">
                            <span className="text-[9px] uppercase font-bold text-[#C9A96E]">ROOM</span>
                            <span className="text-sm font-extrabold font-mono leading-none">{res.room_number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stay Period & Details */}
                      <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-gray-700 font-semibold">
                          <span className="text-[#253B73]">{t.roomTypes[res.room_type as keyof typeof t.roomTypes] || res.room_type}</span>
                          <span className="text-gray-400">Floor {room?.floor || 1}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                          <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{formatDate(res.check_in_date, language)} → {formatDate(res.check_out_date, language)} ({res.nights} {t.checkInOut.nights})</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-gray-500 font-medium">
                            {isKhmer ? 'កាតសោរបន្ទប់៖' : 'Key Card:'}
                          </span>
                          <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            CARD-{res.room_number}
                          </span>
                        </div>
                      </div>

                      {/* Financial Status Breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t.checkInOut.totalCost}</span>
                          <span className="font-mono font-bold text-[#111B3A]">
                            {isKhr ? `${res.total_amount.toLocaleString()} KHR` : `$${res.total_amount} USD`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t.payment.balanceDue}</span>
                          <span className={`font-mono font-bold ${balanceDue > 0 ? 'text-[#D81B73]' : 'text-emerald-600'}`}>
                            {isKhr ? `${res.balance_due_khr.toLocaleString()} KHR` : `$${res.balance_due_usd} USD`}
                          </span>
                        </div>
                      </div>

                      {guestObj?.idCardImage && (
                        <button
                          onClick={() => openIdViewerModal(guestObj)}
                          className="w-full p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-slate-600" />
                            <span>{isKhmer ? 'មើលអត្តសញ្ញាណប័ណ្ណ' : 'View Verified ID'}</span>
                          </span>
                          <EyeIcon className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      )}
                      
                    </div>

                    {/* Check-Out Trigger Button */}
                    <div className="p-4 bg-gray-50/80 border-t border-gray-100">
                      <button
                        onClick={() => openCheckOutModal(res)}
                        className="w-full py-2.5 px-4 bg-linear-to-r from-[#D81B73] to-[#b0135c] hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-[#C9A96E]" />
                        <span>{isKhmer ? 'ចាកចេញ & ទូទាត់សមតុល្យ (Check-Out)' : 'Process Check-Out & Settle'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. DEPARTED GUESTS & CHECK-OUT HISTORY (Stored Record of When They Left) */}
      {(activeTab === 'ALL' || activeTab === 'DEPARTED') && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-sky-600" />
                <span>{isKhmer ? 'កំណត់ត្រាភ្ញៀវដែលបានចាកចេញ (Departed Guest Records)' : 'Completed Departures & Departure Time Registry'}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                  {departedGuests.length}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {isKhmer ? 'កត់ត្រាកាលបរិច្ឆេទ និងពេលវេលាជាក់ស្តែងដែលភ្ញៀវបានចាកចេញពីសណ្ឋាគារ' : 'Stored timestamps and settled invoices recorded when guests depart'}
              </p>
            </div>
          </div>

          {departedGuests.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center max-w-md mx-auto space-y-2">
              <ClockIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">
                {isKhmer ? 'មិនទាន់មានភ្ញៀវចាកចេញនៅថ្ងៃនេះទេ' : 'No departures recorded today yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departedGuests.map((res) => {
                const isKhr = res.currency === 'KHR';
                const relatedPayment = payments.find(p => p.reservation_id === res.id);

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700">{res.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {isKhmer ? 'បានចាកចេញ' : 'Checked Out'}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#111B3A] mt-1">{res.guest_name}</h4>
                        </div>

                        <div className="text-right">
                          <div className="w-12 h-12 rounded-2xl bg-slate-700 text-white flex flex-col items-center justify-center shadow-xs">
                            <span className="text-[9px] uppercase font-bold text-[#C9A96E]">ROOM</span>
                            <span className="text-sm font-extrabold font-mono leading-none">{res.room_number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stored Departure Timestamp Box */}
                      <div className="mt-3 bg-sky-50/70 p-3 rounded-2xl border border-sky-200/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-sky-950 font-bold">
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4 text-sky-700" />
                            {isKhmer ? 'ពេលវេលាចាកចេញជាក់ស្តែង៖' : 'Actual Departure Time:'}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-sky-900 block pl-5.5">
                          {formatLeavingTime(res.actual_check_out_time || res.created_at)}
                        </span>
                      </div>

                      {/* Stay Period & Bill Settle */}
                      <div className="mt-2 text-xs text-gray-600 space-y-1 bg-[#FAF9F6] p-2.5 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">{isKhmer ? 'កាលបរិច្ឆេទស្នាក់នៅ៖' : 'Stay Period:'}</span>
                          <span className="font-mono font-medium text-gray-800">{formatDate(res.check_in_date, language)} → {formatDate(res.check_out_date, language)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <span className="text-gray-400">{isKhmer ? 'ប្រាក់ទូទាត់សរុប៖' : 'Total Settled:'}</span>
                          <span className="font-mono font-bold text-emerald-700">
                            {isKhr ? `${res.total_amount.toLocaleString()} KHR (PAID)` : `$${res.total_amount} USD (PAID)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Receipt / Folio */}
                    {relatedPayment && (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={() => openReceiptModal(relatedPayment)}
                          className="w-full py-2 px-3 bg-slate-100 hover:bg-[#253B73] hover:text-white text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PrinterIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>{isKhmer ? 'មើលបង្កាន់ដៃ / Folio Receipt' : 'View Settled Receipt'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
