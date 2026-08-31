import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import { 
  ArrowRightOnRectangleIcon, 
  MagnifyingGlassIcon, 
  KeyIcon, 
  CalendarDaysIcon, 
  CreditCardIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  SparklesIcon, 
  UsersIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';

export const CheckOutView: React.FC = () => {
  const { 
    reservations, 
    rooms, 
    guests,
    language, 
    t, 
    openCheckOutModal,
    openIdViewerModal 
  } = useHotel();

  const isKhmer = language === 'KM';
  const [searchQuery, setSearchQuery] = useState<string>('');

  // In-house reservations only
  const inHouseReservations = reservations.filter(r => r.status === 'CHECKED_IN');

  const filteredList = inHouseReservations.filter(res => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      res.guest_name.toLowerCase().includes(q) ||
      res.id.toLowerCase().includes(q) ||
      res.room_number.includes(q)
    );
  });

  // Guest history — everyone who has already checked out, most recent first
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const checkedOutReservations = reservations
    .filter(r => r.status === 'CHECKED_OUT')
    .sort((a, b) => new Date(b.actual_check_out_time || b.check_out_date).getTime() - new Date(a.actual_check_out_time || a.check_out_date).getTime());

  const filteredHistory = checkedOutReservations.filter(res => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      res.guest_name.toLowerCase().includes(q) ||
      res.id.toLowerCase().includes(q) ||
      res.room_number.includes(q)
    );
  }).slice(0, 50);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Banner */}
      <div className="bg-linear-to-r from-[#111B3A] via-[#1a2b5c] to-[#253B73] p-6 rounded-3xl text-white shadow-xl border border-[#C9A96E]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#253B73] border border-[#C9A96E]/40 text-[#C9A96E] text-[10px] font-bold uppercase tracking-wider">
                {isKhmer ? 'តុទទួលភ្ញៀវចាកចេញ' : 'FRONT DESK CHECK-OUT'}
              </span>
              <span className="text-xs text-gray-300 font-medium flex items-center gap-1">
                <SolidSparklesIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                {t.hotelName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.checkInOut.checkOutTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              {t.checkInOut.checkOutSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-white/10 rounded-2xl border border-white/20 text-xs flex items-center gap-2">
              <span className="text-gray-300 font-medium">{t.checkInOut.inHouseGuests}:</span>
              <span className="text-base font-bold font-mono text-[#C9A96E]">{inHouseReservations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះភ្ញៀវ ឬលេខបន្ទប់...' : 'Search by guest name or room number...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAF9F6] text-xs font-medium focus:ring-2 focus:ring-[#253B73] focus:bg-white focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* In-House Guests List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center max-w-md mx-auto shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-[#111B3A]">
            {isKhmer ? 'គ្មានភ្ញៀវត្រូវចាកចេញទេ' : 'No In-House Guests Found'}
          </h4>
          <p className="text-xs text-gray-500">
            {isKhmer ? 'មិនមានភ្ញៀវកំពុងស្នាក់នៅដែលត្រូវនឹងការស្វែងរកនេះឡើយ។' : 'No guests currently in-house match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((res) => {
            const isKhr = res.currency === 'KHR';
            const balanceDue = isKhr ? res.balance_due_khr : res.balance_due_usd;
            const hasDue = balanceDue > 0;
            const room = rooms.find(r => r.id === res.room_id) || rooms.find(r => r.number === res.room_number);
            const guestObj = guests.find(g => g.id === res.guest_id || g.name === res.guest_name);

            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#111B3A]">{res.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#253B73]">
                          Room {res.room_number}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#111B3A] mt-1">{res.guest_name}</h3>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                        hasDue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {hasDue 
                          ? `Due: ${isKhr ? `${res.balance_due_khr.toLocaleString()} KHR` : `$${res.balance_due_usd} USD`}` 
                          : 'Settled'}
                      </span>
                    </div>
                  </div>

                  {/* Stay Details */}
                  <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-gray-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-gray-700 font-semibold">
                      <span className="text-[#253B73]">{t.roomTypes[res.room_type as keyof typeof t.roomTypes] || res.room_type}</span>
                      <span className="text-gray-400">Floor {room?.floor || 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(res.check_in_date, language)} → {formatDate(res.check_out_date, language)} ({res.nights} {t.checkInOut.nights})</span>
                    </div>
                  </div>

                  {/* ID card preview if attached */}
                  {guestObj?.idCardImage && (
                    <button
                      onClick={() => openIdViewerModal(guestObj)}
                      className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <KeyIcon className="w-3.5 h-3.5 text-[#253B73]" />
                        <span>ID / Passport: {guestObj.passportOrId}</span>
                      </span>
                      <EyeIcon className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}

                  {/* Payment Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t.payment.paid}</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {isKhr ? `${res.paid_amount_khr.toLocaleString()} KHR` : `$${res.paid_amount_usd} USD`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t.payment.balanceDue}</span>
                      <span className={`font-mono font-bold ${hasDue ? 'text-[#D81B73]' : 'text-gray-600'}`}>
                        {isKhr ? `${res.balance_due_khr.toLocaleString()} KHR` : `$${res.balance_due_usd} USD`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 border-t border-gray-100">
                  <button
                    onClick={() => openCheckOutModal(res)}
                    className="w-full py-2.5 px-4 bg-[#D81B73] hover:bg-[#b0135c] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>{t.checkInOut.expressCheckOut}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guest History — past guests who've already checked out */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-[#8C6E3D]" />
            <h3 className="text-sm font-bold text-[#111B3A]">
              {isKhmer ? 'ប្រវត្តិភ្ញៀវ (បានចាកចេញរួច)' : 'Guest History (Checked-Out)'}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#F5EDD9] text-[#6E5630] text-[10px] font-bold">
              {checkedOutReservations.length}
            </span>
          </div>
          <ArrowRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
        </button>

        {showHistory && (
          <div className="border-t border-gray-100 divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <p className="p-6 text-center text-xs text-gray-400">
                {isKhmer ? 'មិនទាន់មានប្រវត្តិភ្ញៀវនៅឡើយទេ។' : 'No guest history yet.'}
              </p>
            ) : (
              filteredHistory.map(res => {
                const isKhr = res.currency === 'KHR';
                const guestObj = guests.find(g => g.id === res.guest_id || g.name === res.guest_name);
                const checkoutTime = res.actual_check_out_time ? new Date(res.actual_check_out_time) : null;

                return (
                  <div key={res.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/60">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#111B3A] truncate">{res.guest_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 shrink-0">
                          Room {res.room_number}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-3 h-3" />
                        <span>{formatDate(res.check_in_date, language)} → {formatDate(res.check_out_date, language)}</span>
                        {res.actual_check_out_time && (
                          <span className="text-gray-400">
                            · Checked out {formatDateTime(res.actual_check_out_time, language)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-semibold">{t.payment.paid}</span>
                        <span className="font-mono text-xs font-bold text-[#3A8059]">
                          {isKhr ? `${res.paid_amount_khr.toLocaleString()} KHR` : `$${res.paid_amount_usd} USD`}
                        </span>
                      </div>
                      {guestObj?.idCardImage && (
                        <button
                          onClick={() => openIdViewerModal(guestObj)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="View ID"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

    </div>
  );
};
