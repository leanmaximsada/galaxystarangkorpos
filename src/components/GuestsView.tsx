import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Guest } from '../types';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import { 
  UserIcon, 
  MagnifyingGlassIcon, 
  IdentificationIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  SparklesIcon, 
  CameraIcon, 
  PrinterIcon, 
  EyeIcon, 
  ShieldCheckIcon,
  PlusIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';
import { IdCaptureModal } from './IdCaptureModal';
import { EditGuestModal } from './EditGuestModal';

export const GuestsView: React.FC = () => {
  const { 
    guests,
    openAddRoomModal, 
    reservations,
    payments,
    updateGuest,
    language, 
    t, 
    openIdViewerModal, 
    openWalkInModal 
  } = useHotel();
  
  const isKhmer = language === 'KM';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNationality, setSelectedNationality] = useState<string>('ALL');

  // Edit Guest Modal State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // ID Capture State for existing guest update
  const [isCaptureOpen, setIsCaptureOpen] = useState<boolean>(false);
  const [captureMode, setCaptureMode] = useState<'CAMERA' | 'SCANNER'>('CAMERA');
  const [targetGuest, setTargetGuest] = useState<Guest | null>(null);

  // Helper to retrieve stay and financial data for each guest
  const getGuestStayDetails = (guest: Guest) => {
    // Look up reservations linked to this guest
    const guestRes = reservations.filter(
      r => r.guest_id === guest.id || 
      (r.guest_name && r.guest_name.toLowerCase().trim() === guest.name.toLowerCase().trim())
    );

    // Latest or active reservation (used for dates/status display)
    const activeRes = guestRes.find(r => r.status === 'CHECKED_IN') || guestRes[0];

    // ALL rooms this guest currently has checked in (covers "Add Room" extras)
    const checkedInRes = guestRes.filter(r => r.status === 'CHECKED_IN');
    const allRoomNumbers = checkedInRes.length > 0
      ? checkedInRes.map(r => r.room_number)
      : [activeRes?.room_number || guest.roomNumber || '101'];

    const roomNumber = activeRes?.room_number || guest.roomNumber || '101';
    const checkInDate = activeRes?.check_in_date || guest.checkInDate || '2026-08-24';
    const checkOutDate = activeRes?.check_out_date || guest.checkOutDate || '2026-08-27';
    const stayStatus = activeRes?.status || (guest.roomNumber ? 'CHECKED_IN' : 'REGISTERED');

    // Calculate total paid across payments table or reservation records
    const guestPayments = payments.filter(
      p => (p.guest_id === guest.id || (p.guest_name && p.guest_name.toLowerCase().trim() === guest.name.toLowerCase().trim())) && 
      p.payment_status === 'PAID'
    );

    let totalPaidUsd = guestPayments
      .filter(p => p.currency === 'USD')
      .reduce((sum, p) => sum + p.amount, 0);

    let totalPaidKhr = guestPayments
      .filter(p => p.currency === 'KHR')
      .reduce((sum, p) => sum + p.amount, 0);

    // Fallback to reservation or direct guest fields if payments record wasn't populated
    if (totalPaidUsd === 0 && totalPaidKhr === 0) {
      if (activeRes) {
        totalPaidUsd = activeRes.paid_amount_usd || 0;
        totalPaidKhr = activeRes.paid_amount_khr || 0;
      } else {
        totalPaidUsd = guest.paidAmountUsd || 0;
        totalPaidKhr = guest.paidAmountKhr || 0;
      }
    }

    return {
      roomNumber,
      allRoomNumbers,
      checkInDate,
      checkOutDate,
      stayStatus,
      totalPaidUsd,
      totalPaidKhr,
      hasReservation: !!activeRes
    };
  };

  // Filter guests
  const filteredGuests = guests.filter((g) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      g.name.toLowerCase().includes(term) ||
      (g.nameKm && g.nameKm.toLowerCase().includes(term)) ||
      g.passportOrId.toLowerCase().includes(term) ||
      g.phone.toLowerCase().includes(term) ||
      (g.email && g.email.toLowerCase().includes(term)) ||
      (g.roomNumber && g.roomNumber.toLowerCase().includes(term));

    const matchesNat = selectedNationality === 'ALL' || g.nationality === selectedNationality;
    return matchesSearch && matchesNat;
  });

  const nationalities = Array.from(new Set(guests.map(g => g.nationality)));

  const handleOpenCaptureForGuest = (guest: Guest, mode: 'CAMERA' | 'SCANNER') => {
    setTargetGuest(guest);
    setCaptureMode(mode);
    setIsCaptureOpen(true);
  };

  const handleCaptureComplete = (imageDataUrl: string, source: 'CAMERA' | 'SCANNER', extractedId?: string) => {
    if (targetGuest) {
      updateGuest(targetGuest.id, {
        idCardImage: imageDataUrl,
        idSource: source,
        idScannedAt: new Date().toISOString(),
        passportOrId: (extractedId && (!targetGuest.passportOrId || targetGuest.passportOrId === 'N/A')) 
          ? extractedId 
          : targetGuest.passportOrId
      });
    }
    setIsCaptureOpen(false);
    setTargetGuest(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#253B73] text-[#C9A96E] flex items-center justify-center border border-[#C9A96E]/30">
              <IdentificationIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111B3A]">
                {t.nav.guests} &amp; {isKhmer ? 'បញ្ជីភ្ញៀវស្នាក់នៅ & ឯកសារសម្គាល់' : 'Guest Registry & Stay Records'}
              </h2>
              <p className="text-xs text-gray-500">
                {isKhmer 
                  ? 'គ្រប់គ្រងព័ត៌មានភ្ញៀវ កាលបរិច្ឆេទ Check-In/Out លេខបន្ទប់ ប្រាក់បានបង់ និងឯកសារសម្គាល់' 
                  : 'Manage guest profiles, check-in/out dates, room assignments, paid amounts & ID files'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openWalkInModal}
            className="px-4 py-2.5 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-[#C9A96E]" />
            <span>{t.checkInOut.walkInCheckIn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ, បន្ទប់, លេខ ID, ទូរស័ព្ទ...' : 'Search by name, room #, ID, phone...'}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <GlobeAltIcon className="w-4 h-4 text-gray-400" />
          <select
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-hidden"
          >
            <option value="ALL">{isKhmer ? 'សញ្ជាតិទាំងអស់' : 'All Nationalities'}</option>
            {nationalities.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGuests.map((guest) => {
          const hasIdCard = !!guest.idCardImage;
          const stay = getGuestStayDetails(guest);

          return (
            <div
              key={guest.id}
              className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Header Info & Edit Button */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#111B3A] to-[#253B73] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {guest.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#111B3A]">{guest.name}</h3>
                      {guest.vipStatus && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D81B73] text-white text-[10px] font-bold flex items-center gap-1">
                          <SolidSparklesIcon className="w-3 h-3 text-[#C9A96E]" />
                          VIP
                        </span>
                      )}
                    </div>
                    {guest.nameKm && (
                      <p className="text-xs text-gray-500 font-medium">{guest.nameKm}</p>
                    )}
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{guest.id}</p>
                  </div>
                </div>

                {/* Edit Guest Info Button */}
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => setEditingGuest(guest)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#253B73] text-slate-700 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title={isKhmer ? 'កែប្រែព័ត៌មានភ្ញៀវ' : 'Edit Guest Information'}
                  >
                    <PencilSquareIcon className="w-4 h-4 text-[#C9A96E]" />
                    <span>{isKhmer ? 'កែប្រែព័ត៌មាន' : 'Edit Info'}</span>
                  </button>
                  {stay.stayStatus === 'CHECKED_IN' && (
                    <button
                      onClick={() => openAddRoomModal(guest)}
                      className="px-3 py-1.5 rounded-xl bg-[#FBF7EF] hover:bg-[#B08C4F] border border-[#EAD9AF] text-[#6E5630] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title={isKhmer ? 'បន្ថែមបន្ទប់សម្រាប់ភ្ញៀវនេះ' : 'Add another room for this guest'}
                    >
                      + {isKhmer ? 'បន្ថែមបន្ទប់' : 'Add Room'}
                    </button>
                  )}
                </div>
              </div>

              {/* STAY DETAILS: Room Number, Check-In Date, Check-Out Date, Money Paid */}
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-gray-200/90 space-y-2.5">
                
                {/* Room Number & Status row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {stay.allRoomNumbers.map((num: string, idx: number) => (
                        <div key={`${num}-${idx}`} className="px-2.5 py-1 rounded-xl bg-[#253B73] text-white flex items-center gap-1.5 shadow-2xs">
                          <BuildingOffice2Icon className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span className="text-xs font-mono font-extrabold">{isKhmer ? 'បន្ទប់' : 'Room'} {num}</span>
                        </div>
                      ))}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      stay.stayStatus === 'CHECKED_IN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : stay.stayStatus === 'CHECKED_OUT'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {stay.stayStatus === 'CHECKED_IN' ? (isKhmer ? 'កំពុងស្នាក់នៅ' : 'In-House') : 
                       stay.stayStatus === 'CHECKED_OUT' ? (isKhmer ? 'បានចាកចេញ' : 'Departed') : 
                       (isKhmer ? 'បានកក់' : 'Confirmed')}
                    </span>
                  </div>

                  {/* ID Source Badge */}
                  {hasIdCard ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheckIcon className="w-3 h-3 text-emerald-600" />
                      <span>{guest.idSource === 'CAMERA' ? 'Camera ID' : 'Scanner ID'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                      <span>No ID File</span>
                    </span>
                  )}
                </div>

                {/* Check-In & Check-Out Dates */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-gray-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center gap-1">
                      <CalendarDaysIcon className="w-3 h-3 text-emerald-600" />
                      {isKhmer ? 'ថ្ងៃចូល (Check-In)' : 'Date of Check-In'}
                    </span>
                    <span className="font-mono font-bold text-[#111B3A] text-xs">
                      {formatDate(stay.checkInDate, language)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center gap-1">
                      <CalendarDaysIcon className="w-3 h-3 text-[#D81B73]" />
                      {isKhmer ? 'ថ្ងៃចេញ (Check-Out)' : 'Date of Check-Out'}
                    </span>
                    <span className="font-mono font-bold text-[#111B3A] text-xs">
                      {formatDate(stay.checkOutDate, language)}
                    </span>
                  </div>
                </div>

                {/* Money Paid Display */}
                <div className="flex items-center justify-between bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/70">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold">
                    <BanknotesIcon className="w-4 h-4 text-emerald-600" />
                    <span>{isKhmer ? 'ចំនួនប្រាក់បានបង់៖' : 'Money Paid:'}</span>
                  </div>

                  <div className="text-right">
                    {stay.totalPaidUsd > 0 && (
                      <span className="font-mono font-extrabold text-xs text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 block">
                        ${stay.totalPaidUsd.toLocaleString()} USD
                      </span>
                    )}
                    {stay.totalPaidKhr > 0 && (
                      <span className="font-mono font-extrabold text-xs text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 block mt-0.5">
                        {stay.totalPaidKhr.toLocaleString()} KHR
                      </span>
                    )}
                    {stay.totalPaidUsd === 0 && stay.totalPaidKhr === 0 && (
                      <span className="font-mono text-xs font-medium text-gray-500">
                        $0.00 / 0 KHR
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* ID Document Visual Card Showcase */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                    <IdentificationIcon className="w-4 h-4 text-[#253B73]" />
                    {t.checkInOut.passportOrId}:
                  </span>
                  <span className="font-mono font-bold text-[#111B3A] text-xs bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {guest.passportOrId}
                  </span>
                </div>

                {hasIdCard ? (
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div 
                      onClick={() => openIdViewerModal(guest)}
                      className="flex items-center gap-2.5 cursor-pointer group flex-1"
                    >
                      <img 
                        src={guest.idCardImage} 
                        alt="ID Card" 
                        className="w-16 h-10 object-cover rounded-lg border border-slate-300 shadow-2xs group-hover:scale-105 transition-transform" 
                      />
                      <div className="text-[10px] leading-tight">
                        <span className="font-bold text-[#253B73] group-hover:underline flex items-center gap-1">
                          <EyeIcon className="w-3 h-3 text-[#C9A96E]" />
                          {isKhmer ? 'មើលអត្តសញ្ញាណប័ណ្ណច្បាស់' : 'View Full ID Document'}
                        </span>
                        <span className="text-gray-400 block mt-0.5">
                          {guest.idScannedAt ? formatDateTime(guest.idScannedAt, language) : 'Verified at front desk'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openIdViewerModal(guest)}
                      className="px-3 py-1.5 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <EyeIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>{isKhmer ? 'បើកមើល' : 'View'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-gray-400 text-[10px]">
                      {isKhmer ? 'អាចថតរូប ឬស្កេនបញ្ជូលពេលនេះ' : 'Upload or scan ID document:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenCaptureForGuest(guest, 'CAMERA')}
                        className="px-2 py-1 rounded-lg bg-white border border-gray-300 text-[#253B73] hover:bg-[#253B73] hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <CameraIcon className="w-3 h-3" />
                        <span>Camera</span>
                      </button>
                      <button
                        onClick={() => handleOpenCaptureForGuest(guest, 'SCANNER')}
                        className="px-2 py-1 rounded-lg bg-white border border-gray-300 text-slate-800 hover:bg-slate-800 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <PrinterIcon className="w-3 h-3" />
                        <span>Scan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{guest.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GlobeAltIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{guest.nationality}</span>
                </div>
                {guest.email && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {guest.notes && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900">
                  <span className="font-bold">{isKhmer ? 'សម្គាល់៖ ' : 'Notes: '}</span>
                  {guest.notes}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {filteredGuests.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center max-w-md mx-auto">
          <IdentificationIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">
            {isKhmer ? 'រកមិនឃើញភ្ញៀវទេ' : 'No Guests Found'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {isKhmer ? 'សូមសាកល្បងពាក្យស្វែងរកផ្សេង ឬចុះឈ្មោះភ្ញៀវថ្មី។' : 'Try a different search query or register a walk-in guest.'}
          </p>
          <button
            onClick={openWalkInModal}
            className="px-4 py-2 bg-[#253B73] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {t.checkInOut.walkInCheckIn}
          </button>
        </div>
      )}

      {/* ID Capture Modal for updating existing guest */}
      <IdCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => {
          setIsCaptureOpen(false);
          setTargetGuest(null);
        }}
        initialMode={captureMode}
        guestName={targetGuest?.name || 'Guest'}
        onCaptureComplete={handleCaptureComplete}
      />

      {/* Edit Guest Profile & Stay Details Modal */}
      <EditGuestModal
        isOpen={!!editingGuest}
        guest={editingGuest}
        onClose={() => setEditingGuest(null)}
      />
    </div>
  );
};
