import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { XMarkIcon, HomeModernIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Currency, PaymentMethod } from '../types';

export const AddRoomModal: React.FC = () => {
  const {
    selectedAddRoomGuest,
    closeAddRoomModal,
    rooms,
    addRoomForGuest,
    openReceiptModal,
    language,
    t,
  } = useHotel();

  const isKhmer = language === 'KM';
  const isOpen = !!selectedAddRoomGuest;

  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE');
  const today = new Date().toISOString().split('T')[0];

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(today);
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [nights, setNights] = useState<number>(1);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [paymentOption, setPaymentOption] = useState<'NONE' | 'FULL' | 'CUSTOM'>('NONE');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [bankName, setBankName] = useState<string>('');
  const [txnRef, setTxnRef] = useState<string>('');
  const [keyCardNumber, setKeyCardNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const firstRoom = availableRooms[0];
      setSelectedRoomId(firstRoom?.id || '');
      setCheckInDate(today);
      const co = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      setCheckOutDate(co);
      setNights(1);
      setAdults(1);
      setChildren(0);
      setPaymentOption('NONE');
      setDepositAmount('');
      setBankName('');
      setTxnRef('');
      setKeyCardNumber(firstRoom ? `CARD-${firstRoom.number}` : '');
      setErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddRoomGuest]);

  if (!isOpen || !selectedAddRoomGuest) return null;

  const currentRoom = rooms.find(r => r.id === selectedRoomId);
  const isKhr = currency === 'KHR';
  const roomPrice = currentRoom ? (isKhr ? currentRoom.priceKhr : currentRoom.priceUsd) : 0;
  const totalCost = roomPrice * nights;

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (room) setKeyCardNumber(`CARD-${room.number}`);
  };

  const handleNightsChange = (numNights: number) => {
    const validNights = Math.max(1, numNights);
    setNights(validNights);
    const checkIn = new Date(checkInDate);
    setCheckOutDate(new Date(checkIn.getTime() + validNights * 86400000).toISOString().split('T')[0]);
  };

  const handleCheckOutDateChange = (dateStr: string) => {
    setCheckOutDate(dateStr);
    const diffNights = Math.round((new Date(dateStr).getTime() - new Date(checkInDate).getTime()) / 86400000);
    if (diffNights >= 1) setNights(diffNights);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedRoomId) {
      setErrorMessage(isKhmer ? 'សូមជ្រើសរើសបន្ទប់ទំនេរ។' : 'Please select an available room.');
      return;
    }

    let depositVal = 0;
    if (paymentOption === 'FULL') depositVal = totalCost;
    else if (paymentOption === 'CUSTOM') depositVal = parseFloat(depositAmount) || 0;

    setIsSubmitting(true);
    try {
      const result = addRoomForGuest({
        guestId: selectedAddRoomGuest.id,
        guestName: selectedAddRoomGuest.name,
        roomId: selectedRoomId,
        checkInDate,
        checkOutDate,
        nights,
        adults,
        children,
        currency,
        depositAmount: depositVal > 0 ? depositVal : undefined,
        depositMethod: paymentMethod,
        bankName: paymentMethod === 'BANK' ? bankName : undefined,
        txnRef: paymentMethod === 'BANK' ? txnRef : undefined,
        keyCardNumber,
      });

      if (result.payment) {
        openReceiptModal(result.payment);
      }
      closeAddRoomModal();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to add room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-[#111B3A] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold flex items-center gap-2">
              <HomeModernIcon className="w-5 h-5 text-[#C9A96E]" />
              {isKhmer ? 'បន្ថែមបន្ទប់សម្រាប់ភ្ញៀវ' : 'Add Room for Guest'}
            </h2>
            <p className="text-white/60 text-xs mt-0.5">
              {isKhmer ? 'ភ្ញៀវ' : 'Guest'}: <span className="font-semibold text-white">{selectedAddRoomGuest.name}</span>
            </p>
          </div>
          <button onClick={closeAddRoomModal} className="p-1 rounded-lg text-white/60 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="px-4 py-3 rounded-lg text-sm bg-[#FBEEEE] text-[#832F2C] border border-[#EBB8B6]">
              {errorMessage}
            </div>
          )}

          {availableRooms.length === 0 ? (
            <div className="p-3 bg-[#FBF7EF] border border-[#EAD9AF] text-[#6E5630] text-xs rounded-xl">
              {isKhmer ? 'គ្មានបន្ទប់ទំនេរនាពេលនេះទេ។' : 'No rooms currently available.'}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {isKhmer ? 'ជ្រើសរើសបន្ទប់' : 'Select Room'} *
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                >
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} (Floor {r.floor}) — {r.categoryName || t.roomTypes[r.type as keyof typeof t.roomTypes] || r.type} (${r.priceUsd} / {r.priceKhr.toLocaleString()} KHR)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'លេខកាតសោរ' : 'Key Card Number'}
                  </label>
                  <input
                    type="text"
                    value={keyCardNumber}
                    onChange={(e) => setKeyCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'រូបិយប័ណ្ណ' : 'Currency'}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  >
                    <option value="USD">USD</option>
                    <option value="KHR">KHR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <CalendarDaysIcon className="w-3.5 h-3.5" /> {isKhmer ? 'ថ្ងៃចូល' : 'Check-In Date'}
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'ថ្ងៃចេញ' : 'Check-Out Date'}
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => handleCheckOutDateChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {isKhmer ? 'យប់' : 'Nights'}
                    </label>
                    <input
                      type="number" min="1" max="30" value={nights}
                      onChange={(e) => handleNightsChange(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-center focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {isKhmer ? 'មនុស្សពេញវ័យ' : 'Adults'}
                    </label>
                    <input
                      type="number" min="1" max="10" value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-center focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {isKhmer ? 'កុមារ' : 'Children'}
                    </label>
                    <input
                      type="number" min="0" max="10" value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-center focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Total cost */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#111B3A]">{isKhmer ? 'តម្លៃសរុប' : 'Total Cost'}</span>
                  <span className="text-[11px] text-gray-500 block">
                    {nights} {isKhmer ? 'យប់' : 'nights'} × {isKhr ? `${roomPrice.toLocaleString()} KHR` : `$${roomPrice} USD`}
                  </span>
                </div>
                <span className="font-mono font-extrabold text-[#111B3A]">
                  {isKhr ? `${totalCost.toLocaleString()} KHR` : `$${totalCost.toFixed(2)} USD`}
                </span>
              </div>

              {/* Payment option */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  {isKhmer ? 'ការទូទាត់ជាមុន' : 'Deposit / Payment'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NONE', 'FULL', 'CUSTOM'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPaymentOption(opt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        paymentOption === opt
                          ? 'bg-[#253B73] text-white border-[#253B73]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#253B73]'
                      }`}
                    >
                      {opt === 'NONE' ? (isKhmer ? 'មិនទាន់' : 'None Yet') : opt === 'FULL' ? (isKhmer ? 'ពេញលេញ' : 'Pay Full') : (isKhmer ? 'កំណត់ដោយខ្លួនឯង' : 'Custom')}
                    </button>
                  ))}
                </div>
              </div>

              {paymentOption !== 'NONE' && (
                <div className="space-y-3 p-3.5 rounded-2xl border border-gray-200">
                  {paymentOption === 'CUSTOM' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        {isKhmer ? 'ចំនួនទឹកប្រាក់' : 'Amount'}
                      </label>
                      <input
                        type="number" min="0" step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {isKhmer ? 'វិធីទូទាត់' : 'Payment Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['CASH', 'BANK'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                            paymentMethod === m ? 'bg-[#B08C4F] text-white border-[#B08C4F]' : 'bg-white text-gray-600 border-gray-300'
                          }`}
                        >
                          {m === 'CASH' ? (isKhmer ? 'សាច់ប្រាក់' : 'Cash') : (isKhmer ? 'ធនាគារ' : 'Bank')}
                        </button>
                      ))}
                    </div>
                  </div>
                  {paymentMethod === 'BANK' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text" placeholder={isKhmer ? 'ឈ្មោះធនាគារ' : 'Bank name'}
                        value={bankName} onChange={(e) => setBankName(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                      />
                      <input
                        type="text" placeholder={isKhmer ? 'លេខយោង' : 'Transaction ref'}
                        value={txnRef} onChange={(e) => setTxnRef(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={closeAddRoomModal}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={availableRooms.length === 0 || isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#D81B73] hover:bg-[#b0135c] text-white text-sm font-bold shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (isKhmer ? 'កំពុងបន្ថែម...' : 'Adding...') : (isKhmer ? 'បន្ថែមបន្ទប់' : 'Add Room')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};