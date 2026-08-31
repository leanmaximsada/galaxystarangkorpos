import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CheckInView } from './components/CheckInView';
import { CheckOutView } from './components/CheckOutView';
import { GuestsView } from './components/GuestsView';
import { RoomsView } from './components/RoomsView';
import { ReservationsView } from './components/ReservationsView';
import { ReportsView } from './components/ReportsView';
import { StaffView } from './components/StaffView';
import { SettingsView } from './components/SettingsView';
import { CheckInModal } from './components/CheckInModal';
import { WalkInCheckInModal } from './components/WalkInCheckInModal';
import { CheckOutModal } from './components/CheckOutModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { IdDocumentViewerModal } from './components/IdDocumentViewerModal';
import { AdvanceReservationModal } from './components/AdvanceReservationModal';
import { BookingVoucherModal } from './components/BookingVoucherModal';
import { ShiftCloseoutModal } from './components/ShiftCloseoutModal';
import { AddRoomModal } from './components/AddRoomModal';
import { EditProfileModal } from './components/EditProfileModal';
import { TelegramEditModal } from './components/TelegramEditModal';
import { 
  CreditCardIcon, 
  CalendarDaysIcon, 
  KeyIcon, 
  UsersIcon, 
  ChartBarIcon, 
  Cog6ToothIcon, 
  PlusIcon, 
  PrinterIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  UserPlusIcon,
  CheckCircleIcon,
  IdentificationIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { 
    language, 
    t, 
    payments, 
    rooms, 
    reservations, 
    guests, 
    openRecordPaymentModal, 
    openReceiptModal,
    openWalkInModal,
    openCheckInModal,
    selectedIdGuest,
    closeIdViewerModal,
    openIdViewerModal,
    selectedVoucherReservation,
    closeVoucherModal
  } = useHotel();
  const isKhmer = language === 'KM';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111B3A] flex flex-col antialiased">
      
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'checkin' && <CheckInView />}
          {activeTab === 'checkout' && <CheckOutView />}
          {activeTab === 'guests' && <GuestsView />}
          {activeTab === 'rooms' && <RoomsView />}
          {activeTab === 'reservations' && <ReservationsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'staff' && <StaffView />}
          {activeTab === 'settings' && <SettingsView />}

          {/* Payments dedicated tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#111B3A]">{t.payment.title}</h2>
                  <p className="text-xs text-gray-500">{t.payment.permissionNotice}</p>
                </div>
                <button
                  onClick={openRecordPaymentModal}
                  className="px-4 py-2.5 bg-[#253B73] hover:bg-[#111B3A] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4 text-[#D81B73]" />
                  <span>{t.dashboard.recordPayment}</span>
                </button>
              </div>

              {/* Transactions List */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
                <h3 className="font-bold text-base text-[#111B3A] mb-4">{t.dashboard.recentPayments}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-[#FAF9F6] text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">{t.receipt.receiptNo}</th>
                        <th className="py-3 px-4">{t.receipt.guest}</th>
                        <th className="py-3 px-4">{t.payment.amount}</th>
                        <th className="py-3 px-4">{t.payment.paymentMethod}</th>
                        <th className="py-3 px-4">{t.payment.receivedBy}</th>
                        <th className="py-3 px-4">{t.receipt.dateTime}</th>
                        <th className="py-3 px-4 text-right">{t.common.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map((p) => {
                        const isKhr = p.currency === 'KHR';
                        const formattedAmt = isKhr
                          ? `${p.amount.toLocaleString()} KHR`
                          : `$${p.amount.toFixed(2)} USD`;
                        const dateStr = new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                          <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#111B3A]">{p.id}</td>
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              <div>{p.guest_name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{p.reservation_id}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#111B3A]">
                              <span className={`px-2 py-1 rounded-md ${isKhr ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-[#253B73]'}`}>
                                {formattedAmt}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.payment_method === 'CASH' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {p.payment_method === 'CASH' ? t.payment.cash : t.payment.bank}
                              </span>
                              {p.bank_name && (
                                <span className="block text-[10px] text-gray-500 mt-0.5">{p.bank_name}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-gray-700 font-medium">{p.received_by}</td>
                            <td className="py-3.5 px-4 text-gray-500">{dateStr}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => openReceiptModal(p)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#253B73] text-[#253B73] hover:text-white border border-gray-300 hover:border-transparent rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
                              >
                                <PrinterIcon className="w-3.5 h-3.5" />
                                <span>{t.payment.printReceipt}</span>
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
          )}
        </main>
      </div>

      {/* Receptionist & Management Modals */}
      <CheckInModal />
      <WalkInCheckInModal />
      <CheckOutModal />
      <RecordPaymentModal />
      <PaymentReceiptModal />
      <AdvanceReservationModal />
      <BookingVoucherModal 
        reservation={selectedVoucherReservation}
        onClose={closeVoucherModal}
      />
      <ShiftCloseoutModal />
            <EditProfileModal />
            <TelegramEditModal />
            <AddRoomModal />
      <IdDocumentViewerModal
        isOpen={!!selectedIdGuest}
        onClose={closeIdViewerModal}
        guest={selectedIdGuest}
      />
    </div>
  );
};

export default function App() {
  const { session, staffProfile, loading, error, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D81B73] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!staffProfile) {
    // Authenticated with Supabase, but no row in the `staff` table yet.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm text-gray-600 mb-4">
            {error || 'Your account is not linked to a staff profile yet. Ask an Admin to add you.'}
          </p>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-[#253B73] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <HotelProvider authStaff={staffProfile}>
      <MainLayout />
    </HotelProvider>
  );
}
