import React from 'react';
import { useHotel } from '../context/HotelContext';
import { BrandLogo } from './BrandLogo';
import { 
  Squares2X2Icon, 
  UserPlusIcon, 
  ArrowRightOnRectangleIcon, 
  UsersIcon, 
  CalendarDaysIcon, 
  KeyIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  Cog6ToothIcon, 
  SparklesIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { language, t, rooms, payments, reservations, openWalkInModal } = useHotel();
  const isKhmer = language === 'KM';

  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;
  const pendingArrivals = reservations.filter(r => r.status === 'CONFIRMED').length;
  const inHouseCount = reservations.filter(r => r.status === 'CHECKED_IN').length;

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Squares2X2Icon, badge: null },
    { 
      id: 'checkin', 
      label: t.nav.checkIn, 
      icon: UserPlusIcon, 
      badge: pendingArrivals > 0 ? `${pendingArrivals} Due` : null, 
      badgeColor: 'bg-[#D81B73]' 
    },
    { 
      id: 'checkout', 
      label: t.nav.checkOut, 
      icon: ArrowRightOnRectangleIcon, 
      badge: inHouseCount > 0 ? `${inHouseCount}` : null,
      badgeColor: 'bg-[#253B73]' 
    },
    // { id: 'reservations', label: t.nav.reservations, icon: CalendarDaysIcon, badge: reservations.length },
    { id: 'rooms', label: t.nav.rooms, icon: KeyIcon, badge: `${occupiedCount}/${rooms.length}` },
    { id: 'guests', label: t.nav.guests, icon: IdentificationIcon, badge: null },
    { id: 'payments', label: t.nav.payments, icon: CreditCardIcon, badge: payments.length, badgeColor: 'bg-emerald-600' },
    { id: 'reports', label: t.nav.reports, icon: ChartBarIcon, badge: null },
    { id: 'staff', label: t.nav.staff, icon: UserGroupIcon, badge: null },
    { id: 'settings', label: t.nav.settings, icon: Cog6ToothIcon, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container: Deep Navy #111B3A */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#111B3A] text-white flex flex-col border-r border-[#253B73] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 border-b border-[#253B73]/60">
          <BrandLogo variant="full" size="md" isKhmer={isKhmer} />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-widest text-[#C9A96E]">
            {isKhmer ? 'ម៉ឺនុយមេ' : 'MAIN MENU'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#253B73] to-[#1A284F] text-[#C9A96E] border-l-4 border-[#D81B73] shadow-inner font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-[#253B73]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#C9A96E]' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${
                        item.badgeColor || 'bg-[#253B73]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRightIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Fast Action Banner */}
        {/* <div className="p-4 border-t border-[#253B73]/60 bg-[#0C1329]">
          <div className="p-3 bg-linear-to-br from-[#1E2E5C] to-[#111B3A] rounded-2xl border border-[#C9A96E]/20 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#C9A96E]">
              <SparklesIcon className="w-4 h-4 text-[#D81B73]" />
              <span>{isKhmer ? 'សេវាទទួលភ្ញៀវ ២៤/៧' : 'Front Desk 24/7'}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              {isKhmer ? 'ចុះឈ្មោះភ្ញៀវចូល ស្កេន ID និងកត់ត្រាប្រាក់ភ្លាមៗ' : 'Fast walk-in, ID capture & instant dual-currency billing'}
            </p>
            <button
              onClick={() => {
                openWalkInModal();
                onClose();
              }}
              className="w-full py-1.5 px-3 bg-[#D81B73] hover:bg-[#b0135c] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {isKhmer ? '+ ចុះឈ្មោះភ្ញៀវថ្មី' : '+ Walk-In Check In'}
            </button>
          </div>
        </div> */}

      </aside>
    </>
  );
};
