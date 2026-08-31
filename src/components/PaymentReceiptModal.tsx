import React from 'react';
import { useHotel } from '../context/HotelContext';
import { formatDate } from '../utils/dateFormatter';
import { BrandLogo } from './BrandLogo';
import { PrinterIcon, XMarkIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const PaymentReceiptModal: React.FC = () => {
  const { activeReceipt, closeReceiptModal, language, t } = useHotel();

  if (!activeReceipt) return null;

  const isKhmer = language === 'KM';
  const isKhr = activeReceipt.currency === 'KHR';

  const formattedAmount = isKhr
    ? `${activeReceipt.amount.toLocaleString()} KHR`
    : `$${activeReceipt.amount.toFixed(2)} USD`;

  const dateObj = new Date(activeReceipt.created_at);
  const formattedDate = formatDate(activeReceipt.created_at, language);
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#C9A96E]/40 flex flex-col max-h-[92vh]">
        {/* Header toolbar (no-print) */}
        <div className="no-print bg-[#111B3A] text-white px-6 py-4 flex items-center justify-between border-b border-[#253B73]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D81B73] animate-pulse"></span>
            <h3 className="font-semibold text-sm tracking-wide text-white">
              {t.receipt.officialReceipt}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#253B73] hover:bg-[#D81B73] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Print Receipt"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span>{t.receipt.print}</span>
            </button>
            <button
              onClick={closeReceiptModal}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-8 overflow-y-auto bg-white print:p-0 print:m-0">
          <div className="border border-gray-200 rounded-xl p-6 bg-[#FAF9F6] shadow-xs relative print:border-none print:shadow-none print:p-0">
            
            {/* Header Brand */}
            <div className="text-center pb-4 border-b border-gray-200">
              <BrandLogo size="md" />
              <p className="text-xs text-gray-500 mt-2">
                {t.receipt.hotelLocation}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">
                {t.receipt.hotelPhone}
              </p>
            </div>

            {/* Official Title & Meta */}
            <div className="py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A96E] block">
                    {t.receipt.officialReceipt}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#111B3A]">
                    {activeReceipt.id}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium text-gray-700">{formattedDate}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{formattedTime}</div>
                </div>
              </div>
            </div>

            {/* Guest & Stay Details */}
            <div className="py-4 space-y-2 border-b border-gray-200 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">{t.receipt.guest}:</span>
                <span className="font-bold text-[#111B3A]">{activeReceipt.guest_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">{t.receipt.reservationNo}:</span>
                <span className="font-mono font-semibold text-gray-800">{activeReceipt.reservation_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">{t.receipt.paymentMethod}:</span>
                <span className="font-bold text-[#253B73]">
                  {activeReceipt.payment_method === 'CASH' ? t.payment.cash : t.payment.bank}
                  {activeReceipt.bank_name && ` (${activeReceipt.bank_name})`}
                </span>
              </div>
              {activeReceipt.transaction_reference && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">{t.payment.transactionRef}:</span>
                  <span className="font-mono text-gray-700">{activeReceipt.transaction_reference}</span>
                </div>
              )}
              {activeReceipt.note && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">{t.payment.note}:</span>
                  <span className="text-gray-700 italic">{activeReceipt.note}</span>
                </div>
              )}
            </div>

            {/* Amount Summary */}
            <div className="py-5 border-b border-gray-200">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  {t.receipt.amountPaid}:
                </span>
                <span className="text-lg font-mono font-extrabold text-[#111B3A]">
                  {formattedAmount}
                </span>
              </div>
            </div>

            {/* Receptionist Signoff */}
            <div className="pt-2 pb-4 text-xs flex justify-between items-center text-gray-600 border-b border-gray-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-500">{t.receipt.receivedBy}:</span>
                <span className="font-bold text-[#111B3A]">{activeReceipt.received_by}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded">
                {t.payment.paid}
              </span>
            </div>

            {/* Footer Blessings */}
            <div className="text-center pt-5 space-y-1">
              <p className="text-xs font-semibold text-[#111B3A]">
                {t.receipt.thankYou}
              </p>
              <p className="text-[11px] text-gray-500 italic">
                {t.receipt.blessing}
              </p>
              <p className="text-[9px] text-gray-400 font-mono pt-2">
                {t.receipt.printedBy} • {activeReceipt.id}
              </p>
            </div>

          </div>
        </div>

        {/* Modal Action Buttons (no-print) */}
        <div className="no-print bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={closeReceiptModal}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {t.receipt.close}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#253B73] hover:bg-[#D81B73] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <PrinterIcon className="w-3.5 h-3.5" />
            <span>{t.receipt.print}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
