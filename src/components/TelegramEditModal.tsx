import React, { useState, useEffect, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { XMarkIcon, PaperAirplaneIcon, CameraIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export const TelegramEditModal: React.FC = () => {
  const {
    selectedTelegramEditReservation,
    closeTelegramEditModal,
    updateTelegramNotification,
    language,
  } = useHotel();

  const isKhmer = language === 'KM';
  const res = selectedTelegramEditReservation;
  const isOpen = !!res;

  const [guestName, setGuestName] = useState('');
  const [roomNumbers, setRoomNumbers] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (res) {
      setGuestName(res.guest_name);
      setRoomNumbers(res.room_number);
      setCheckInDate(res.check_in_date);
      setCheckOutDate(res.check_out_date);
      const isKhr = res.currency === 'KHR';
      setPaidAmount(isKhr ? `${res.paid_amount_khr.toLocaleString()} KHR` : `$${res.paid_amount_usd.toFixed(2)}`);
      setPaymentMethod('');
      setNewPhotoPreview(undefined);
      setStatus('idle');
      setErrorMsg('');
    }
  }, [res]);

  if (!isOpen || !res) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    const result = await updateTelegramNotification({
      reservationId: res.id,
      guestName,
      roomNumbers,
      checkInDate,
      checkOutDate,
      paidAmount,
      paymentMethod: paymentMethod || (isKhmer ? 'មិនបានបញ្ជាក់' : 'Not specified'),
      newIdCardImage: newPhotoPreview,
    });

    if (result.ok) {
      setStatus('success');
      setTimeout(() => {
        closeTelegramEditModal();
      }, 1200);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Failed to update Telegram message.');
    }
  };

  if (!res.telegramMessageId) {
    return (
      <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center">
          <ExclamationCircleIcon className="w-10 h-10 text-[#8C6E3D] mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-4">
            {isKhmer ? 'ការកក់នេះមិនមានសារ Telegram ភ្ជាប់នៅឡើយទេ។' : 'This reservation has no linked Telegram message to edit.'}
          </p>
          <button
            onClick={closeTelegramEditModal}
            className="px-4 py-2 rounded-xl bg-[#253B73] text-white text-sm font-bold"
          >
            {isKhmer ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-[#111B3A] flex items-center justify-between shrink-0">
          <h2 className="text-white font-bold flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-[#C9A96E]" />
            {isKhmer ? 'កែសារ Telegram' : 'Edit Telegram Message'}
          </h2>
          <button onClick={closeTelegramEditModal} className="p-1 rounded-lg text-white/60 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0">
            {status === 'error' && (
              <div className="px-4 py-3 rounded-lg text-sm bg-[#FBEEEE] text-[#832F2C] border border-[#EBB8B6]">
                {errorMsg}
              </div>
            )}
            {status === 'success' && (
              <div className="px-4 py-3 rounded-lg text-sm bg-[#EEF6F1] text-[#2F6748] border border-[#BFE0CC] flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                {isKhmer ? 'បានកែសារ Telegram ដោយជោគជ័យ!' : 'Telegram message updated successfully!'}
              </div>
            )}

            <p className="text-xs text-gray-500">
              {isKhmer
                ? 'ឈ្មោះភ្ញៀវ លេខបន្ទប់ និងកាលបរិច្ឆេទ នឹងត្រូវបានធ្វើបច្ចុប្បន្នភាពនៅក្នុងប្រព័ន្ធផងដែរ (ភ្ញៀវ, ការកក់, បន្ទប់)។ ចំនួនទឹកប្រាក់/វិធីទូទាត់ ប្រើសម្រាប់កែសារ Telegram តែប៉ុណ្ណោះ — ការកែតម្រូវការទូទាត់ពិតប្រាកដ សូមធ្វើតាមទំព័រ Payments។'
                : 'Guest name, room, and dates will also be updated in the system (Guest, Reservation, Room). Paid amount/method only correct the Telegram text — for real payment corrections, use the Payments page.'}
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isKhmer ? 'ឈ្មោះភ្ញៀវ' : 'Guest Name'}
              </label>
              <input
                type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isKhmer ? 'លេខបន្ទប់' : 'Room Number(s)'}
              </label>
              <input
                type="text" value={roomNumbers} onChange={e => setRoomNumbers(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {isKhmer ? 'ថ្ងៃចូល' : 'Check-In Date'}
                </label>
                <input
                  type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {isKhmer ? 'ថ្ងៃចេញ' : 'Check-Out Date'}
                </label>
                <input
                  type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isKhmer ? 'ចំនួនទឹកប្រាក់ដែលបានបង់' : 'Paid Amount (as it should appear)'}
              </label>
              <input
                type="text" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                placeholder="$25.00"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isKhmer ? 'វិធីទូទាត់' : 'Payment Method (as it should appear)'}
              </label>
              <input
                type="text" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                placeholder="ABA Bank (KHQR)"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            {res.telegramHasPhoto && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {isKhmer ? 'ប្តូររូបភាពអត្តសញ្ញាណប័ណ្ណ (ស្រេចចិត្ត)' : 'Replace ID Photo (optional)'}
                </label>
                {newPhotoPreview ? (
                  <img src={newPhotoPreview} alt="New ID" className="w-full h-32 object-cover rounded-xl border border-gray-200 mb-2" />
                ) : (
                  <p className="text-[11px] text-gray-400 mb-2">
                    {isKhmer ? 'រូបភាពបច្ចុប្បន្ននឹងនៅដដែល លុះត្រាតែអ្នកជ្រើសរើសរូបភាពថ្មី' : 'The current photo stays unless you choose a new one.'}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3.5 py-2 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:border-[#253B73] hover:text-[#253B73] flex items-center justify-center gap-2 transition-colors"
                >
                  <CameraIcon className="w-4 h-4" />
                  {isKhmer ? 'ជ្រើសរើសរូបភាពថ្មី' : 'Choose New Photo'}
                </button>
                <input
                  ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoSelect} className="hidden"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={closeTelegramEditModal}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={status === 'saving'}
              className="px-5 py-2 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-sm font-bold shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {status === 'saving' ? (isKhmer ? 'កំពុងកែ...' : 'Saving...') : (isKhmer ? 'រក្សាទុក' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};