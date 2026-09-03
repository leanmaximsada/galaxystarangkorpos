import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { FormattedDateInput } from './FormattedDateInput';
import { formatDate } from '../utils/dateFormatter';
import { Currency, PaymentMethod, Room } from '../types';
import { 
  UserPlusIcon, 
  XMarkIcon, 
  KeyIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  CalendarDaysIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  CameraIcon,
  PrinterIcon,
  IdentificationIcon,
  EyeIcon,
  ArrowPathIcon,
  PhotoIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';
import { IdCaptureModal } from './IdCaptureModal';
import { IdDocumentViewerModal } from './IdDocumentViewerModal';

export const WalkInCheckInModal: React.FC = () => {
  const { 
    isWalkInModalOpen, 
    closeWalkInModal, 
    walkInCheckIn, 
    rooms, 
    language, 
    t, 
    openReceiptModal,
    preselectedWalkInRoomId,
    settings
  } = useHotel();

  const isKhmer = language === 'KM';

  // Available rooms for walk-in
  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE');

  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState<string>(preselectedWalkInRoomId || availableRooms[0]?.id || '');
    const [preWarmedStream, setPreWarmedStream] = useState<MediaStream | null>(null);
  // Room "cart" — allows booking multiple rooms (e.g. 2 One Bed Rooms + 3 Twin Bed Rooms) in one walk-in
  const [cartRooms, setCartRooms] = useState<Room[]>([]);

  React.useEffect(() => {
    if (preselectedWalkInRoomId) {
      setSelectedRoomId(preselectedWalkInRoomId);
      const room = rooms.find(r => r.id === preselectedWalkInRoomId);
      if (room) {
        setKeyCardNumber(`CARD-${room.number}`);
      }
    } else if (availableRooms.length > 0 && !availableRooms.some(r => r.id === selectedRoomId)) {
      setSelectedRoomId(availableRooms[0].id);
      setKeyCardNumber(`CARD-${availableRooms[0].number}`);
    }
  }, [isWalkInModalOpen, preselectedWalkInRoomId]);
  const [guestName, setGuestName] = useState<string>('');
  const [guestNameKm, setGuestNameKm] = useState<string>('');
  const [passportOrId, setPassportOrId] = useState<string>('');
  const [phone, setPhone] = useState<string>('+855 ');
  const [email, setEmail] = useState<string>('');
  const [nationality, setNationality] = useState<string>('Cambodia');
  const [isVip, setIsVip] = useState<boolean>(false);
  
  // ID Capture State
  const [isIdCaptureOpen, setIsIdCaptureOpen] = useState<boolean>(false);
  const [idCaptureInitialMode, setIdCaptureInitialMode] = useState<'CAMERA' | 'SCANNER'>('CAMERA');
  const [capturedIdImage, setCapturedIdImage] = useState<string | undefined>(undefined);
  const [capturedIdSource, setCapturedIdSource] = useState<'CAMERA' | 'SCANNER' | 'UPLOAD' | undefined>(undefined);
  const [capturedIdScannedAt, setCapturedIdScannedAt] = useState<string | undefined>(undefined);
  const [isViewingCapturedId, setIsViewingCapturedId] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const HOURLY_STAY_RATE_USD = 10;
  const HOURLY_STAY_HOURS = 2;

  const [stayType, setStayType] = useState<'OVERNIGHT' | 'HOURLY'>('OVERNIGHT');
  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);
  const [nights, setNights] = useState<number>(1);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [keyCardNumber, setKeyCardNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Payment State
  const [currency, setCurrency] = useState<Currency>('USD');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<'FULL' | 'CUSTOM' | 'LATER'>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [bankName, setBankName] = useState<string>('ABA Bank (KHQR)');
  const [txnRef, setTxnRef] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isWalkInModalOpen) return null;

  const isKhr = currency === 'KHR';

  // Rooms still selectable in the dropdown (already-added rooms are removed from it)
  const selectableRooms = availableRooms.filter(r => !cartRooms.some(c => c.id === r.id));
  const currentRoom = rooms.find(r => r.id === selectedRoomId) || selectableRooms[0];
  const roomPrice = currentRoom ? (isKhr ? currentRoom.priceKhr : currentRoom.priceUsd) : 0;

  const exchangeRate = settings.exchangeRateUsdToKhr || 4100;
  const hourlyRatePerRoom = isKhr ? HOURLY_STAY_RATE_USD * exchangeRate : HOURLY_STAY_RATE_USD;

  // Total cost across every room in the cart
  const totalCost = stayType === 'HOURLY'
    ? cartRooms.length * hourlyRatePerRoom
    : cartRooms.reduce((sum, r) => sum + (isKhr ? r.priceKhr : r.priceUsd) * nights, 0);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setKeyCardNumber(`CARD-${room.number}`);
    }
  };

  const handleAddRoomToCart = () => {
    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room || cartRooms.some(c => c.id === room.id)) return;
    const nextCart = [...cartRooms, room];
    setCartRooms(nextCart);
    const nextSelectable = selectableRooms.filter(r => r.id !== room.id);
    if (nextSelectable.length > 0) {
      setSelectedRoomId(nextSelectable[0].id);
      setKeyCardNumber(`CARD-${nextSelectable[0].number}`);
    } else {
      setSelectedRoomId('');
    }
  };

  const handleRemoveRoomFromCart = (roomId: string) => {
    setCartRooms(prev => prev.filter(r => r.id !== roomId));
    if (!selectedRoomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoomId(room.id);
        setKeyCardNumber(`CARD-${room.number}`);
      }
    }
  };

  const handleCheckInDateChange = (newCheckIn: string) => {
    setCheckInDate(newCheckIn);
    const checkIn = new Date(newCheckIn);
    const checkOut = new Date(checkOutDate);
    const diffNights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);

    if (diffNights >= 1) {
      setNights(diffNights);
    } else {
      const preservedNights = Math.max(1, nights);
      setNights(preservedNights);
      setCheckOutDate(new Date(checkIn.getTime() + preservedNights * 86400000).toISOString().split('T')[0]);
    }
  };

  const handleNightsChange = (numNights: number) => {
    const validNights = Math.max(1, numNights);
    setNights(validNights);
    const checkIn = new Date(checkInDate);
    const newCheckOut = new Date(checkIn.getTime() + validNights * 86400000);
    setCheckOutDate(newCheckOut.toISOString().split('T')[0]);
  };

  const handleCheckOutDateChange = (dateStr: string) => {
    setCheckOutDate(dateStr);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(dateStr);
    const diffNights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
    if (diffNights >= 1) {
      setNights(diffNights);
    }
  };

  const openCameraCapture = async () => {
    setIdCaptureInitialMode('CAMERA');
    // Request the camera immediately, inside this click handler — this is
    // what makes iOS Safari treat it as a real user gesture and actually
    // grant access, instead of silently stalling.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        setPreWarmedStream(stream);
      }
    } catch (err) {
      console.warn('Camera pre-warm failed, modal will fall back to its own request:', err);
      setPreWarmedStream(null);
    }
    setIsIdCaptureOpen(true);
  };

  const openScannerCapture = () => {
    setIdCaptureInitialMode('SCANNER');
    setIsIdCaptureOpen(true);
  };

  const handleIdCaptureComplete = (imageDataUrl: string, source: 'CAMERA' | 'SCANNER', extractedId?: string) => {
    setCapturedIdImage(imageDataUrl);
    setCapturedIdSource(source);
    setCapturedIdScannedAt(new Date().toISOString());
    setIsIdCaptureOpen(false);

    if (extractedId && (!passportOrId || passportOrId.trim() === '')) {
      setPassportOrId(extractedId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!guestName.trim()) {
      setErrorMessage(isKhmer ? 'សូមបញ្ចូលឈ្មោះភ្ញៀវ។' : 'Please enter guest name.');
      return;
    }
    if (!passportOrId.trim()) {
      setErrorMessage(isKhmer ? 'សូមបញ្ចូលលេខលិខិតឆ្លងដែន ឬអត្តសញ្ញាណប័ណ្ណ។' : 'Please enter passport or ID number.');
      return;
    }
    if (cartRooms.length === 0) {
      setErrorMessage(isKhmer ? 'សូមបន្ថែមបន្ទប់យ៉ាងហោចណាស់មួយ។' : 'Please add at least one room.');
      return;
    }

    let depositVal = 0;
    if (paymentOption === 'FULL') {
      depositVal = totalCost;
    } else if (paymentOption === 'CUSTOM') {
      depositVal = parseFloat(depositAmount) || 0;
    }

    try {
      const isHourly = stayType === 'HOURLY';
      const hourlyDeadline = new Date(new Date(checkInDate).getTime() + HOURLY_STAY_HOURS * 3600000);
      const hourlyNote = isKhmer
        ? `គេងម៉ោង (${HOURLY_STAY_HOURS} ម៉ោង) — ត្រូវចាកចេញត្រឹមម៉ោង ${hourlyDeadline.getHours()}:${String(hourlyDeadline.getMinutes()).padStart(2, '0')}`
        : `Hourly Stay (${HOURLY_STAY_HOURS}h) — check-out by ${hourlyDeadline.getHours()}:${String(hourlyDeadline.getMinutes()).padStart(2, '0')}`;

      const result = walkInCheckIn({
        guestName,
        guestNameKm,
        passportOrId,
        phone,
        email,
        nationality,
        roomIds: cartRooms.map(r => r.id),
        checkInDate,
        checkOutDate: isHourly ? checkInDate : checkOutDate,
        nights: isHourly ? 1 : nights,
        adults,
        children,
        currency,
        stayType,
        hourlyRatePerRoom: isHourly ? hourlyRatePerRoom : undefined,
        specialRequests: isHourly
          ? (specialRequests ? `${hourlyNote} | ${specialRequests}` : hourlyNote)
          : specialRequests,
        depositAmount: depositVal > 0 ? depositVal : undefined,
        depositMethod: paymentMethod,
        bankName: paymentMethod === 'BANK' ? bankName : undefined,
        txnRef: paymentMethod === 'BANK' ? txnRef : undefined,
        isVip,
        keyCardNumber: keyCardNumber || `CARD-${currentRoom?.number}`,
        idCardImage: capturedIdImage,
        idSource: capturedIdSource,
        idScannedAt: capturedIdScannedAt,
      });

      setIsSuccess(true);
      setTimeout(() => {
        closeWalkInModal();
        setIsSuccess(false);
        if (result.payment) {
          openReceiptModal(result.payment);
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Check-in failed');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-3xl overflow-hidden shadow-2xl my-8">
          
          {/* Header */}
          <div className="p-5 bg-linear-to-r from-[#111B3A] via-[#1A284F] to-[#253B73] text-white flex items-center justify-between border-b border-[#C9A96E]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E]">
                <UserPlusIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  {t.checkInOut.walkInTitle}
                  <span className="px-2 py-0.5 rounded-full bg-[#D81B73] text-[10px] font-extrabold tracking-wide uppercase">
                    Direct Check-In
                  </span>
                </h3>
                <p className="text-xs text-gray-300">
                  {isKhmer 
                    ? 'ចុះឈ្មោះភ្ញៀវផ្ទាល់ ថត/ស្កេនអត្តសញ្ញាណប័ណ្ណ និងបែងចែកបន្ទប់ភ្លាមៗ' 
                    : 'Register direct walk-in guest, capture ID/passport, and assign room instantly'}
                </p>
              </div>
            </div>
            <button
              onClick={closeWalkInModal}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {isSuccess ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {isKhmer ? 'ការចុះឈ្មោះភ្ញៀវចូលស្នាក់នៅបានជោគជ័យ!' : 'Guest Checked-In Successfully!'}
              </h3>
              <p className="text-xs text-gray-500">
                {isKhmer ? 'ប្រព័ន្ធបានកត់ត្រាព័ត៌មានភ្ញៀវ និងរូបភាពអត្តសញ្ញាណប័ណ្ណរួចរាល់។' : 'Guest profile, room key, and ID document scan have been saved.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Guest Information & ID Intake */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#111B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-[#253B73]" />
                    {t.checkInOut.guestDetails}
                  </h4>
                  <label className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVip}
                      onChange={(e) => setIsVip(e.target.checked)}
                      className="rounded text-[#D81B73] focus:ring-[#D81B73]"
                    />
                    <SolidSparklesIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{t.checkInOut.vipGuest}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {t.checkInOut.guestName} *
                    </label>
                    <input
                      type="text"
                      // required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {t.checkInOut.guestNameKm}
                    </label>
                    <input
                      type="text"
                      value={guestNameKm}
                      onChange={(e) => setGuestNameKm(e.target.value)}
                      placeholder="ឧទាហរណ៍៖ ចន ស្មីត"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>

                  {/* National ID / Passport with Camera & Scanner Hardware Actions */}
                  <div className="sm:col-span-2 bg-[#F8FAFC] p-3.5 rounded-2xl border border-blue-100/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <IdentificationIcon className="w-4 h-4 text-[#253B73]" />
                        <span>{t.checkInOut.passportOrId} *</span>
                      </label>

                      {/* Camera & Scan Buttons for Staff on Phone / PC connected to Printer */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={openCameraCapture}
                          className="px-3 py-1.5 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                          title="Take photo using phone or tablet camera"
                        >
                          <CameraIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>{isKhmer ? 'កាមេរ៉ា (ទូរស័ព្ទ)' : 'Camera'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={openScannerCapture}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                          title="Scan using desktop printer scanner"
                        >
                          <PrinterIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>{isKhmer ? 'ស្កេន (ម៉ាស៊ីនព្រីន PC)' : 'Scan'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={passportOrId}
                        onChange={(e) => setPassportOrId(e.target.value)}
                        placeholder={t.checkInOut.passportPlaceholder}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden bg-white"
                      />
                    </div>

                    {/* Captured ID Preview Badge */}
                    {capturedIdImage ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={capturedIdImage} 
                            alt="ID Preview" 
                            className="w-12 h-8 rounded-md object-cover border border-emerald-300 shadow-xs" 
                          />
                          <div>
                            <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                {isKhmer ? 'បានភ្ជាប់ឯកសារអត្តសញ្ញាណប័ណ្ណរួច' : 'ID Document Attached'}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-200 text-emerald-800">
                                {capturedIdSource === 'CAMERA' ? 'CAMERA' : 'SCANNER'}
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-700">
                              {isKhmer ? 'រក្សាទុកក្នុងទិន្នន័យភ្ញៀវដោយស្វ័យប្រវត្តិ' : 'Stored securely in guest registry'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsViewingCapturedId(true)}
                            className="p-1.5 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1 cursor-pointer"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>{isKhmer ? 'មើល' : 'View'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (capturedIdSource === 'SCANNER') {
                                openScannerCapture();
                              } else {
                                openCameraCapture();
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white text-gray-700 hover:bg-gray-100 text-[11px] font-semibold border border-gray-200 flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            <span>{isKhmer ? 'ថតឡើងវិញ' : 'Retake'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <span className="text-amber-500 font-bold">★</span>
                        <span>
                          {isKhmer 
                            ? 'ចុចប៊ូតុង "កាមេរ៉ា" (លើទូរស័ព្ទ) ឬ "ស្កេន" (លើកុំព្យូទ័រភ្ជាប់ម៉ាស៊ីនព្រីន) ដើម្បីថត/ស្កេនអត្តសញ្ញាណប័ណ្ណភ្ញៀវចូលប្រព័ន្ធ' 
                            : 'Click "Camera" on mobile phone or "Scan" on PC to automatically store ID card photo.'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {t.checkInOut.contactPhone}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {t.checkInOut.nationality}
                    </label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    >
                      <option value="Cambodia">Cambodia (កម្ពុជា)</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Australia">Australia</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Other">Other Country</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {t.checkInOut.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guest@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Room Selection & Stay Dates */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#111B3A] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyIcon className="w-4 h-4 text-[#253B73]" />
                  {t.checkInOut.roomAssignment} & {t.checkInOut.stayPeriod}
                </h4>

                {availableRooms.length === 0 ? (
                  <div className="p-3 bg-[#FBF7EF] border border-[#EAD9AF] text-[#6E5630] text-xs rounded-xl">
                    No rooms currently available for walk-in.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Room picker + Add-to-booking button */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          {t.checkInOut.selectRoom} {cartRooms.length === 0 ? '*' : ''}
                        </label>
                        <select
                          value={selectedRoomId}
                          onChange={(e) => handleRoomChange(e.target.value)}
                          disabled={selectableRooms.length === 0}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden disabled:opacity-50"
                        >
                          {selectableRooms.length === 0 && <option value="">No more rooms available</option>}
                          {selectableRooms.map(r => (
                            <option key={r.id} value={r.id}>
                              Room {r.number} (Floor {r.floor}) — {r.categoryName || t.roomTypes[r.type as keyof typeof t.roomTypes] || r.type} (${r.priceUsd} / {r.priceKhr.toLocaleString()} KHR)
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRoomToCart}
                        disabled={!selectedRoomId || selectableRooms.length === 0}
                        className="px-4 py-2 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        + Add Room
                      </button>
                    </div>

                    {/* Cart of added rooms */}
                                        {/* Stay Type Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStayType('OVERNIGHT')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          stayType === 'OVERNIGHT'
                            ? 'bg-[#253B73] text-white border-[#253B73] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {isKhmer ? 'ស្នាក់នៅមួយយប់' : 'Overnight Stay'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStayType('HOURLY');
                          setCheckOutDate(checkInDate);
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          stayType === 'HOURLY'
                            ? 'bg-[#D81B73] text-white border-[#D81B73] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {isKhmer ? `គេងម៉ោង (${HOURLY_STAY_HOURS} ម៉ោង)` : `Hourly Stay (${HOURLY_STAY_HOURS}h)`}
                      </button>
                    </div>

                    {/* Cart of added rooms */}
                    {cartRooms.length > 0 && (
                      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                        {cartRooms.map(r => (
                          <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-[#FAF9F6]">
                            <div className="text-xs">
                              <span className="font-bold text-[#111B3A]">Room {r.number}</span>
                              <span className="text-gray-500"> — {r.categoryName || t.roomTypes[r.type as keyof typeof t.roomTypes] || r.type}</span>
                              <span className="text-gray-400"> · {isKhr ? `${r.priceKhr.toLocaleString()} KHR` : `$${r.priceUsd} USD`}/night</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveRoomFromCart(r.id)}
                              className="text-gray-400 hover:text-[#BC4E49] transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          {t.checkInOut.keyCardNumber}
                        </label>
                        <input
                          type="text"
                          value={keyCardNumber}
                          onChange={(e) => setKeyCardNumber(e.target.value)}
                          placeholder={`CARD-${currentRoom?.number || '101'}`}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                        />
                      </div>

                      <div />

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          {t.checkInOut.checkInDate}
                        </label>
                        <FormattedDateInput
                          value={checkInDate}
                          onChange={(d) => {
                            handleCheckInDateChange(d);
                            if (stayType === 'HOURLY') setCheckOutDate(d);
                          }}
                          language={language}
                        />
                      </div>

                      {stayType === 'OVERNIGHT' ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            {isKhmer ? 'ថ្ងៃចេញ' : 'Check-Out Date'}
                          </label>
                          <FormattedDateInput
                            value={checkOutDate}
                            onChange={handleCheckOutDateChange}
                            language={language}
                            min={checkInDate}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            {isKhmer ? 'រយៈពេលស្នាក់នៅ' : 'Duration'}
                          </label>
                          <div className="px-3.5 py-2 rounded-xl border border-[#EAD9AF] bg-[#FBF7EF] text-xs font-bold text-[#6E5630] flex items-center gap-1.5">
                            <span>⏰</span>
                            <span>{HOURLY_STAY_HOURS} {isKhmer ? 'ម៉ោង' : 'hours'} · {formatDate(checkInDate, language)}</span>
                          </div>
                        </div>
                      )}

                    {stayType === 'OVERNIGHT' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        {t.checkInOut.nights}
                      </label>
                      <div className="flex items-stretch gap-2">
                        <button
                          type="button"
                          onClick={() => handleNightsChange(nights - 1)}
                          disabled={nights <= 1}
                          className="w-11 shrink-0 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-lg font-bold text-[#253B73] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={nights}
                          onChange={(e) => handleNightsChange(parseInt(e.target.value) || 1)}
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-center focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleNightsChange(nights + 1)}
                          disabled={nights >= 30}
                          className="w-11 shrink-0 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-lg font-bold text-[#253B73] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Dual-Currency Billing & Front Desk Payment */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#111B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCardIcon className="w-4 h-4 text-[#D81B73]" />
                    {t.checkInOut.paymentDeposit}
                  </h4>

                  {/* Currency Selector */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currency === 'USD' ? 'bg-[#253B73] text-white shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('KHR')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currency === 'KHR' ? 'bg-[#253B73] text-white shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      KHR (៛)
                    </button>
                  </div>
                </div>

                {/* Total Calculation Banner */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">
                      {stayType === 'HOURLY'
                        ? `${cartRooms.length} room${cartRooms.length !== 1 ? 's' : ''} × ${HOURLY_STAY_HOURS}h stay`
                        : `${cartRooms.length} room${cartRooms.length !== 1 ? 's' : ''} × ${nights} ${t.checkInOut.nights}`}
                    </span>
                    <span className="text-sm font-bold text-[#111B3A]">{t.checkInOut.totalCost}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-extrabold text-[#253B73]">
                      {isKhr ? `${totalCost.toLocaleString()} KHR` : `$${totalCost.toFixed(2)} USD`}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {isKhr ? `Equivalent approx. $${(totalCost / 4000).toFixed(2)} USD` : `Equivalent approx. ${(totalCost * 4000).toLocaleString()} KHR`}
                    </span>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('FULL');
                      setDepositAmount(String(totalCost));
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      paymentOption === 'FULL'
                        ? 'bg-[#253B73] text-white border-[#253B73] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      paymentOption === 'CUSTOM'
                        ? 'bg-[#D81B73] text-white border-[#D81B73] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t.checkInOut.payCustomDeposit}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('LATER');
                      setDepositAmount('0');
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      paymentOption === 'LATER'
                        ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t.checkInOut.noDepositNow}
                  </button>
                </div>

                {paymentOption !== 'LATER' && (
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          {t.payment.amount} ({currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={isKhr ? '500' : '0.01'}
                          value={depositAmount || (paymentOption === 'FULL' ? totalCost : '')}
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
                            onClick={() => setPaymentMethod('CASH')}
                            className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                              paymentMethod === 'CASH'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-gray-700 border-gray-300'
                            }`}
                          >
                            <BanknotesIcon className="w-4 h-4" />
                            <span>{t.payment.cash}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('BANK')}
                            className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                              paymentMethod === 'BANK'
                                ? 'bg-[#253B73] text-white border-[#253B73]'
                                : 'bg-white text-gray-700 border-gray-300'
                            }`}
                          >
                            <CreditCardIcon className="w-4 h-4" />
                            <span>{t.payment.bank}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'BANK' && (
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

              {/* Special Request */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.checkInOut.specialRequests}
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Vegetarian breakfast, pool view preference, early wake-up call"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeWalkInModal}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                
                <button
                  type="submit"
                  disabled={availableRooms.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircleIcon className="w-4 h-4 text-[#C9A96E]" />
                  <span>{t.checkInOut.markCheckedIn}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>

      {/* ID Capture / Scanner Hardware Modal */}
      <IdCaptureModal
        isOpen={isIdCaptureOpen}
        onClose={() => {
          setIsIdCaptureOpen(false);
          if (preWarmedStream) {
            preWarmedStream.getTracks().forEach(track => track.stop());
            setPreWarmedStream(null);
          }
        }}
        initialMode={idCaptureInitialMode}
        guestName={guestName || 'Walk-In Guest'}
        onCaptureComplete={(imageDataUrl, source, extractedId) => {
          if (preWarmedStream) {
            preWarmedStream.getTracks().forEach(track => track.stop());
            setPreWarmedStream(null);
          }
          handleIdCaptureComplete(imageDataUrl, source, extractedId);
        }}
        initialStream={preWarmedStream}
      />

      {/* Preview modal for captured ID */}
      {capturedIdImage && (
        <IdDocumentViewerModal
          isOpen={isViewingCapturedId}
          onClose={() => setIsViewingCapturedId(false)}
          guest={{
            id: 'temp-preview',
            name: guestName || 'Walk-In Guest',
            passportOrId: passportOrId || 'N/A',
            phone: phone,
            nationality: nationality,
            vipStatus: isVip,
            idCardImage: capturedIdImage,
            idSource: capturedIdSource,
            idScannedAt: capturedIdScannedAt,
            createdAt: new Date().toISOString()
          }}
        />
      )}
    </>
  );
};
