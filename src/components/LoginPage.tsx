import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const COPY = {
  EN: {
    welcome: 'Welcome back',
    subtitle: '',
    email: 'Email address',
    password: 'Password',
    emailPh: 'you@galaxystarangkor.com',
    passwordPh: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    heroTitle: 'Where Angkor heritage meets modern hospitality',
    heroSubtitle: 'Manage reservations, rooms, guests and payments — all in one place.',
  },
  KM: {
    welcome: 'សូមស្វាគមន៍ការត្រឡប់មកវិញ',
    subtitle: '`',
    email: 'អាសយដ្ឋានអ៊ីមែល',
    password: 'ពាក្យសម្ងាត់',
    emailPh: 'you@galaxystarangkor.com',
    passwordPh: 'បញ្ចូលពាក្យសម្ងាត់របស់អ្នក',
    signIn: 'ចូលប្រើប្រាស់',
    signingIn: 'កំពុងចូល...',
    heroTitle: 'កន្លែងដែលបេតិកភណ្ឌអង្គរជួបនឹងភ្ញៀវសម័យទំនើប',
    heroSubtitle: 'គ្រប់គ្រងការកក់បន្ទប់ បន្ទប់ ភ្ញៀវ និងការទូទាត់ នៅកន្លែងតែមួយ។',
  },
};

export const LoginPage: React.FC = () => {
  const { signIn, error: authError } = useAuth();
  const [lang, setLang] = useState<'EN' | 'KM'>('EN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const t = COPY[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setLocalError(err.message ?? 'Sign in failed. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6]">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#111B3A] to-[#1A2647]">
        <div className="relative z-10">
          <BrandLogo variant="full" size="md" showSubtitle isKhmer={lang === 'KM'} />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">{t.heroTitle}</h1>
          <p className="text-base text-white/65">{t.heroSubtitle}</p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/40">
          <div className="w-8 h-px bg-[#C9A96E]" />
          <span>© 2026 Galaxy Star Angkor Hotel</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-6">
          <div className="inline-flex items-center rounded-full p-1 bg-white border border-gray-200">
            {(['EN', 'KM'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors cursor-pointer ${
                  lang === code ? 'bg-[#D81B73] text-white' : 'text-gray-500'
                }`}
              >
                {code === 'EN' ? 'EN' : 'ខ្មែរ'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="lg:hidden flex justify-center mb-8">
              <BrandLogo variant="monochrome-dark" size="md" isKhmer={lang === 'KM'} />
            </div>

            <h2 className="text-2xl font-bold mb-1 text-[#111B3A]">{t.welcome}</h2>
            <p className="text-sm mb-8 text-gray-500">{t.subtitle}</p>

            {(localError || authError) && (
              <div className="mb-5 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                {localError || authError}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                {t.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none border border-gray-200 focus:border-[#D81B73] focus:ring-2 focus:ring-[#D81B73]/15 transition-all text-[#111B3A]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPh}
                  className="w-full px-4 py-3 pr-11 rounded-lg text-sm outline-none border border-gray-200 focus:border-[#D81B73] focus:ring-2 focus:ring-[#D81B73]/15 transition-all text-[#111B3A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showPw ? <EyeSlashIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 bg-[#253B73] hover:bg-[#111B3A] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? t.signingIn : t.signIn}
              {!submitting && <ArrowRightIcon className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
