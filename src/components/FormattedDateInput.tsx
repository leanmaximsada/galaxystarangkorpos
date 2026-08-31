import React, { useRef } from 'react';
import { formatDate } from '../utils/dateFormatter';
import { Language } from '../types';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

interface FormattedDateInputProps {
  value: string; // ISO yyyy-mm-dd
  onChange: (value: string) => void;
  language: Language;
  min?: string;
  max?: string;
  className?: string;
}

export const FormattedDateInput: React.FC<FormattedDateInputProps> = ({
  value,
  onChange,
  language,
  min,
  max,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === 'function') {
      try {
        (el as any).showPicker();
      } catch {
        el.focus();
      }
    } else {
      el.focus();
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={openPicker}
        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#253B73] focus:outline-hidden cursor-pointer"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? formatDate(value, language) : (language === 'KM' ? 'ជ្រើសរើសកាលបរិច្ឆេទ' : 'Select date')}
        </span>
        <CalendarDaysIcon className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        tabIndex={-1}
      />
    </div>
  );
};