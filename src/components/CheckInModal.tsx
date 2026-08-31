import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Currency, PaymentMethod } from '../types';
import { 
  UserPlusIcon, 
  XMarkIcon, 
  KeyIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BuildingOffice2Icon, 
  CalendarDaysIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const CheckInModal: React.FC = () => {
  const { 
    selectedCheckInReservation, 
    closeCheckInModal, 
    checkInReservation, 
    rooms, 
    language, 
    t, 
    openReceiptModal 
  } = useHotel();

  const isKhmer = language === 'KM';
  const res = selectedCheckInReservation;

  const [assignedRoomId, setAssignedRoomId] = useState<string>('');
  const [keyCardNumber, setKeyCardNumber] = useState<string>('');
  const [passportOrId, setPassportOrId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<'NONE' | 'FULL' | 'CUSTOM'>('NONE');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositCurrency, setDepositCurrency] = useState<Currency>('KHR');
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>('CASH');
  const [bankName, setBankName] = useState<string>('ABA Bank KHQR');
  const [txnRef, setTxnRef] = useState<string>('');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (res) {
      setAssignedRoomId(res.room_id);
      setDepositCurrency(res.currency);
      setKeyCardNumber(`CARD-${res.room_number}`);
      setSpecialNote(res.special_requests || '');
      setIsSuccess(false);

      // Pre-fill balance due if any
      const due = res.currency === 'KHR' ? res.balance_due_khr : res.balance_due_usd;
      if (due > 0) {
        setDepositAmount(String(due));
        setPaymentOption('FULL');
      } else {
        setPaymentOption('NONE');
        setDepositAmount('0');
      }
    }
  }, [res]);

  if (!res) return null;

  const isKhr = res.currency === 'KHR';
  const balanceDue = isKhr ? res.balance_due_khr : res.balance_due_usd;
  const currentRoom = rooms.find(r => r.id === assignedRoomId) || rooms.find(r => r.id === res.room_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let depositVal = 0;
    if (paymentOption === 'FULL') {
      depositVal = balanceDue;
    } else if (paymentOption === 'CUSTOM') {
      depositVal = parseFloat(depositAmount) || 0;
    }

    const result = checkInReservation(res.id, {
      assignedRoomId: assignedRoomId || res.room_id,
      keyCardNumber: keyCardNumber || `CARD-${res.room_number}`,
      depositAmount: depositVal > 0 ? depositVal : undefined,
      depositMethod: depositMethod,
      bankName: depositMethod === 'BANK' ? bankName : undefined,
      txnRef: depositMethod === 'BANK' ? txnRef : undefined,
      specialNote: specialNote,
    });

    setIsSuccess(true);
    setTimeout(() => {
      closeCheckInModal();
      setIsSuccess(false);
      if (result.payment) {
        openReceiptModal(result.payment);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-[#111B3A] to-[#253B73] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E]">
              <UserPlusIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {t.checkInOut.modalTitle}
                <span className="px-2 py-0.5 rounded-md bg-[#D81B73] text-[10px] font-mono font-bold">
                  {res.id}
                </span>
              </h3>
              <p className="text-xs text-gray-300">
                {isKhmer 
                  ? 'ផ្ទៀងផ្ទាត់ព័ត៌មានភ្ញៀវ បែងចែកកាតសោរ និងទូទាត់សមតុល្យ' 
                  : 'Verify guest details, assign room keycard & settle arrival deposit'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckInModal}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-[#DCEEE3] text-[#3A8059] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {isKhmer ? 'ភ្ញៀវបានចូលស្នាក់នៅជោគជ័យ!' : 'Guest Successfully Checked In!'}
            </h3>
            <p className="text-xs text-gray-500">
              {isKhmer ? 'ប្រព័ន្ធបានផ្លាស់ប្តូរស្ថានភាពបន្ទប់ទៅជា OCCUPIED រួចរាល់។' : 'Room status has been updated to OCCUPIED.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Guest Summary Card */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {t.receipt.guest}
                  </span>
                  <h4 className="text-base font-bold text-[#111B3A]">{res.guest_name}</h4>
                  <p className="text-xs text-gray-500">
                    {res.check_in_date} → {res.check_out_date} ({res.nights} {t.checkInOut.nights})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    {t.receipt.room}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-[#253B73]">
                    Room {res.room_number}
                  </span>
                  <span className="block text-[11px] font-semibold text-[#8d6f35]">
                    {t.roomTypes[res.room_type as keyof typeof t.roomTypes] || res.room_type}
                  </span>
                </div>
              </div>

              {/* Financial Balance Strip */}
              <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">{t.checkInOut.totalCost}: </span>
                  <span className="font-mono font-bold text-gray-900">
                    {isKhr ? `${res.total_amount.toLocaleString()} KHR` : `$${res.total_amount} USD`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{t.payment.paid}: </span>
                  <span className="font-mono font-bold text-[#3A8059]">
                    {isKhr ? `${res.paid_amount_khr.toLocaleString()} KHR` : `$${res.paid_amount_usd} USD`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{t.payment.balanceDue}: </span>
                  <span className={`font-mono font-bold ${balanceDue > 0 ? 'text-[#D81B73]' : 'text-[#2F6748]'}`}>
                    {isKhr ? `${res.balance_due_khr.toLocaleString()} KHR` : `$${res.balance_due_usd} USD`}
                  </span>
                </div>
              </div>
            </div>

            {/* Check-In Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.checkInOut.keyCardNumber} *
                </label>
                <div className="relative">
                  <KeyIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={keyCardNumber}
                    onChange={(e) => setKeyCardNumber(e.target.value)}
                    placeholder={`CARD-${res.room_number}`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.checkInOut.passportOrId}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passportOrId}
                    onChange={(e) => setPassportOrId(e.target.value)}
                    placeholder={t.checkInOut.passportPlaceholder}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.checkInOut.contactPhone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.checkInOut.assignedRoom}
                </label>
                <select
                  value={assignedRoomId}
                  onChange={(e) => setAssignedRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                >
                  <option value={res.room_id}>Room {res.room_number} (Reserved)</option>
                  {rooms.filter(r => r.status === 'AVAILABLE' && r.id !== res.room_id).map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} (Floor {r.floor} - {t.roomTypes[r.type]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Arrival Payment Collection Section */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#111B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCardIcon className="w-4 h-4 text-[#D81B73]" />
                    {t.checkInOut.paymentDeposit}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    {balanceDue > 0 
                      ? (isKhmer ? `សមតុល្យត្រូវទូទាត់៖ ${isKhr ? `${balanceDue.toLocaleString()} KHR` : `$${balanceDue} USD`}` : `Balance due upon arrival: ${isKhr ? `${balanceDue.toLocaleString()} KHR` : `$${balanceDue} USD`}`)
                      : (isKhmer ? 'ការកក់នេះបានទូទាត់រួចរាល់' : 'Fully paid in advance')}
                  </p>
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('FULL');
                      setDepositAmount(String(balanceDue));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      paymentOption === 'FULL'
                        ? 'bg-[#253B73] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.checkInOut.payNowFull}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('CUSTOM');
                      setDepositAmount('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      paymentOption === 'CUSTOM'
                        ? 'bg-[#D81B73] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.checkInOut.payCustomDeposit}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('NONE');
                      setDepositAmount('0');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      paymentOption === 'NONE'
                        ? 'bg-gray-800 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.checkInOut.noDepositNow}
                  </button>
                </div>
              </div>

              {paymentOption !== 'NONE' && (
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        {t.payment.amount} ({depositCurrency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={isKhr ? '500' : '0.01'}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        {t.payment.paymentMethod}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDepositMethod('CASH')}
                          className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                            depositMethod === 'CASH'
                              ? 'bg-[#3A8059] text-white border-[#3A8059]'
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          <BanknotesIcon className="w-3.5 h-3.5" />
                          <span>{t.payment.cash}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositMethod('BANK')}
                          className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                            depositMethod === 'BANK'
                              ? 'bg-[#253B73] text-white border-[#253B73]'
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          <CreditCardIcon className="w-3.5 h-3.5" />
                          <span>{t.payment.bank}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {depositMethod === 'BANK' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          {t.payment.bankName}
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder={t.payment.bankNamePlaceholder}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          {t.payment.transactionRef}
                        </label>
                        <input
                          type="text"
                          value={txnRef}
                          onChange={(e) => setTxnRef(e.target.value)}
                          placeholder={t.payment.transactionRefPlaceholder}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.checkInOut.specialRequests}
              </label>
              <input
                type="text"
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="e.g. Extra water bottles, temple pass tour, late wake-up call"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={closeCheckInModal}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <CheckCircleIcon className="w-4 h-4 text-[#C9A96E]" />
                <span>{t.checkInOut.markCheckedIn}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};