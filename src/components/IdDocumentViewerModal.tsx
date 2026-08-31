import React from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  XMarkIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon, 
  ShieldCheckIcon,
  IdentificationIcon,
  CameraIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Guest } from '../types';

interface IdDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
}

export const IdDocumentViewerModal: React.FC<IdDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  guest
}) => {
  const { language, t } = useHotel();
  const isKhmer = language === 'KM';

  if (!isOpen || !guest) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!guest.idCardImage) return;
    const link = document.createElement('a');
    link.href = guest.idCardImage;
    link.download = `ID_${guest.name.replace(/\s+/g, '_')}_${guest.passportOrId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#111B3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#253B73] flex items-center justify-center text-[#C9A96E] border border-[#C9A96E]/30">
              <IdentificationIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{guest.name}</h3>
                {guest.vipStatus && (
                  <span className="px-2 py-0.5 rounded-full bg-[#D81B73] text-white text-[10px] font-bold">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300">
                {guest.passportOrId} • {guest.nationality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print ID Document"
            >
              <PrinterIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Print Copy</span>
            </button>
            {guest.idCardImage && (
              <button
                onClick={handleDownload}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download Image"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#FAF9F6]">
          
          {/* Badge indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-bold text-xs text-[#111B3A]">
                  {isKhmer ? 'ឯកសារអត្តសញ្ញាណប័ណ្ណផ្លូវការ' : 'Official National Identity Document Record'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {guest.idSource === 'CAMERA' 
                    ? 'Captured via Mobile / Tablet Front Desk Camera' 
                    : 'Scanned via Desktop Flatbed Scanner (300 DPI)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold">
                Status: Stored & Verified
              </span>
            </div>
          </div>

          {/* Document Preview Display */}
          <div className="bg-[#0C152B] p-4 rounded-2xl border border-gray-300 flex items-center justify-center min-h-[300px]">
            {guest.idCardImage ? (
              <img 
                src={guest.idCardImage} 
                alt={`ID Document of ${guest.name}`} 
                className="max-h-[420px] w-auto object-contain rounded-xl shadow-lg border border-gray-700"
              />
            ) : (
              <div className="text-center text-gray-400 py-12">
                <IdentificationIcon className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No image file stored for this guest ID.</p>
              </div>
            )}
          </div>

          {/* Guest Detailed Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Guest Name</span>
              <span className="text-xs font-bold text-[#111B3A]">{guest.name}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">ID / Passport #</span>
              <span className="text-xs font-mono font-bold text-[#253B73]">{guest.passportOrId}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Nationality</span>
              <span className="text-xs font-bold text-[#111B3A]">{guest.nationality}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Contact Phone</span>
              <span className="text-xs font-bold text-gray-700">{guest.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            {t.common.confirm}
          </button>
        </div>

      </div>
    </div>
  );
};
