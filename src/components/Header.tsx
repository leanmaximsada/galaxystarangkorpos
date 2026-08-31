import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';

import { Language, UserRole } from '../types';
import { 
  BellIcon, 
  PencilSquareIcon,
  CreditCardIcon, 
  GlobeAltIcon, 
  Bars3Icon, 
  UserPlusIcon, 
  ChevronDownIcon, 
  CheckIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { 
    currentUser, 
    language, 
    setLanguage, 
    staffList, 
    switchUser, 
        openEditProfileModal,
    openRecordPaymentModal, 
    openWalkInModal, 
    t 
  } = useHotel();
  const { signOut } = useAuth();

  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isKhmer = language === 'KM';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Context Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#111B3A] hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-[#111B3A] leading-tight">
                {t.hotelName}
              </h1>
              {/* <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#D81B73]/10 text-[#D81B73] font-bold tracking-wide border border-[#D81B73]/20">
                ★ 4-STAR LUXURY
              </span> */}
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              {t.hotelSubtitle} • {t.hotelLocation}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action, Language Toggle, Notifications, Staff Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Walk-In Check In Button */}
          <button
            onClick={openWalkInModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-linear-to-r from-[#D81B73] to-[#b0135c] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow-md active:scale-95 group cursor-pointer"
            title={t.checkInOut.walkInCheckIn}
          >
            <UserPlusIcon className="w-4 h-4 text-white" />
            <span className="hidden lg:inline">{t.checkInOut.walkInCheckIn}</span>
            <span className="lg:hidden">Check-In</span>
          </button>

          {/* Quick Record Payment Action Button (Royal Navy) */}
          <button
            onClick={openRecordPaymentModal}
            className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow-md active:scale-95 group cursor-pointer"
          >
            <CreditCardIcon className="w-4 h-4 text-[#C9A96E] group-hover:rotate-6 transition-transform" />
            <span className="hidden md:inline">{t.dashboard.recordPayment}</span>
            <span className="md:hidden">Payment</span>
          </button>

          {/* Bilingual Language Switcher [ EN | ខ្មែរ ] with Angkor Pink active state */}
          <div className="flex items-center bg-[#FAF9F6] border border-gray-300/80 p-0.5 rounded-xl shadow-inner">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === 'EN'
                  ? 'bg-[#D81B73] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#111B3A]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('KM')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === 'KM'
                  ? 'bg-[#D81B73] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#111B3A]'
              }`}
            >
              ខ្មែរ
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-gray-600 hover:text-[#111B3A] hover:bg-gray-100 transition-colors cursor-pointer"
              title={t.common.notifications}
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D81B73] ring-2 ring-white"></span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50 animate-fadeIn">
                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111B3A]">{t.common.notifications}</span>
                  <span className="text-[10px] text-[#D81B73] font-bold">2 Live</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  <div className="p-3 text-xs hover:bg-[#FAF9F6] transition-colors">
                    <p className="font-semibold text-gray-800">VIP Guest In-House</p>
                    <p className="text-[11px] text-gray-500">Chan Thida in Room 103 (Executive Pool Access)</p>
                  </div>
                  <div className="p-3 text-xs hover:bg-[#FAF9F6] transition-colors">
                    <p className="font-semibold text-gray-800">Housekeeping Update</p>
                    <p className="text-[11px] text-gray-500">Room 104 is currently in Cleaning status.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Staff Profile Switcher (Demonstrating Role Permissions & User Profile Language Persistence) */}
          <div className="relative">
            <button
              onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-[#FAF9F6] hover:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#C9A96E]"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-[#111B3A] leading-tight">
                  {isKhmer ? currentUser.nameKm : currentUser.name}
                </div>
                <div className="text-[10px] font-semibold text-[#253B73] leading-none">
                  {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.role === 'MANAGER' ? 'Manager' : 'Receptionist'}
                </div>
              </div>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isStaffMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {t.common.switchRole}
                  </span>
                </div>
                <div className="py-1">
                  {staffList.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => {
                        switchUser(staff.id);
                        setIsStaffMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                        staff.id === currentUser.id ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#111B3A]">
                            {isKhmer ? staff.nameKm : staff.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {t.roles[staff.role]} • Lang: {staff.preferred_language}
                          </p>
                        </div>
                      </div>
                      {staff.id === currentUser.id && (
                        <CheckIcon className="w-4 h-4 text-[#D81B73]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsStaffMenuOpen(false);
                      openEditProfileModal();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-[#253B73] hover:bg-[#EEF1F8] transition-colors cursor-pointer"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">{isKhmer ? 'កែប្រែប្រវត្តិរូប' : 'Edit Profile'}</span>
                  </button>
                </div>
                <div className="px-4 pt-2 pb-1 border-t border-gray-100 text-[10px] text-gray-400">
                  Language preference is remembered per staff member.
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsStaffMenuOpen(false);
                      signOut();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          

        </div>

      </div>
    </header>
  );
};
