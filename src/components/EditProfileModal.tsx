import React, { useState, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { supabase } from '../lib/supabase';
import { XMarkIcon, UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';

export const EditProfileModal: React.FC = () => {
  const { currentUser, updateOwnProfile, language, isEditProfileOpen, closeEditProfileModal } = useHotel();
  const isOpen = isEditProfileOpen;
  const onClose = closeEditProfileModal;
  const isKhmer = language === 'KM';

  const [name, setName] = useState(currentUser.name);
  const [nameKm, setNameKm] = useState(currentUser.nameKm || '');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentUser.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage(isKhmer ? 'សូមជ្រើសរើសឯកសាររូបភាព។' : 'Please select an image file.');
      return;
    }
    setErrorMessage('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);

    try {
      let avatarUrl: string | undefined = undefined;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'jpg';
        const path = `${currentUser.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true, cacheControl: '3600' });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`; // cache-bust so the new photo shows immediately
      }

      await updateOwnProfile({
        name: name.trim(),
        nameKm: nameKm.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || (isKhmer ? 'មិនអាចរក្សាទុកបានទេ។' : 'Failed to save changes.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-[#111B3A] flex items-center justify-between shrink-0">
          <h2 className="text-white font-bold flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-[#C9A96E]" />
            {isKhmer ? 'កែប្រែប្រវត្តិរូប' : 'Edit Profile'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-white/60 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {errorMessage && (
              <div className="px-4 py-3 rounded-lg text-sm bg-[#FBEEEE] text-[#832F2C] border border-[#EBB8B6]">
                {errorMessage}
              </div>
            )}

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={name} className="w-24 h-24 rounded-full object-cover ring-4 ring-[#EAD9AF]" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-[#EAD9AF]">
                    <UserCircleIcon className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#253B73] hover:bg-[#111B3A] text-white flex items-center justify-center shadow-md transition-colors"
                  title={isKhmer ? 'ប្តូររូបភាព' : 'Change photo'}
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                {isKhmer ? 'ចុចលើរូបតំណាងកាមេរ៉ាដើម្បីប្តូររូបភាព' : 'Click the camera icon to change your photo'}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isKhmer ? 'ឈ្មោះ (អង់គ្លេស)' : 'Name (English)'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isKhmer ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
              </label>
              <input
                type="text"
                value={nameKm}
                onChange={(e) => setNameKm(e.target.value)}
                placeholder="ឈ្មោះជាភាសាខ្មែរ"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#253B73] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 bg-[#FAF9F6] rounded-xl p-3">
              <div>
                <span className="block font-semibold text-gray-400 uppercase text-[10px]">Email</span>
                {currentUser.email}
              </div>
              <div>
                <span className="block font-semibold text-gray-400 uppercase text-[10px]">Role</span>
                {currentUser.role}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#D81B73] hover:bg-[#b0135c] text-white text-sm font-bold shadow-xs disabled:opacity-50"
            >
              {isSaving ? (isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKhmer ? 'រក្សាទុក' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
