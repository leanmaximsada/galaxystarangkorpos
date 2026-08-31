import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { HotelSettings } from '../types';
import { 
  Cog6ToothIcon, 
  BuildingOfficeIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  WifiIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { sendTelegramTestMessage } from '../utils/telegram';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, language, t } = useHotel();
  const isKhmer = language === 'KM';
  const settText = t.settingsMgmt;

  const [formData, setFormData] = useState<HotelSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string>('');

  const handleTestTelegram = async () => {
    if (!formData.telegramBotToken || !formData.telegramChatId) {
      setTestStatus('error');
      setTestError(isKhmer ? 'សូមបញ្ចូល Bot Token និង Chat ID សិន។' : 'Please enter both Bot Token and Chat ID first.');
      return;
    }
    setTestStatus('sending');
    setTestError('');
    const result = await sendTelegramTestMessage(formData.telegramBotToken, formData.telegramChatId);
    if (result.ok) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setTestError(result.error || 'Unknown error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Cog6ToothIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            {settText.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {settText.subtitle}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-pulse">
            <CheckCircleIcon className="w-4 h-4" />
            {settText.settingsSavedSuccess}
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Property Identity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BuildingOfficeIcon className="w-5 h-5 text-amber-600" />
            {settText.hotelProfile}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.hotelNameEn} *
              </label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.hotelNameKh} *
              </label>
              <input
                type="text"
                required
                value={formData.nameKm}
                onChange={e => setFormData({ ...formData, nameKm: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white font-khmer focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.hotelAddressEn}
              </label>
              <input
                type="text"
                value={formData.locationEn}
                onChange={e => setFormData({ ...formData, locationEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.hotelAddressKh}
              </label>
              <input
                type="text"
                value={formData.locationKm}
                onChange={e => setFormData({ ...formData, locationKm: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-khmer focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.hotelPhone}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.hotelEmail}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.taxVatNumber}
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={e => setFormData({ ...formData, vatNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'គេហទំព័រ' : 'Website'}
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Policies & Currency Engine */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CurrencyDollarIcon className="w-5 h-5 text-amber-600" />
            {isKhmer ? 'គោលការណ៍ចូល/ចេញ និងអត្រាប្តូរប្រាក់' : 'Check-in/Check-out Policies & Currency'} & Currency Engine
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'ម៉ោងចូលស្នាក់នៅ' : 'Standard Check-In Time'}
              </label>
              <input
                type="text"
                value={formData.checkInTime}
                onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'ម៉ោងចាកចេញ' : 'Standard Check-Out Time'}
              </label>
              <input
                type="text"
                value={formData.checkOutTime}
                onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.standardExchangeRate}
              </label>
              <input
                type="number"
                min="3800"
                max="4500"
                step="10"
                value={formData.exchangeRateUsdToKhr}
                onChange={e => setFormData({ ...formData, exchangeRateUsdToKhr: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Guest WiFi Access */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <WifiIcon className="w-5 h-5 text-amber-600" />
            {settText.wifiSsid} & Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.wifiSsid}
              </label>
              <input
                type="text"
                value={formData.wifiSsid}
                onChange={e => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.wifiPassword}
              </label>
              <input
                type="text"
                value={formData.wifiPass}
                onChange={e => setFormData({ ...formData, wifiPass: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Receipt Footer Notes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DocumentTextIcon className="w-5 h-5 text-amber-600" />
            Official Receipts & Folio Footer Messages
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.receiptBlessingEn}
              </label>
              <textarea
                rows={2}
                value={formData.receiptFooterNoteEn}
                onChange={e => setFormData({ ...formData, receiptFooterNoteEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {settText.receiptBlessingKh}
              </label>
              <textarea
                rows={2}
                value={formData.receiptFooterNoteKm}
                onChange={e => setFormData({ ...formData, receiptFooterNoteKm: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-khmer text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Telegram Integration */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PaperAirplaneIcon className="w-5 h-5 text-[#B08C4F]" />
              {isKhmer ? 'ភ្ជាប់ជាមួយ Telegram' : 'Connect with Telegram'}
            </h2>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, telegramEnabled: !formData.telegramEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.telegramEnabled ? 'bg-[#3A8059]' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.telegramEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isKhmer
              ? 'នៅពេលបើក ប្រព័ន្ធនឹងផ្ញើសារជូនដំណឹងទៅ Telegram ដោយស្វ័យប្រវត្តិរាល់ពេលមានការចុះឈ្មោះភ្ញៀវដើរចូល (walk-in check-in) រួមទាំងរូបថតអត្តសញ្ញាណប័ណ្ណ។'
              : 'When enabled, a message is automatically sent to your Telegram chat every time a walk-in guest checks in, including their ID photo if one was captured.'}
          </p>

          <div className={`space-y-3 transition-opacity ${formData.telegramEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bot Token
              </label>
              <input
                type="text"
                value={formData.telegramBotToken || ''}
                onChange={e => setFormData({ ...formData, telegramBotToken: e.target.value })}
                placeholder="123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isKhmer ? 'ទទួលបានពី @BotFather នៅលើ Telegram' : 'Get this from @BotFather on Telegram'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chat ID
              </label>
              <input
                type="text"
                value={formData.telegramChatId || ''}
                onChange={e => setFormData({ ...formData, telegramChatId: e.target.value })}
                placeholder="-1001234567890"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isKhmer ? 'ID របស់ក្រុម ឬការជជែកដែលចង់ទទួលការជូនដំណឹង' : 'The group or chat that should receive notifications'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testStatus === 'sending'}
                className="px-4 py-2 rounded-xl bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {testStatus === 'sending'
                  ? (isKhmer ? 'កំពុងផ្ញើ...' : 'Sending...')
                  : (isKhmer ? 'ផ្ញើសារសាកល្បង' : 'Send Test Message')}
              </button>

              {testStatus === 'success' && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#3A8059]">
                  <CheckCircleIcon className="w-4 h-4" />
                  {isKhmer ? 'ជោគជ័យ! ពិនិត្យមើល Telegram របស់អ្នក។' : 'Success! Check your Telegram.'}
                </span>
              )}
              {testStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#832F2C]">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {testError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            {settText.saveSettings}
          </button>
        </div>
      </form>
    </div>
  );
};
