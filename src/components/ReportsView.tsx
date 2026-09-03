import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Currency, Payment, PaymentMethod } from '../types';
import { 
  ChartBarIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon, 
  CalculatorIcon, 
  CalendarDaysIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export const ReportsView: React.FC = () => {
  const { 
    payments, 
    rooms, 
    reservations, 
    openShiftCloseoutModal, 
    openReceiptModal, 
    language, 
    t 
  } = useHotel();

  const isKhmer = language === 'KM';
  const repText = t.reportsMgmt;

  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'KHR' | 'USD'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter completed payments
  const completedPayments = payments.filter(p => p.payment_status === 'PAID');

  // Revenue totals
  const totalRevenueUsd = completedPayments
    .filter(p => p.currency === 'USD')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRevenueKhr = completedPayments
    .filter(p => p.currency === 'KHR')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashUsd = completedPayments
    .filter(p => p.currency === 'USD' && p.payment_method === 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);

  const bankUsd = completedPayments
    .filter(p => p.currency === 'USD' && p.payment_method === 'BANK')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashKhr = completedPayments
    .filter(p => p.currency === 'KHR' && p.payment_method === 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);

  const bankKhr = completedPayments
    .filter(p => p.currency === 'KHR' && p.payment_method === 'BANK')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filtered transactions for the ledger
  const filteredPayments = payments.filter(p => {
    if (currencyFilter !== 'ALL' && p.currency !== currencyFilter) return false;
    if (methodFilter !== 'ALL' && p.payment_method !== methodFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchGuest = p.guest_name?.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchRes = p.reservation_id.toLowerCase().includes(q);
      const matchBank = p.bank_name?.toLowerCase().includes(q);
      if (!matchGuest && !matchId && !matchRes && !matchBank) return false;
    }
    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Receipt ID', 'Date', 'Guest Name', 'Reservation ID', 'Amount', 'Currency', 'Payment Method', 'Bank / Reference', 'Staff', 'Status'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.created_at,
      `"${p.guest_name}"`,
      p.reservation_id,
      p.amount,
      p.currency,
      p.payment_method,
      `"${p.bank_name || p.transaction_reference || ''}"`,
      p.received_by,
      p.payment_status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GalaxyStar_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ChartBarIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            {repText.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {repText.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openShiftCloseoutModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all"
          >
            <CalculatorIcon className="w-5 h-5" />
            {repText.shiftZReport}
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {repText.exportCsv}
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
            title="Print Report"
          >
            <PrinterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dual Currency Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USD Total Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-200">
                {repText.totalUsdRevenue}
              </p>
              <p className="text-3xl font-black mt-2 tracking-tight">
                ${totalRevenueUsd.toFixed(2)}
              </p>
            </div>
            <span className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-xs">
              <BanknotesIcon className="w-6 h-6" />
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-xs text-blue-200">
            <span>Cash: ${cashUsd.toFixed(2)}</span>
            <span>Bank/POS: ${bankUsd.toFixed(2)}</span>
          </div>
        </div>

        {/* KHR Total Card */}
        <div className="bg-gradient-to-br from-amber-900 to-yellow-950 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-200">
                {repText.totalKhrRevenue}
              </p>
              <p className="text-3xl font-black mt-2 tracking-tight">
                ៛{totalRevenueKhr.toLocaleString()}
              </p>
            </div>
            <span className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-xs">
              <BanknotesIcon className="w-6 h-6" />
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-xs text-amber-200">
            <span>Cash: ៛{cashKhr.toLocaleString()}</span>
            <span>Bank: ៛{bankKhr.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Settled Transactions Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{repText.totalTransactions}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{completedPayments.length}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            100% verified payment receipts
          </div>
        </div>

        {/* Net Combined Performance Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">USD Equivalent Net</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              ${(totalRevenueUsd + totalRevenueKhr / 4000).toFixed(2)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            Based on official peg @ 4,000 KHR
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* USD Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            USD Payment Channels Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Cash Drawer USD</span>
                <span className="font-bold">${cashUsd.toFixed(2)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${totalRevenueUsd > 0 ? (cashUsd / totalRevenueUsd) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Bank Transfer / KHQR & Card POS</span>
                <span className="font-bold">${bankUsd.toFixed(2)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${totalRevenueUsd > 0 ? (bankUsd / totalRevenueUsd) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* KHR Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            KHR Payment Channels Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Cash Drawer KHR (ប្រាក់សុទ្ធ)</span>
                <span className="font-bold">៛{cashKhr.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 rounded-full" 
                  style={{ width: `${totalRevenueKhr > 0 ? (cashKhr / totalRevenueKhr) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Bank Transfer / KHQR (ធនាគារ)</span>
                <span className="font-bold">៛{bankKhr.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${totalRevenueKhr > 0 ? (bankKhr / totalRevenueKhr) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ledger Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKhmer ? 'ស្វែងរកបង្កាន់ដៃ, ភ្ញៀវ...' : 'Search receipt, guest, ref...'}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <select
            value={currencyFilter}
            onChange={e => setCurrencyFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="ALL">All Currencies (USD & KHR)</option>
            <option value="USD">USD Only ($)</option>
            <option value="KHR">KHR Only (៛)</option>
          </select>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash Only</option>
            <option value="BANK">Bank Transfer / KHQR / Card</option>
          </select>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium self-end sm:self-auto"
          >
            {isKhmer ? 'ជម្រះ' : 'Clear'}
          </button>
        )}
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-amber-600" />
            {repText.financialLedger}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredPayments.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">{repText.receiptNumber}</th>
                <th className="py-3.5 px-4">{repText.dateTime}</th>
                <th className="py-3.5 px-4">{repText.guestName}</th>
                <th className="py-3.5 px-4">{repText.paymentMethod}</th>
                <th className="py-3.5 px-4">{repText.amount}</th>
                <th className="py-3.5 px-4">{repText.staff}</th>
                <th className="py-3.5 px-4">{repText.status}</th>
                <th className="py-3.5 px-4 text-right">{repText.receiptNumber}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredPayments.map(p => {
                const isKhr = p.currency === 'KHR';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.guest_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.reservation_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{p.payment_method}</span>
                      {p.bank_name && <div className="text-slate-400">{p.bank_name}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {isKhr ? `៛${p.amount.toLocaleString()}` : `$${p.amount.toFixed(2)}`}
                      <span className="text-xs font-normal text-slate-400 ml-1">{p.currency}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {p.received_by}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.payment_status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReceiptModal(p)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
