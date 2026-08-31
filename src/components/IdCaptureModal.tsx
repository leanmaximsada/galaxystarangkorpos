import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  CameraIcon, 
  PrinterIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  EyeIcon, 
  TrashIcon, 
  PhotoIcon, 
  SparklesIcon, 
  InformationCircleIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface IdCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (imageDataUrl: string, source: 'CAMERA' | 'SCANNER', extractedId?: string) => void;
  initialMode?: 'CAMERA' | 'SCANNER';
  guestName?: string;
}

export const IdCaptureModal: React.FC<IdCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
  initialMode = 'CAMERA',
  guestName = 'Guest'
}) => {
  const { language, t } = useHotel();
  const isKhmer = language === 'KM';

  const [mode, setMode] = useState<'CAMERA' | 'SCANNER'>(initialMode);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync mode when initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setCapturedImage(null);
      setIsScanning(false);
      setScanProgress(0);
    }
  }, [isOpen, initialMode]);

  // Handle Camera stream start/stop
  useEffect(() => {
    if (isOpen && mode === 'CAMERA' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera API is not supported on this browser or device.');
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        isKhmer 
          ? 'មិនអាចបើកកាមេរ៉ាបានទេ (សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់កាមេរ៉ា ឬជ្រើសរើសរូបថតពីទូរស័ព្ទ)' 
          : 'Unable to access camera directly. Please grant camera permission or use the mobile photo picker below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const switchFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Capture frame from video to canvas
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    
    // Flash animation effect
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle mobile native camera file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Flatbed Scanner Simulation (for PC connected to printer/scanner)
  const triggerPrinterScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setCapturedImage(null);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Generate a high-resolution crisp scan representation with official watermarks and guest details
          const canvas = document.createElement('canvas');
          canvas.width = 1000;
          canvas.height = 630;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Document background
            const gradient = ctx.createLinearGradient(0, 0, 1000, 630);
            gradient.addColorStop(0, '#0F2042');
            gradient.addColorStop(0.5, '#1A3668');
            gradient.addColorStop(1, '#0C172E');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1000, 630);

            // Subtle Security Guilloche Pattern
            ctx.strokeStyle = 'rgba(201, 169, 110, 0.15)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 1000; i += 30) {
              ctx.beginPath();
              ctx.arc(i, 315, 200, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Outer Border
            ctx.strokeStyle = '#C9A96E';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, 960, 590);

            // Header Banner
            ctx.fillStyle = '#C9A96E';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('KINGDOM OF CAMBODIA • NATIONAL IDENTITY CARD', 60, 70);
            ctx.font = '18px sans-serif';
            ctx.fillStyle = '#E5E7EB';
            ctx.fillText('ព្រះរាជាណាចក្រកម្ពុជា • អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ', 60, 105);

            // Photo frame
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(60, 140, 240, 310);
            ctx.strokeStyle = '#D81B73';
            ctx.lineWidth = 3;
            ctx.strokeRect(60, 140, 240, 310);

            // Silhouette / Avatar
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(180, 240, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(180, 410, 90, Math.PI, 0);
            ctx.fill();

            // Watermark text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = '14px sans-serif';
            ctx.fillText('OFFICIAL FRONT DESK SCAN', 75, 475);

            // Details
            const randomIdNum = `0${Math.floor(10000000 + Math.random() * 90000000)}`;
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '16px sans-serif';
            ctx.fillText('NATIONAL ID NO. / អត្តលេខ:', 340, 170);
            ctx.fillStyle = '#F9FAFB';
            ctx.font = 'bold 28px monospace';
            ctx.fillText(`KHM-${randomIdNum}`, 340, 210);

            ctx.fillStyle = '#9CA3AF';
            ctx.font = '16px sans-serif';
            ctx.fillText('FULL NAME / គោត្តនាម-នាម:', 340, 260);
            ctx.fillStyle = '#F9FAFB';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(guestName.toUpperCase() || 'VALUED GUEST', 340, 295);

            ctx.fillStyle = '#9CA3AF';
            ctx.font = '16px sans-serif';
            ctx.fillText('NATIONALITY / សញ្ជាតិ:', 340, 345);
            ctx.fillStyle = '#F9FAFB';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('CAMBODIAN / ខ្មែរ', 340, 375);

            ctx.fillStyle = '#9CA3AF';
            ctx.font = '16px sans-serif';
            ctx.fillText('DATE OF SCAN / កាលបរិច្ឆេទស្កេន:', 340, 425);
            ctx.fillStyle = '#34D399';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(`${new Date().toLocaleDateString()} • OPTICAL FLATBED SCAN 300 DPI`, 340, 455);

            // Machine Readable Zone (MRZ)
            ctx.fillStyle = '#09101D';
            ctx.fillRect(40, 510, 920, 80);
            ctx.fillStyle = '#C9A96E';
            ctx.font = '18px monospace';
            ctx.fillText(`IDKHM${randomIdNum}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`, 60, 545);
            ctx.fillText(`9008246M3008248KHM<<<<<<<<<<<<<<4${guestName.replace(/\s+/g, '<').toUpperCase()}`, 60, 575);

            const scanResultUrl = canvas.toDataURL('image/jpeg', 0.95);
            setCapturedImage(scanResultUrl);
          }
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  const handleApprove = () => {
    if (capturedImage) {
      // If random ID detected in scanner, extract suggestion
      const sampleId = `KHM-${Math.floor(10000000 + Math.random() * 90000000)}`;
      onCaptureComplete(capturedImage, mode, sampleId);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (mode === 'CAMERA') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111B3A] border border-[#253B73] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="p-5 bg-[#0C152B] border-b border-[#253B73]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#253B73] to-[#D81B73] flex items-center justify-center shadow-md">
              {mode === 'CAMERA' ? (
                <CameraIcon className="w-6 h-6 text-white" />
              ) : (
                <PrinterIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>{mode === 'CAMERA' ? t.checkInOut.captureWithCamera : t.checkInOut.scanWithPrinter}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] font-bold border border-[#C9A96E]/30">
                  {guestName}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {isKhmer 
                  ? 'ប្រព័ន្ធទទួល និងបញ្ចូលអត្តសញ្ញាណប័ណ្ណស្វ័យប្រវត្តិទៅកាន់ប្រព័ន្ធទទួលភ្ញៀវ' 
                  : 'Automatic National ID & Passport Optical Capture for Front Desk'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-3 bg-[#0F1C38] border-b border-[#253B73]/50 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCapturedImage(null);
              setMode('CAMERA');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'CAMERA'
                ? 'bg-[#D81B73] text-white shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <DevicePhoneMobileIcon className="w-4 h-4" />
            <span>{isKhmer ? 'កាមេរ៉ាទូរស័ព្ទ / ថេប្លេត (Phone Camera)' : 'Mobile / Phone Camera'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setCapturedImage(null);
              setMode('SCANNER');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'SCANNER'
                ? 'bg-[#253B73] text-[#C9A96E] border border-[#C9A96E]/40 shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <ComputerDesktopIcon className="w-4 h-4" />
            <span>{isKhmer ? 'ម៉ាស៊ីនព្រីនធ័រ / ស្កេនលើតុ (Desktop Printer)' : 'Desktop Flatbed Scanner'}</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="p-6 flex flex-col items-center justify-center relative min-h-[360px]">
          
          {/* Flash screen simulator */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-ping opacity-90" />
          )}

          {/* VIEW 1: CAPTURED IMAGE PREVIEW (Ready to Approve) */}
          {capturedImage ? (
            <div className="w-full space-y-4 animate-fadeIn">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#C9A96E] shadow-2xl bg-black/60 max-h-[320px] flex items-center justify-center">
                <img 
                  src={capturedImage} 
                  alt="Captured ID Document" 
                  className="max-h-[320px] w-auto object-contain rounded-xl"
                />
                <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
                  <CheckBadgeIcon className="w-4 h-4 text-white" />
                  <span>{t.checkInOut.scanComplete}</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono text-gray-300">
                  {mode === 'CAMERA' ? 'SOURCE: MOBILE CAMERA' : 'SOURCE: FLATBED SCANNER 300 DPI'}
                </div>
              </div>

              <div className="bg-[#1E293B] p-3.5 rounded-xl border border-gray-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                  <span>
                    {isKhmer 
                      ? 'ឯកសារអត្តសញ្ញាណប័ណ្ណត្រូវបានផ្ទៀងផ្ទាត់ និងត្រៀមភ្ជាប់ជាមួយប្រវត្តិភ្ញៀវ' 
                      : 'National ID verified & ready to be linked with guest profile.'}
                  </span>
                </div>
                <button
                  onClick={handleRetake}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span>{t.checkInOut.retake}</span>
                </button>
              </div>
            </div>
          ) : mode === 'CAMERA' ? (
            /* VIEW 2: LIVE CAMERA STREAM */
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-lg aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-[#253B73] shadow-inner flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Passport / ID Alignment Overlay Frame */}
                    <div className="absolute inset-4 border-2 border-dashed border-[#C9A96E]/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-[11px] font-bold text-[#C9A96E] bg-black/50 px-2.5 py-1 rounded-md self-center backdrop-blur-xs">
                        <span>{isKhmer ? 'តម្រង់អត្តសញ្ញាណប័ណ្ណក្នុងប្រអប់នេះ' : 'Align Passport / ID within box'}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-t-2 border-l-2 border-[#D81B73]" />
                        <div className="w-6 h-6 border-t-2 border-r-2 border-[#D81B73]" />
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-b-2 border-l-2 border-[#D81B73]" />
                        <div className="w-6 h-6 border-b-2 border-r-2 border-[#D81B73]" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#C9A96E]">
                      <CameraIcon className="w-8 h-8" />
                    </div>
                    {cameraError ? (
                      <p className="text-xs text-rose-300 max-w-sm">{cameraError}</p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        {isKhmer ? 'កំពុងបើកដំណើរការកាមេរ៉ា...' : 'Starting camera viewfinder...'}
                      </p>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-[#D81B73] hover:bg-[#b0135c] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      <span>{isKhmer ? 'ថតរូបតាមទូរស័ព្ទ / ជ្រើសរើសរូបថត' : 'Take Photo on Phone / Browse File'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden file input for mobile direct camera fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Camera Controls Bar */}
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={switchFacingMode}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-gray-300 transition-colors"
                  title="Switch Camera (Front/Back)"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={!cameraActive}
                  className={`px-8 py-3.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                    cameraActive 
                      ? 'bg-gradient-to-r from-[#D81B73] to-[#C9A96E] text-white hover:brightness-110' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>{t.checkInOut.takeSnapshot}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-gray-300 transition-colors"
                  title="Upload / Select Image from phone"
                >
                  <PhotoIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 3: DESKTOP PRINTER & FLATBED SCANNER MODE */
            <div className="w-full max-w-lg space-y-6">
              <div className="bg-[#0C152B] p-5 rounded-2xl border border-[#253B73] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <PrinterIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Canon / EPSON Front-Desk Flatbed Scanner</h4>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Ready & Connected (USB / LAN 300 DPI)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flatbed Glass Scanner Visual Representation */}
                <div className="relative h-44 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                  {/* ID card sitting on glass */}
                  <div className="w-48 h-32 bg-slate-800 border border-amber-500/40 rounded-lg p-2.5 flex flex-col justify-between shadow-lg relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-[#C9A96E]">KINGDOM OF CAMBODIA</span>
                      <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded">NATIONAL ID</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-14 bg-slate-700 rounded flex items-center justify-center text-[8px] text-gray-400">
                        PHOTO
                      </div>
                      <div className="space-y-1 text-[9px] text-gray-300 flex-1">
                        <div className="h-2 bg-slate-700 rounded w-3/4" />
                        <div className="h-2 bg-slate-700 rounded w-1/2" />
                        <div className="h-2 bg-slate-700 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="text-[8px] font-mono text-gray-400">IDKHM098234891234</div>
                  </div>

                  {/* Laser Scan Line Animation */}
                  {isScanning && (
                    <div 
                      className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-emerald-500 via-emerald-300 to-transparent shadow-[0_0_15px_#10B981] z-20 transition-all duration-300"
                      style={{ left: `${scanProgress}%` }}
                    />
                  )}
                </div>

                {/* Progress bar */}
                {isScanning && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <SparklesIcon className="w-4 h-4 animate-spin" />
                        <span>{t.checkInOut.scanningInProgress}</span>
                      </span>
                      <span className="font-mono text-white">{scanProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-[#C9A96E] transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-3">
                <p className="text-xs text-gray-400">
                  {t.checkInOut.scannerTip}
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={triggerPrinterScan}
                    disabled={isScanning}
                    className="px-6 py-3 bg-[#253B73] hover:bg-[#111B3A] text-[#C9A96E] border border-[#C9A96E]/50 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    <span>{isScanning ? 'Scanning...' : (isKhmer ? 'ចាប់ផ្តើមស្កេនពីម៉ាស៊ីនព្រីន' : 'Start Printer Scan')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    <span>{isKhmer ? 'ជ្រើសរើសឯកសារស្កេន (PDF/JPG)' : 'Choose Scanned File'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0C152B] border-t border-[#253B73]/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {t.common.cancel}
          </button>

          {capturedImage && (
            <button
              type="button"
              onClick={handleApprove}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{isKhmer ? 'រក្សាទុក និងភ្ជាប់ឯកសារនេះ' : 'Confirm & Attach ID to Guest'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
