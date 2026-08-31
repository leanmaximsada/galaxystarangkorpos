import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { ShiftHandoverNote, User, UserRole } from '../types';
import { 
  UserGroupIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  SparklesIcon,
  IdentificationIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

export const StaffView: React.FC = () => {
  const { 
    staffList, 
    currentUser, 
    switchUser, 
    handoverNotes, 
    addHandoverNote, 
    toggleHandoverNoteResolved,
    language, 
    t 
  } = useHotel();

  const isKhmer = language === 'KM';
  const staffText = t.staffMgmt;

  // New Note Modal / Form State
  const [isAddNoteOpen, setIsAddNoteOpen] = useState<boolean>(false);
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'handover' | 'staff'>('handover');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addHandoverNote({
      shift,
      priority,
      roomNumber: roomNumber.trim() || undefined,
      guestName: guestName.trim() || undefined,
      content: content.trim(),
    });

    setContent('');
    setRoomNumber('');
    setGuestName('');
    setIsAddNoteOpen(false);
  };

  const getPriorityBadge = (priority: 'NORMAL' | 'IMPORTANT' | 'URGENT') => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
            <ExclamationCircleIcon className="w-3.5 h-3.5" />
            {staffText.priorityUrgent}
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
            {staffText.priorityImportant}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {staffText.priorityNormal}
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">{staffText.adminRole}</span>;
      case 'MANAGER':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">{staffText.managerRole}</span>;
      case 'RECEPTIONIST':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">{staffText.receptionistRole}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserGroupIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            {staffText.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {staffText.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddNoteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            {staffText.addNote}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('handover')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'handover'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          {staffText.handoverNotes} ({handoverNotes.filter(n => !n.isResolved).length} pending)
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <IdentificationIcon className="w-4 h-4" />
          {staffText.staffAccounts} ({staffList.length})
        </button>
      </div>

      {/* Tab 1: Handover Notes */}
      {activeTab === 'handover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {handoverNotes.map(note => (
            <div
              key={note.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                note.isResolved 
                  ? 'border-slate-200 dark:border-slate-800 opacity-60' 
                  : note.priority === 'URGENT'
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {note.shift === 'MORNING' ? staffText.shiftMorning : note.shift === 'EVENING' ? staffText.shiftEvening : staffText.shiftNight}
                    </span>
                    {getPriorityBadge(note.priority)}
                  </div>
                  <button
                    onClick={() => toggleHandoverNoteResolved(note.id)}
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    title={note.isResolved ? staffText.markUnresolved : staffText.markResolved}
                  >
                    {note.isResolved ? (
                      <SolidCheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <CheckCircleIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <p className={`text-sm text-slate-800 dark:text-slate-200 leading-relaxed ${note.isResolved ? 'line-through' : ''}`}>
                  {note.content}
                </p>

                {(note.roomNumber || note.guestName) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap gap-3">
                    {note.roomNumber && (
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        Room {note.roomNumber}
                      </span>
                    )}
                    {note.guestName && (
                      <span className="text-slate-600 dark:text-slate-300">
                        Guest: {note.guestName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>By: {note.author}</span>
                <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Staff Accounts & Operator Switching */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map(staff => {
            const isCurrent = staff.id === currentUser.id;
            return (
              <div
                key={staff.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isCurrent 
                    ? 'border-amber-500 ring-2 ring-amber-500/20' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {staff.name}
                        </h3>
                        {staff.nameKm && (
                          <p className="text-xs text-slate-500 font-khmer">{staff.nameKm}</p>
                        )}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                        {staffText.currentActive}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      {getRoleBadge(staff.role)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono">{staff.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Language:</span>
                      <span className="font-semibold">{staff.preferred_language === 'KM' ? 'ភាសាខ្មែរ (Khmer)' : 'English (US)'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {!isCurrent ? (
                    <button
                      onClick={() => switchUser(staff.id)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                    >
                      {staffText.switchOperator}
                    </button>
                  ) : (
                    <div className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-1">
                      Logged in to current terminal session
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Handover Note Modal */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-600" />
                {staffText.addNote}
              </h2>
              <button
                onClick={() => setIsAddNoteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Period
                  </label>
                  <select
                    value={shift}
                    onChange={e => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="MORNING">{staffText.shiftMorning}</option>
                    <option value="EVENING">{staffText.shiftEvening}</option>
                    <option value="NIGHT">{staffText.shiftNight}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="NORMAL">{staffText.priorityNormal}</option>
                    <option value="IMPORTANT">{staffText.priorityImportant}</option>
                    <option value="URGENT">{staffText.priorityUrgent}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    placeholder="e.g. 201"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guest Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Kenji Sato"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Handover Instructions / Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="e.g. Airport shuttle pickup at 11:30 AM, wake-up call at 05:00 AM..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                >
                  {staffText.saveNote}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
