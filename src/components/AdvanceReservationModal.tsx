import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Currency, PaymentMethod } from '../types';
import { 
  CalendarDaysIcon, 
  XMarkIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  BuildingOfficeIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export const AdvanceReservationModal: React.FC = () => {
  const { 
    isNewReservationModalOpen, 
    closeNewReservationModal, 
    createAdvanceReservation, 
    rooms, 
    language, 
    t, 
    openVoucherModal 
  } = useHotel();

  const isKhmer = language === 'KM';
  const resText = t.reservationsMgmt;

  // Form State
  const [guestName, setGuestName] = useState<string>('');
  const [guestNameKm, setGuestNameKm] = useState<string>('');
  const [passportOrId, setPassportOrId] = useState<string>('');
  const [phone, setPhone] = useState<string>('+855 ');
  const [email, setEmail] = useState<string>('');
  const [nationality, setNationality] = useState<string>('Cambodia');
  const [isVip, setIsVip] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultIn = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const defaultOut = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(defaultIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultOut);
  const [nights, setNights] = useState<number>(2);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Deposit State
  const [currency, setCurrency] = useState<Currency>('USD');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');
  const [bankName, setBankName] = useState<string>('ABA Bank (KHQR)',);
  const [txnRef, setTxnRef] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdReservation, setCreatedReservation] = useState<any>(null);

  if (!isNewReservationModalOpen) return null;

  const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
  const roomPrice = currentRoom ? (currency === 'KHR' ? currentRoom.priceKhr : currentRoom.priceUsd) : 0;
  const totalCost = roomPrice * nights;
  const isKhr = currency === 'KHR';

  const handleDateChange = (inDate: string, outDate: string) => {
    setCheckInDate(inDate);
    setCheckOutDate(outDate);
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    setNights(diffDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !passportOrId.trim() || !selectedRoomId) {
      alert(isKhmer ? 'សូមបំពេញព័ត៌មានភ្ញៀវ និងជ្រើសរើសបន្ទប់' : 'Please fill guest name, ID, and select a room');
      return;
    }

    const depositNum = parseFloat(depositAmount) || 0;

    const res = createAdvanceReservation({
      guestName,
      guestNameKm,
      passportOrId,
      phone,
      email,
      nationality,
      roomId: selectedRoomId,
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children,
      roomRate: roomPrice,
      currency,
      depositAmount: depositNum > 0 ? depositNum : undefined,
      depositMethod: depositNum > 0 ? paymentMethod : undefined,
      bankName: depositNum > 0 && paymentMethod === 'BANK' ? bankName : undefined,
      txnRef: depositNum > 0 && txnRef ? txnRef : undefined,
      specialRequests,
      isVip,
    });

    setCreatedReservation(res.reservation);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setCreatedReservation(null);
    closeNewReservationModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <CalendarDaysIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {resText.newReservation}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKhmer ? 'កត់ត្រាការកក់បន្ទប់ទុកជាមុន ជាមួយការកក់ប្រាក់កក់' : 'Book room in advance with optional advance deposit'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {isSuccess && createdReservation ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {resText.createSuccess}
              </h3>
              <p className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400 mt-1">
                Booking ID: {createdReservation.id}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Guest: {createdReservation.guest_name} | Room: {createdReservation.room_number} | {createdReservation.check_in_date} to {createdReservation.check_out_date}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleClose();
                  openVoucherModal(createdReservation);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all"
              >
                {resText.viewVoucher}
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
              >
                {isKhmer ? 'បិទ' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Section 1: Guest Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" />
                {isKhmer ? 'ព័ត៌មានភ្ញៀវ' : 'Guest Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'ឈ្មោះភ្ញៀវ (អង់គ្លេស)' : 'Guest Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'អត្តសញ្ញាណប័ណ្ណ / លិខិតឆ្លងដែន' : 'Passport / National ID #'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={passportOrId}
                    onChange={e => setPassportOrId(e.target.value)}
                    placeholder="e.g. N10984723"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'អ៊ីមែល' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'សញ្ជាតិ' : 'Nationality'}
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Dates & Room Assignment */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <BuildingOfficeIcon className="w-4 h-4" />
                {isKhmer ? 'កាលបរិច្ឆេទ និងបន្ទប់' : 'Stay Dates & Room'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'ថ្ងៃចូលស្នាក់នៅ' : 'Check-In Date'}
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={checkInDate}
                    onChange={e => handleDateChange(e.target.value, checkOutDate)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'ថ្ងៃចាកចេញ' : 'Check-Out Date'}
                  </label>
                  <input
                    type="date"
                    required
                    min={checkInDate}
                    value={checkOutDate}
                    onChange={e => handleDateChange(checkInDate, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKhmer ? 'ចំនួនយប់' : 'Total Nights'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={nights}
                    onChange={e => setNights(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKhmer ? 'ជ្រើសរើសបន្ទប់' : 'Select Room'} *
                </label>
                <select
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} — {r.type.replace(/_/g, ' ')} (${r.priceUsd} / ៛{r.priceKhr.toLocaleString()}) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 3: Deposit & Currency Payment (Guarded) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4" />
                  {isKhmer ? 'ប្រាក់កក់ទុកជាមុន (Advance Deposit)' : 'Advance Deposit (Guarded Dual-Currency)'}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      currency === 'USD' 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('KHR')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      currency === 'KHR' 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Total Estimated Stay Folio:
                  </p>
                  <p className="text-lg font-black text-amber-800 dark:text-amber-300">
                    {isKhr ? `៛${totalCost.toLocaleString()} KHR` : `$${totalCost.toFixed(2)} USD`}
                  </p>
                </div>

                <div className="w-40">
                  <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                    Deposit Amount ({currency}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={isKhr ? '1000' : '1'}
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {parseFloat(depositAmount) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="BANK">Bank Transfer / KHQR / Card</option>
                      <option value="CASH">Cash Deposit</option>
                    </select>
                  </div>

                  {paymentMethod === 'BANK' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Bank Name / TXN Ref
                      </label>
                      <input
                        type="text"
                        value={txnRef}
                        onChange={e => setTxnRef(e.target.value)}
                        placeholder="e.g. ABA-TXN-981240"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'សំណើពិសេស / កំណត់ចំណាំ' : 'Special Requests & Flight / Arrival Info'}
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                placeholder="e.g. Late check-in around 8 PM, high floor preferred"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                {resText.confirmBooking}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
