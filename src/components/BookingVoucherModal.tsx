import React, { useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { Reservation } from '../types';
import { 
  XMarkIcon, 
  PrinterIcon, 
  CheckCircleIcon, 
  CalendarDaysIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  PhoneIcon, 
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface BookingVoucherModalProps {
  reservation: Reservation | null;
  onClose: () => void;
}

export const BookingVoucherModal: React.FC<BookingVoucherModalProps> = ({ reservation, onClose }) => {
  const { language, t, settings } = useHotel();
  const printRef = useRef<HTMLDivElement>(null);

  if (!reservation) return null;

  const isKhmer = language === 'KM';
  const isKhr = reservation.currency === 'KHR';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <BuildingOfficeIcon className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isKhmer ? 'ប័ណ្ណបញ្ជាក់ការកក់បន្ទប់ផ្លូវការ' : 'Official Hotel Booking Voucher'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PrinterIcon className="w-4 h-4" />
              {isKhmer ? 'បោះពុម្ពប័ណ្ណ' : 'Print Voucher'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Printable Content */}
        <div ref={printRef} className="p-8 space-y-6 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          {/* Header Banner */}
          <div className="border-b-2 border-amber-500 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-amber-700 dark:text-amber-400">
                  {settings.nameEn}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-khmer mt-0.5">
                {settings.nameKm}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {settings.locationEn}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Tel: {settings.phone} | VAT: {settings.vatNumber}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                Booking Voucher
              </span>
              <p className="text-base font-mono font-bold text-slate-900 dark:text-white mt-2">
                {reservation.id}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Issued: {new Date(reservation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Status & Confirmation Alert */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {reservation.status === 'CONFIRMED' ? 'Reservation Confirmed & Guaranteed' : `Status: ${reservation.status}`}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Your room is locked and prepared for your arrival in Siem Reap.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                reservation.payment_status === 'PAID'
                  ? 'bg-emerald-200 text-emerald-900'
                  : reservation.payment_status === 'PARTIALLY_PAID'
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-rose-200 text-rose-900'
              }`}>
                {reservation.payment_status === 'PAID' ? 'FULLY PAID' : reservation.payment_status === 'PARTIALLY_PAID' ? 'DEPOSIT PAID' : 'PAY ON ARRIVAL'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Guest Information
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {reservation.guest_name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Party: {reservation.adults} Adult(s){reservation.children > 0 ? `, ${reservation.children} Child(ren)` : ''}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Booked by: {reservation.created_by}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Room Allocation
              </p>
              <p className="text-base font-bold text-amber-700 dark:text-amber-400 mt-1">
                Room {reservation.room_number}
              </p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                {reservation.room_type.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                WiFi: {settings.wifiSsid} (Pass: {settings.wifiPass})
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Check-In Date
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {reservation.check_in_date}
              </p>
              <p className="text-xs text-slate-500">From {settings.checkInTime} PM</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Check-Out Date
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {reservation.check_out_date}
              </p>
              <p className="text-xs text-slate-500">Until {settings.checkOutTime} PM ({reservation.nights} Night{reservation.nights > 1 ? 's' : ''})</p>
            </div>
          </div>

          {/* Pricing & Deposit Folio Summary */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-semibold text-xs text-slate-700 dark:text-slate-300">
              Billing Breakdown (Dual Currency Guarded)
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Room Rate ({reservation.nights} Night(s)):</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {isKhr ? `៛${reservation.total_amount.toLocaleString()}` : `$${reservation.total_amount.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>Advance Deposit Paid:</span>
                <span>
                  {isKhr 
                    ? `៛${reservation.paid_amount_khr.toLocaleString()}` 
                    : `$${reservation.paid_amount_usd.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-base text-slate-900 dark:text-white">
                <span>Balance Due at Check-In:</span>
                <span className={reservation.balance_due_khr > 0 || reservation.balance_due_usd > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {isKhr 
                    ? `៛${reservation.balance_due_khr.toLocaleString()} KHR` 
                    : `$${reservation.balance_due_usd.toFixed(2)} USD`}
                </span>
              </div>
            </div>
          </div>

          {/* Special Requests if any */}
          {reservation.special_requests && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200">Special Notes: </span>
              <span className="text-amber-800 dark:text-amber-300">{reservation.special_requests}</span>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 space-y-1">
            <p>{settings.receiptFooterNoteEn}</p>
            <p className="font-khmer">{settings.receiptFooterNoteKm}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
