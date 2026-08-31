import { Language } from '../types';

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
];

function toKhmerDigits(value: number | string): string {
  return String(value)
    .split('')
    .map(ch => (/[0-9]/.test(ch) ? KHMER_DIGITS[parseInt(ch, 10)] : ch))
    .join('');
}

/**
 * Formats a date as DD/MM/YYYY in English (e.g. "29/08/2026"),
 * or DD/MonthName/YYYY in Khmer digits + Khmer month name in Khmer
 * (e.g. "២៩/សីហា/២០២៦"), matching the hotel's house style.
 */
export function formatDate(dateStr?: string | null, language: Language = 'EN'): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate();
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();

  if (language === 'KM') {
    return `${toKhmerDigits(day)}/${KHMER_MONTHS[month]}/${toKhmerDigits(year)}`;
  }

  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  return `${dd}/${mm}/${year}`;
}

/** Same as formatDate, but appends the time (e.g. for actual check-out timestamps). */
export function formatDateTime(dateStr?: string | null, language: Language = 'EN'): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const datePart = formatDate(dateStr, language);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const isAm = hours < 12;
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const mm = String(minutes).padStart(2, '0');

  if (language === 'KM') {
    return `${datePart} ${toKhmerDigits(hours)}:${toKhmerDigits(mm)} ${isAm ? 'ព្រឹក' : 'ល្ងាច'}`;
  }
  return `${datePart} ${hours}:${mm} ${isAm ? 'AM' : 'PM'}`;
}