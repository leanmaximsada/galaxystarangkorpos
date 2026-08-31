import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Currency, PaymentMethod } from '../types';
import { 
  XMarkIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BuildingOffice2Icon, 
  HashtagIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

export const RecordPaymentModal: React.FC = () => {
  const { 
    isRecordPaymentOpen, 
    closeRecordPaymentModal, 
    currentUser, 
    reservations, 
    recordPayment, 
    openReceiptModal, 
    t 
  } = useHotel();

  const [selectedResId, setSelectedResId] = useState<string>('RES-2026-00125');
  const [guestName, setGuestName] = useState<string>('John Smith');
  const [amount, setAmount] = useState<string>('200000');
  const [currency, setCurrency] = useState<Currency>('KHR');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [bankName, setBankName] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isRecordPaymentOpen) return null;

  const handleReservationChange = (resId: string) => {
    setSelectedResId(resId);
    const found = reservations.find(r => r.id === resId);
    if (found) {
      setGuestName(found.guest_name);
      setCurrency(found.currency);
      const remainingBalance = found.currency === 'KHR' ? found.balance_due_khr : found.balance_due_usd;
      if (remainingBalance > 0) {
        setAmount(String(remainingBalance));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(t.payment.validationError);
      return;
    }

    if (paymentMethod === 'BANK' && !bankName.trim() && !transactionRef.trim()) {
      setErrorMsg(t.payment.bankRequiredError);
      return;
    }

    const savedPayment = recordPayment({
      reservation_id: selectedResId,
      guest_name: guestName.trim() || 'Front Desk Walk-in Guest',
      amount: numAmount,
      currency,
      payment_method: paymentMethod,
      bank_name: paymentMethod === 'BANK' ? (bankName.trim() || 'ABA Bank KHQR') : undefined,
      transaction_ref: paymentMethod === 'BANK' ? transactionRef.trim() : undefined,
      note: note.trim() || undefined
    });

    closeRecordPaymentModal();
    openReceiptModal(savedPayment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-lg overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-[#111B3A] to-[#253B73] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E]">
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t.payment.recordTitle}</h3>
              <p className="text-xs text-gray-300">{t.hotelName}</p>
            </div>
          </div>
          <button
            onClick={closeRecordPaymentModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reservation / Guest Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.payment.reservationId}
            </label>
            <select
              value={selectedResId}
              onChange={(e) => handleReservationChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-semibold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden transition-all"
            >
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.guest_name} (Room {r.room_number})
                </option>
              ))}
            </select>
          </div>

          {/* Guest Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.receipt.guest}
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest full name"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
            />
          </div>

          {/* Amount & Currency Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.payment.amount} *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step={currency === 'KHR' ? '500' : '0.01'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={currency === 'KHR' ? '120000' : '30.00'}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.payment.currency} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('KHR')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    currency === 'KHR'
                      ? 'bg-[#111B3A] text-white border-[#111B3A] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ៛ KHR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-[#253B73] text-white border-[#253B73] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t.payment.paymentMethod} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                  className="sr-only"
                />
                <BanknotesIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">{t.payment.cash}</span>
                  <span className="text-[10px] text-gray-500">Front Desk Cashier</span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  paymentMethod === 'BANK'
                    ? 'border-purple-500 bg-purple-50/50 text-purple-900 ring-2 ring-purple-500/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK"
                  checked={paymentMethod === 'BANK'}
                  onChange={() => setPaymentMethod('BANK')}
                  className="sr-only"
                />
                <BuildingOffice2Icon className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">{t.payment.bank}</span>
                  <span className="text-[10px] text-gray-500">ABA / POS / Transfer</span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Bank Fields */}
          {paymentMethod === 'BANK' && (
            <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                  {t.payment.bankName} *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={t.payment.bankNamePlaceholder}
                  className="w-full px-3 py-1.5 rounded-xl border border-purple-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                  {t.payment.transactionRef}
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder={t.payment.transactionRefPlaceholder}
                  className="w-full px-3 py-1.5 rounded-xl border border-purple-200 bg-white text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.receipt.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Deposit for Room 204, Breakfast upgrade"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
            />
          </div>

          {/* Footer Metadata */}
          <div className="pt-2 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100">
            <span>{t.payment.receivedBy}: <strong className="text-gray-800">{currentUser.name}</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Auto Receipt Gen
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeRecordPaymentModal}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {t.payment.saveAndPrint}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
