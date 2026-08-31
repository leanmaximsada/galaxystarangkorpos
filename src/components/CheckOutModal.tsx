import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PaymentMethod } from '../types';
import { 
  ArrowRightOnRectangleIcon, 
  XMarkIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BuildingOffice2Icon, 
  UserIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  SparklesIcon,
  KeyIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export const CheckOutModal: React.FC = () => {
  const { 
    selectedCheckOutReservation, 
    closeCheckOutModal, 
    checkOutGuest, 
    language, 
    t, 
    openReceiptModal 
  } = useHotel();

  const isKhmer = language === 'KM';
  const res = selectedCheckOutReservation;

  const [extraCharges, setExtraCharges] = useState<string>('0');
  const [extraDesc, setExtraDesc] = useState<string>('');
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('CASH');
  const [bankName, setBankName] = useState<string>('ABA Bank (KHQR)');
  const [txnRef, setTxnRef] = useState<string>('');
  const [isKeyReturned, setIsKeyReturned] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!res) return null;

  const isKhr = res.currency === 'KHR';
  const baseDue = isKhr ? res.balance_due_khr : res.balance_due_usd;
  const extraVal = parseFloat(extraCharges) || 0;
  const totalSettlementDue = Math.max(0, baseDue + extraVal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkOutGuest(res.id, {
      settlementAmount: totalSettlementDue > 0 ? totalSettlementDue : undefined,
      settlementMethod,
      bankName: settlementMethod === 'BANK' ? bankName : undefined,
      txnRef: settlementMethod === 'BANK' ? txnRef : undefined,
      extraCharges: extraVal > 0 ? extraVal : undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      closeCheckOutModal();
      setIsSuccess(false);
      if (result.payment) {
        openReceiptModal(result.payment);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-[#111B3A] to-[#D81B73] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {t.checkInOut.checkOutModalTitle}
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold">
                  Room {res.room_number}
                </span>
              </h3>
              <p className="text-xs text-gray-200">
                {isKhmer 
                  ? 'ទូទាត់សមតុល្យចុងក្រោយ ទទួលកាតសោរ និងផ្លាស់ប្តូរបន្ទប់ទៅជា CLEANING' 
                  : 'Settle final balance, collect keycard & move room to housekeeping queue'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckOutModal}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {isKhmer ? 'ភ្ញៀវបានចាកចេញជោគជ័យ!' : 'Guest Successfully Checked Out!'}
            </h3>
            <p className="text-xs text-gray-500">
              {isKhmer ? 'បន្ទប់ត្រូវបានប្តូរទៅស្ថានភាព "CLEANING" (កំពុងសម្អាត) ដោយស្វ័យប្រវត្តិ។' : 'Room is now marked as CLEANING for housekeeping.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Folio Summary */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {t.receipt.guest}
                  </span>
                  <h4 className="text-base font-bold text-[#111B3A]">{res.guest_name}</h4>
                  <p className="text-xs text-gray-500">
                    Stay: {res.check_in_date} → {res.check_out_date} ({res.nights} {t.checkInOut.nights})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    {t.receipt.room}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-[#253B73]">
                    {res.room_number}
                  </span>
                  <span className="block text-[11px] font-semibold text-[#8d6f35]">
                    {t.roomTypes[res.room_type as keyof typeof t.roomTypes] || res.room_type}
                  </span>
                </div>
              </div>

              {/* Balances */}
              <div className="pt-2 border-t border-gray-200/80 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px]">{t.checkInOut.totalCost}</span>
                  <span className="font-mono font-bold text-gray-900">
                    {isKhr ? `${res.total_amount.toLocaleString()} ៛` : `$${res.total_amount}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">{t.payment.paid}</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {isKhr ? `${res.paid_amount_khr.toLocaleString()} ៛` : `$${res.paid_amount_usd}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">{t.payment.balanceDue}</span>
                  <span className={`font-mono font-bold ${baseDue > 0 ? 'text-[#D81B73]' : 'text-gray-700'}`}>
                    {isKhr ? `${res.balance_due_khr.toLocaleString()} ៛` : `$${res.balance_due_usd}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Extra Charges / Minibar / Damages */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111B3A] uppercase tracking-wider">
                {t.checkInOut.extraCharges} (Minibar, Laundry, Damages)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    step={isKhr ? '500' : '0.01'}
                    value={extraCharges}
                    onChange={(e) => setExtraCharges(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={extraDesc}
                    onChange={(e) => setExtraDesc(e.target.value)}
                    placeholder="e.g. 2x Angkor Beers, 1x Laundry"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Total Due for Settlement */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#111B3A] block">
                  {t.checkInOut.totalSettlementDue}
                </span>
                <span className="text-[11px] text-gray-500">
                  {isKhmer ? 'សមតុល្យចាស់ + ការចំណាយបន្ថែម' : 'Room balance due + incidental extras'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold font-mono text-[#D81B73]">
                  {isKhr ? `${totalSettlementDue.toLocaleString()} KHR` : `$${totalSettlementDue.toFixed(2)} USD`}
                </span>
              </div>
            </div>

            {/* Payment Method if Due > 0 */}
            {totalSettlementDue > 0 && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-gray-700">
                  {t.payment.paymentMethod}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementMethod('CASH')}
                    className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      settlementMethod === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    <BanknotesIcon className="w-3.5 h-3.5" />
                    <span>{t.payment.cash}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlementMethod('BANK')}
                    className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      settlementMethod === 'BANK'
                        ? 'bg-[#253B73] text-white border-[#253B73]'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    <CreditCardIcon className="w-3.5 h-3.5" />
                    <span>{t.payment.bank}</span>
                  </button>
                </div>

                {settlementMethod === 'BANK' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="ABA KHQR / Wing / POS"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={txnRef}
                        onChange={(e) => setTxnRef(e.target.value)}
                        placeholder="Txn Ref (optional)"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Card Handover Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isKeyReturned}
                  onChange={(e) => setIsKeyReturned(e.target.checked)}
                  className="w-4 h-4 text-[#253B73] rounded border-gray-300 focus:ring-[#253B73]"
                />
                <span className="flex items-center gap-1">
                  <KeyIcon className="w-3.5 h-3.5 text-gray-500" />
                  {isKhmer ? 'កាតសោរបន្ទប់ត្រូវបានប្រគល់ត្រឡប់មកវិញ' : 'Keycard has been returned and verified'}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeCheckOutModal}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#D81B73] hover:bg-[#b0135c] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>{t.checkInOut.confirmCheckOut}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
