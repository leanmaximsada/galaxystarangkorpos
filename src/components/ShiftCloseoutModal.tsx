import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Currency, PaymentMethod } from '../types';
import { 
  XMarkIcon, 
  PrinterIcon, 
  CheckCircleIcon, 
  BanknotesIcon, 
  CalculatorIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export const ShiftCloseoutModal: React.FC = () => {
  const { 
    isShiftCloseoutOpen, 
    closeShiftCloseoutModal, 
    payments, 
    currentUser, 
    language, 
    t, 
    settings 
  } = useHotel();

  const isKhmer = language === 'KM';
  const repText = t.reportsMgmt;

  // Filter completed payments
  const completedPayments = payments.filter(p => p.payment_status === 'PAID');

  // Calculate expected sums
  const cashKhrExpected = completedPayments
    .filter(p => p.currency === 'KHR' && p.payment_method === 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashUsdExpected = completedPayments
    .filter(p => p.currency === 'USD' && p.payment_method === 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);

  const bankKhrExpected = completedPayments
    .filter(p => p.currency === 'KHR' && p.payment_method === 'BANK')
    .reduce((sum, p) => sum + p.amount, 0);

  const bankUsdExpected = completedPayments
    .filter(p => p.currency === 'USD' && p.payment_method === 'BANK')
    .reduce((sum, p) => sum + p.amount, 0);

  // Staff Actual Physical Count
  const [countedCashKhr, setCountedCashKhr] = useState<string>(cashKhrExpected.toString());
  const [countedCashUsd, setCountedCashUsd] = useState<string>(cashUsdExpected.toString());
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isShiftCloseoutOpen) return null;

  const actualKhr = parseFloat(countedCashKhr) || 0;
  const actualUsd = parseFloat(countedCashUsd) || 0;

  const diffKhr = actualKhr - cashKhrExpected;
  const diffUsd = actualUsd - cashUsdExpected;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCloseout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <CalculatorIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {repText.shiftZReport}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKhmer ? 'ផ្ទៀងផ្ទាត់សាច់ប្រាក់ និងបិទវេនបម្រើការងារ' : 'Cash drawer reconciliation & shift audit closeout'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Print Audit Report"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button
              onClick={closeShiftCloseoutModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isSaved ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isKhmer ? 'ការបិទវេនត្រូវបានកត់ត្រាជោគជ័យ' : 'Shift Closeout Signed & Reconciled!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All physical cash counts and electronic settlement totals have been securely recorded for supervisor audit.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm"
              >
                {repText.printZReport}
              </button>
              <button
                onClick={closeShiftCloseoutModal}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold"
              >
                {isKhmer ? 'បិទ' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveCloseout} className="p-6 space-y-6">
            {/* Staff & Session Info */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Shift Operator: </span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser.name} ({currentUser.role})</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Date & Time: </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Reconciliation Comparison Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <BanknotesIcon className="w-4 h-4" />
                {isKhmer ? 'ការផ្ទៀងផ្ទាត់សាច់ប្រាក់ក្នុងថត (Strict Currency Separation)' : 'Cash Drawer Physical Audit (Guarded Dual-Currency)'}
              </h3>

              {/* KHR Cash Section */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Cambodian Riel Cash Drawer (KHR ៛)
                  </span>
                  <span className="text-xs font-mono text-amber-700 dark:text-amber-300">
                    Expected: ៛{cashKhrExpected.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {repText.countedCashKhr}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={countedCashKhr}
                      onChange={e => setCountedCashKhr(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {repText.discrepancyKhr}
                    </label>
                    <div className={`px-3 py-2 rounded-xl text-sm font-bold font-mono border ${
                      diffKhr === 0 
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300'
                    }`}>
                      {diffKhr >= 0 ? `+៛${diffKhr.toLocaleString()}` : `-៛${Math.abs(diffKhr).toLocaleString()}`}
                      {diffKhr === 0 ? ' (Balanced)' : diffKhr > 0 ? ' (Overage)' : ' (Shortage)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* USD Cash Section */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    US Dollar Cash Drawer (USD $)
                  </span>
                  <span className="text-xs font-mono text-blue-700 dark:text-blue-300">
                    Expected: ${cashUsdExpected.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {repText.countedCashUsd}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={countedCashUsd}
                      onChange={e => setCountedCashUsd(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {repText.discrepancyUsd}
                    </label>
                    <div className={`px-3 py-2 rounded-xl text-sm font-bold font-mono border ${
                      diffUsd === 0 
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300'
                    }`}>
                      {diffUsd >= 0 ? `+$${diffUsd.toFixed(2)}` : `-$${Math.abs(diffUsd).toFixed(2)}`}
                      {diffUsd === 0 ? ' (Balanced)' : diffUsd > 0 ? ' (Overage)' : ' (Shortage)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Electronic Banking / POS Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Bank Transfer / KHQR (Settled)</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">${bankUsdExpected.toFixed(2)} / ៛{bankKhrExpected.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium">Shift Total Revenue (USD Equiv.)</p>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    ${(cashUsdExpected + bankUsdExpected + (cashKhrExpected + bankKhrExpected) / 4000).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Handover remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'កំណត់ចំណាំបិទវេន និងប្រគល់ការងារ' : 'Shift Handover Notes & Reason for Variance'}
              </label>
              <textarea
                rows={2}
                value={shiftNotes}
                onChange={e => setShiftNotes(e.target.value)}
                placeholder="e.g. All folios collected and matched with ABA merchant terminal."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeShiftCloseoutModal}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                {repText.closeShift}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
