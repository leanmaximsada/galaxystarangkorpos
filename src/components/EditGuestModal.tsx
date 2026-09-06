import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Guest } from '../types';
import { 
  XMarkIcon, 
  CameraIcon, PhotoIcon,
  UserIcon, 
  IdentificationIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  BuildingOffice2Icon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onCaptureId?: (mode: 'CAMERA' | 'SCANNER') => void;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({ isOpen, onClose, guest, onCaptureId }) => {
  const { rooms, updateGuest, language, t } = useHotel();
  const isKhmer = language === 'KM';

  const [name, setName] = useState('');
  const [nameKm, setNameKm] = useState('');
  const [passportOrId, setPassportOrId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [nationalityKm, setNationalityKm] = useState('');
  const [vipStatus, setVipStatus] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [paidAmountUsd, setPaidAmountUsd] = useState<number | string>('0');
  const [paidAmountKhr, setPaidAmountKhr] = useState<number | string>('0');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (guest) {
      setName(guest.name || '');
      setNameKm(guest.nameKm || '');
      setPassportOrId(guest.passportOrId || '');
      setPhone(guest.phone || '');
      setEmail(guest.email || '');
      setNationality(guest.nationality || 'Cambodia');
      setNationalityKm(guest.nationalityKm || 'កម្ពុជា');
      setVipStatus(!!guest.vipStatus);
      setRoomNumber(guest.roomNumber || '101');
      setCheckInDate(guest.checkInDate || new Date().toISOString().split('T')[0]);
      
      const defaultOut = new Date();
      defaultOut.setDate(defaultOut.getDate() + 2);
      setCheckOutDate(guest.checkOutDate || defaultOut.toISOString().split('T')[0]);
      
      setPaidAmountUsd(guest.paidAmountUsd ?? 0);
      setPaidAmountKhr(guest.paidAmountKhr ?? 0);
      setNotes(guest.notes || '');
      setIsSaved(false);
    }
  }, [guest, isOpen]);

  if (!isOpen || !guest) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateGuest(guest.id, {
      name: name.trim(),
      nameKm: nameKm.trim() || undefined,
      passportOrId: passportOrId.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      nationality: nationality.trim(),
      nationalityKm: nationalityKm.trim() || undefined,
      vipStatus,
      roomNumber: roomNumber.trim(),
      checkInDate,
      checkOutDate,
      paidAmountUsd: Number(paidAmountUsd) || 0,
      paidAmountKhr: Number(paidAmountKhr) || 0,
      notes: notes.trim() || undefined,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-[#111B3A] via-[#1a2b5c] to-[#253B73] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C9A96E]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {isKhmer ? 'កែប្រែព័ត៌មានភ្ញៀវ' : 'Edit Guest Profile & Stay Details'}
                <span className="px-2 py-0.5 rounded-md bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] font-mono font-bold">
                  {guest.id}
                </span>
              </h3>
              <p className="text-xs text-gray-300">
                {isKhmer 
                  ? 'កែប្រែកាលបរិច្ឆេទចូល-ចេញ លេខបន្ទប់ ប្រាក់បានបង់ និងព័ត៌មានផ្ទាល់ខ្លួន' 
                  : 'Update check-in/out dates, room assignment, paid amount and personal details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {isKhmer ? 'បានកែប្រែព័ត៌មានភ្ញៀវជោគជ័យ!' : 'Guest Information Updated!'}
            </h4>
            <p className="text-xs text-gray-500">
              {isKhmer ? 'ព័ត៌មានថ្មីត្រូវបានរក្សាទុកដោយជោគជ័យ។' : 'The latest details have been saved to the hotel database.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Stay & Room Details Section */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#253B73] flex items-center gap-1.5">
                <BuildingOffice2Icon className="w-4 h-4 text-[#C9A96E]" />
                {isKhmer ? 'ព័ត៌មានការស្នាក់នៅ & បន្ទប់' : 'Stay & Room Assignment'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'លេខបន្ទប់' : 'Room Number'} *
                  </label>
                  <div className="relative">
                    <BuildingOffice2Icon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden appearance-none"
                    >
                      {/* The guest's current room is always shown, even though it's OCCUPIED (by them) */}
                      {roomNumber && !rooms.some(r => r.number === roomNumber && r.status === 'AVAILABLE') && (
                        <option value={roomNumber}>
                          {roomNumber} ({isKhmer ? 'បន្ទប់បច្ចុប្បន្ន' : 'Current Room'})
                        </option>
                      )}
                      {rooms
                        .filter(r => r.status === 'AVAILABLE')
                        .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                        .map(r => (
                          <option key={r.id} value={r.number}>
                            {r.number} — {r.categoryName || t.roomTypes[r.type as keyof typeof t.roomTypes] || r.type}
                          </option>
                        ))}
                    </select>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {isKhmer ? 'ជ្រើសរើសបន្ទប់ត្រឹមត្រូវ ប្រសិនបើបានជ្រើសរើសខុស' : 'Pick the correct room if the wrong one was assigned'}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'ថ្ងៃចូល (Check-In Date)' : 'Date of Check-In'} *
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'ថ្ងៃចេញ (Check-Out Date)' : 'Date of Check-Out'} *
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>


                              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  {isKhmer ? 'រូបភាពអត្តសញ្ញាណប័ណ្ណ' : 'ID Document Photo'}
                </label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200">
                  {guest?.idCardImage ? (
                    <img
                      src={guest.idCardImage}
                      alt="ID"
                      className="w-20 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                      <IdentificationIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700">
                      {guest?.idCardImage
                        ? (isKhmer ? 'បានភ្ជាប់រូបភាពរួច' : 'Photo attached')
                        : (isKhmer ? 'មិនទាន់មានរូបភាព' : 'No photo yet')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {isKhmer ? 'ចុចដើម្បីថត ឬស្កេនម្ដងទៀត ប្រសិនបើខុស ឬមិនច្បាស់' : 'Retake or rescan if wrong or unclear'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onCaptureId && onCaptureId('CAMERA')}
                      className="px-3 py-1.5 rounded-lg bg-[#253B73] hover:bg-[#111B3A] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CameraIcon className="w-3.5 h-3.5" />
                      {isKhmer ? 'ថតម្ដងទៀត' : 'Retake'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCaptureId && onCaptureId('SCANNER')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <PhotoIcon className="w-3.5 h-3.5" />
                      {isKhmer ? 'ផ្ទុកឯកសារ' : 'Upload File'}
                    </button>
                  </div>
                </div>
              </div>
              {/* Financial - Amount Paid */}
              <div className="pt-2 border-t border-gray-200/60">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {isKhmer ? 'ចំនួនទឹកប្រាក់ដែលបានបង់រួច (Amount Paid)' : 'Money Paid (Settled Amount)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="text-xs font-bold text-gray-500 absolute left-3 top-1/2 -translate-y-1/2">$ USD</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={paidAmountUsd}
                      onChange={(e) => setPaidAmountUsd(e.target.value)}
                      placeholder="Paid in USD"
                      className="w-full pl-16 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                  <div className="relative">
                    <span className="text-xs font-bold text-gray-500 absolute left-3 top-1/2 -translate-y-1/2">៛ KHR</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={paidAmountKhr}
                      onChange={(e) => setPaidAmountKhr(e.target.value)}
                      placeholder="Paid in KHR"
                      className="w-full pl-16 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Personal Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#253B73] flex items-center gap-1.5">
                <IdentificationIcon className="w-4 h-4 text-[#C9A96E]" />
                {isKhmer ? 'ព័ត៌មានអត្តសញ្ញាណភ្ញៀវ' : 'Guest Personal Information'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'ឈ្មោះជាអក្សរឡាតាំង (Full Name)' : 'Guest Full Name (English)'} *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'ឈ្មោះជាភាសាខ្មែរ (Name in Khmer)' : 'Guest Name (Khmer - Optional)'}
                  </label>
                  <input
                    type="text"
                    value={nameKm}
                    onChange={(e) => setNameKm(e.target.value)}
                    placeholder="ឈ្មោះខ្មែរ..."
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'លេខលិខិតឆ្លងដែន / អត្តសញ្ញាណប័ណ្ណ' : 'Passport / National ID Number'} *
                  </label>
                  <div className="relative">
                    <IdentificationIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={passportOrId}
                      onChange={(e) => setPassportOrId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Phone Number'} *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'អ៊ីមែល (Email)' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guest@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isKhmer ? 'សញ្ជាតិ' : 'Nationality'} *
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* VIP Status Switch */}
              <div className="flex items-center justify-between p-3 bg-pink-50/50 border border-pink-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#D81B73] text-white flex items-center justify-center">
                    <SolidSparklesIcon className="w-4 h-4 text-[#C9A96E]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111B3A]">VIP Guest Status</span>
                    <p className="text-[10px] text-gray-500">Enable priority service and VIP welcome fruit basket</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVipStatus(!vipStatus)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    vipStatus ? 'bg-[#D81B73]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      vipStatus ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Guest Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {isKhmer ? 'កំណត់សម្គាល់ភ្ញៀវ ឬចំណង់ចំណូលចិត្ត' : 'Guest Notes & Special Requests'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. High floor room preference, allergic to feathers..."
                  className="w-full p-3 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircleIcon className="w-4 h-4 text-[#C9A96E]" />
                <span>{isKhmer ? 'រក្សាទុកការកែប្រែ' : 'Save Guest Details'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
