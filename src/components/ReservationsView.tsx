import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Reservation, ReservationStatus } from '../types';
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CheckCircleIcon, 
  ArrowRightOnRectangleIcon, 
  DocumentTextIcon, 
  XCircleIcon,
  BanknotesIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  PrinterIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const ReservationsView: React.FC = () => {
  const { 
    reservations, 
    rooms, 
    openNewReservationModal, 
    openCheckInModal, 
    openVoucherModal, 
    openRecordPaymentModal, 
    cancelReservation, 
    language, 
    t 
  } = useHotel();

  const isKhmer = language === 'KM';
  const resText = t.reservationsMgmt;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Key Metrics
  const totalBookings = reservations.length;
  const confirmedBookings = reservations.filter(r => r.status === 'CONFIRMED').length;
  const checkedInBookings = reservations.filter(r => r.status === 'CHECKED_IN').length;
  const todayArrivals = reservations.filter(r => r.check_in_date === todayStr && r.status === 'CONFIRMED').length;

  // Filter reservations
  const filteredReservations = reservations.filter(res => {
    if (statusFilter !== 'ALL' && res.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = res.guest_name.toLowerCase().includes(q);
      const matchId = res.id.toLowerCase().includes(q);
      const matchRoom = res.room_number.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchRoom) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {resText.statusConfirmed}
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {resText.statusCheckedIn}
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            {resText.statusCheckedOut}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            {resText.statusCancelled}
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentBadge = (res: Reservation) => {
    const isKhr = res.currency === 'KHR';
    if (res.payment_status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircleIcon className="w-4 h-4" />
          {resText.fullyPaid}
        </span>
      );
    }
    if (res.payment_status === 'PARTIALLY_PAID') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {resText.depositPaid} (Due: {isKhr ? `៛${res.balance_due_khr.toLocaleString()}` : `$${res.balance_due_usd.toFixed(2)}`})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        {resText.unpaid} ({isKhr ? `៛${res.balance_due_khr.toLocaleString()}` : `$${res.balance_due_usd.toFixed(2)}`})
      </span>
    );
  };

  const handleCancel = (res: Reservation) => {
    const confirmMsg = isKhmer 
      ? `តើអ្នកប្រាកដជាចង់បោះបង់ការកក់លេខ ${res.id} របស់ភ្ញៀវ ${res.guest_name} មែនទេ?` 
      : `Are you sure you want to cancel booking ${res.id} for ${res.guest_name}?`;
    if (window.confirm(confirmMsg)) {
      cancelReservation(res.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarDaysIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            {resText.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {resText.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewReservationModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            {resText.newReservation}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{resText.totalBookings}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalBookings}</p>
          <p className="text-xs text-slate-400 mt-1">All time records</p>
        </div>

        <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-sm">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">{resText.todayArrivals}</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">{todayArrivals}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Expected today</p>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">{resText.confirmedAdvance}</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1">{confirmedBookings}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Ready for check-in</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{resText.inHouseActive}</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">{checkedInBookings}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Currently in rooms</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ, លេខកក់, បន្ទប់...' : 'Search by guest, ID, room #...'}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="ALL">{resText.filterAll}</option>
            <option value="CONFIRMED">{resText.statusConfirmed} ({confirmedBookings})</option>
            <option value="CHECKED_IN">{resText.statusCheckedIn} ({checkedInBookings})</option>
            <option value="CHECKED_OUT">{resText.statusCheckedOut}</option>
            <option value="CANCELLED">{resText.statusCancelled}</option>
          </select>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium self-end sm:self-auto"
          >
            {isKhmer ? 'ជម្រះការស្វែងរក' : 'Clear Search'}
          </button>
        )}
      </div>

      {/* Table of Reservations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">{resText.bookingId}</th>
                <th className="py-3.5 px-4">{resText.guestName}</th>
                <th className="py-3.5 px-4">{resText.room}</th>
                <th className="py-3.5 px-4">{resText.stayDates}</th>
                <th className="py-3.5 px-4">{resText.totalAmount}</th>
                <th className="py-3.5 px-4">{resText.paymentStatus}</th>
                <th className="py-3.5 px-4">{resText.status}</th>
                <th className="py-3.5 px-4 text-right">{resText.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    {resText.noRecords}
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const isKhr = res.currency === 'KHR';
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {res.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{res.guest_name}</div>
                        <div className="text-xs text-slate-400">{res.adults} Adults {res.children > 0 ? `, ${res.children} Ch.` : ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-700 dark:text-amber-400">Room {res.room_number}</span>
                        <div className="text-[11px] text-slate-400">{res.room_type.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{res.check_in_date} &rarr; {res.check_out_date}</div>
                        <div className="text-slate-400 font-semibold">{res.nights} {resText.nights}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {isKhr ? `៛${res.total_amount.toLocaleString()}` : `$${res.total_amount.toFixed(2)}`}
                      </td>
                      <td className="py-3.5 px-4">
                        {getPaymentBadge(res)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(res.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Check in action */}
                          {res.status === 'CONFIRMED' && (
                            <button
                              onClick={() => openCheckInModal(res)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                              title={resText.checkInNow}
                            >
                              {resText.checkInNow}
                            </button>
                          )}

                          {/* Print / View voucher */}
                          <button
                            onClick={() => openVoucherModal(res)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            title={resText.viewVoucher}
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>

                          {/* Cancel Booking */}
                          {res.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancel(res)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                              title={resText.cancelBooking}
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
