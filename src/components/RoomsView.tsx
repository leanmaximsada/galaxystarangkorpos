import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { formatDate } from '../utils/dateFormatter';
import { FormattedDateInput } from './FormattedDateInput';
import { Room, RoomStatus, RoomType, RoomCategory, RoomPlaceCategory, RoomFloor } from '../types';
import { 
  CalendarDaysIcon,
  BuildingOfficeIcon, 
  ArrowRightIcon,
  SparklesIcon, 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  PlusIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  TvIcon,
  WifiIcon,
  ShieldCheckIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';

// Fixed set of physical room placements within the hotel building.
const PLACE_CATEGORIES: { code: RoomPlaceCategory; labelKey: 'placeBack' | 'placeOuterStairs' | 'placeInnerStairs' }[] = [
  { code: 'BACK', labelKey: 'placeBack' },
  { code: 'OUTER_STAIRS', labelKey: 'placeOuterStairs' },
  { code: 'INNER_STAIRS', labelKey: 'placeInnerStairs' },
];

export const RoomsView: React.FC = () => {
  const { 
    rooms, 
    roomsLoading,
    roomCategories,
    updateRoomStatus, 
    saveRoomDetails, 
    addNewRoom,
    deleteRoom,
    addRoomCategory,
    updateRoomCategory,
    deleteRoomCategory,
    openWalkInModalWithRoom, 
    openCheckOutModal, 
    reservations,
    language, 
    t 
  } = useHotel();

  const isKhmer = language === 'KM';
  const rmText = t.roomsMgmt;

  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [placeFilter, setPlaceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
    const [showHistory, setShowHistory] = useState<boolean>(false);
      const [occupancyLookupDate, setOccupancyLookupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showOccupancyLookup, setShowOccupancyLookup] = useState<boolean>(false);

  // Reservations that cover the selected date (guest is staying that night),
  // regardless of the reservation's current status — this lets staff look
  // both backward (who stayed on a past date) and forward (who's booked for
  // a future date), not just today's live room status.
  const occupancyOnDate = reservations.filter(r => {
    if (r.status === 'CANCELLED') return false;
    return r.check_in_date <= occupancyLookupDate && occupancyLookupDate < r.check_out_date;
  });

  // Edit / Add Room modal state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    number: string;
    floor: RoomFloor;
    type: RoomType;
    placeCategory: RoomPlaceCategory | '';
    status: RoomStatus;
    priceUsd: number;
    priceKhr: number;
    amenities: string;
    maxOccupancy: number;
  }>({
    number: '',
    floor: 1,
    type: roomCategories[0]?.code || 'DELUXE_ANGKOR',
    placeCategory: '',
    status: 'AVAILABLE',
    priceUsd: roomCategories[0]?.defaultPriceUsd || 55,
    priceKhr: roomCategories[0]?.defaultPriceKhr || 225500,
    amenities: 'Air Conditioning, Free High-Speed WiFi, Mini Bar, Balcony',
    maxOccupancy: roomCategories[0]?.maxOccupancy || 2,
  });

  // Category management modal state
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState<{
    code: string;
    name: string;
    nameKm: string;
    bedType: string;
    bedTypeKm: string;
    defaultPriceUsd: number;
    defaultPriceKhr: number;
    maxOccupancy: number;
  }>({
    code: '',
    name: '',
    nameKm: '',
    bedType: '',
    bedTypeKm: '',
    defaultPriceUsd: 50,
    defaultPriceKhr: 205000,
    maxOccupancy: 2,
  });

  // Calculate statistics
  const totalRooms = rooms.length;
  const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;
  const cleaningCount = rooms.filter(r => r.status === 'CLEANING').length;

  // Category breakdown per status, e.g. "Twin Bed Room: 2" — reused across all 6 stat cards
  const getBreakdownByCategory = (status: RoomStatus | 'ALL') => {
    return roomCategories
      .map(cat => ({
        label: isKhmer ? (cat.nameKm || cat.name) : cat.name,
        count: rooms.filter(r => (status === 'ALL' || r.status === status) && r.type === cat.code).length,
      }))
      .filter(entry => entry.count > 0);
  };

  const totalByCategory = getBreakdownByCategory('ALL');
  const availableByCategory = getBreakdownByCategory('AVAILABLE');
  const occupiedByCategory = getBreakdownByCategory('OCCUPIED');
  const cleaningByCategory = getBreakdownByCategory('CLEANING');
  const maintenanceByCategory = getBreakdownByCategory('MAINTENANCE');
  const reservedByCategory = getBreakdownByCategory('RESERVED');
  const maintenanceCount = rooms.filter(r => r.status === 'MAINTENANCE').length;
  const reservedCount = rooms.filter(r => r.status === 'RESERVED').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    if (statusFilter !== 'ALL' && room.status !== statusFilter) return false;
    if (floorFilter !== 'ALL' && room.floor.toString() !== floorFilter) return false;
    if (typeFilter !== 'ALL' && room.type !== typeFilter) return false;
    if (placeFilter !== 'ALL' && room.placeCategory !== placeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = room.number.toLowerCase().includes(q);
      const matchType = room.type.toLowerCase().includes(q);
      const matchGuest = room.currentGuestName?.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchGuest) return false;
    }
    return true;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF6F1] text-[#2F6748] border border-[#BFE0CC] dark:bg-[#10261C]/40 dark:text-[#98CDAE] dark:border-[#29523B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4C9C70] animate-pulse"></span>
            {rmText.statusAvailable}
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FBEEEE] text-[#832F2C] border border-[#EBB8B6] dark:bg-[#2F1110]/40 dark:text-[#DE8F8C] dark:border-[#6B2825]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC4E49]"></span>
            {rmText.statusOccupied}
          </span>
        );
      case 'CLEANING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FBF7EF] text-[#8C6E3D] border border-[#EAD9AF] dark:bg-[#332812]/40 dark:text-[#DFC489] dark:border-[#6E5630]">
            <SparklesIcon className="w-3.5 h-3.5 text-[#C9A96E] animate-spin" />
            {rmText.statusCleaning}
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-slate-500" />
            {rmText.statusMaintenance}
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF1F8] text-[#304874] border border-[#B9C7E3] dark:bg-[#111B3A]/40 dark:text-[#93A9D4] dark:border-[#253B73]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F71AC]"></span>
            {rmText.statusReserved}
          </span>
        );
      default:
        return null;
    }
  };

  const getRoomTypeLabel = (type: RoomType) => {
    const category = roomCategories.find(c => c.code === type);
    if (category) return isKhmer ? category.nameKm || category.name : category.name;
    return type;
  };

  const getPlaceCategoryLabel = (place?: RoomPlaceCategory) => {
    const found = PLACE_CATEGORIES.find(p => p.code === place);
    return found ? rmText[found.labelKey] : '';
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      floor: room.floor,
      type: room.type,
      placeCategory: room.placeCategory || '',
      status: room.status,
      priceUsd: room.priceUsd,
      priceKhr: room.priceKhr,
      amenities: room.amenities?.join(', ') || '',
      maxOccupancy: room.maxOccupancy || 2,
    });
  };

  const openAddModal = () => {
    setIsAddRoomOpen(true);
    const defaultCategory = roomCategories[0];
    setFormData({
      number: `${(rooms.length % 5) + 1}0${Math.floor(rooms.length / 5) + 1}`,
      floor: Math.floor(rooms.length / 5) + 1,
      type: defaultCategory?.code || 'DELUXE_ANGKOR',
      placeCategory: '',
      status: 'AVAILABLE',
      priceUsd: defaultCategory?.defaultPriceUsd || 55,
      priceKhr: defaultCategory?.defaultPriceKhr || 225500,
      amenities: 'Air Conditioning, Free WiFi, Flat TV, Modern Bathroom',
      maxOccupancy: defaultCategory?.maxOccupancy || 2,
    });
  };

  // When the category dropdown changes, pre-fill price & max occupancy from
  // that category's defaults (still editable per-room afterward).
  const handleCategoryChange = (code: string) => {
    const category = roomCategories.find(c => c.code === code);
    setFormData(prev => ({
      ...prev,
      type: code,
      priceUsd: category?.defaultPriceUsd ?? prev.priceUsd,
      priceKhr: category?.defaultPriceKhr ?? prev.priceKhr,
      maxOccupancy: category?.maxOccupancy ?? prev.maxOccupancy,
    }));
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      saveRoomDetails({
        id: editingRoom.id,
        number: formData.number,
        floor: formData.floor === 'G' ? 'G' : Number(formData.floor),
        type: formData.type,
        placeCategory: formData.placeCategory || undefined,
        status: formData.status,
        priceUsd: Number(formData.priceUsd),
        priceKhr: Number(formData.priceKhr),
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
        maxOccupancy: Number(formData.maxOccupancy) || 2,
      });
      setEditingRoom(null);
    } else if (isAddRoomOpen) {
      addNewRoom({
        number: formData.number,
        floor: formData.floor === 'G' ? 'G' : Number(formData.floor),
        type: formData.type,
        placeCategory: formData.placeCategory || undefined,
        status: formData.status,
        priceUsd: Number(formData.priceUsd),
        priceKhr: Number(formData.priceKhr),
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
        maxOccupancy: Number(formData.maxOccupancy) || 2,
      });
      setIsAddRoomOpen(false);
    }
  };

  // --- Room Category management ---
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ code: '', name: '', nameKm: '', bedType: '', bedTypeKm: '', defaultPriceUsd: 50, defaultPriceKhr: 205000, maxOccupancy: 2 });
    setIsAddCategoryOpen(true);
  };

  const openEditCategoryModal = (category: RoomCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      code: category.code,
      name: category.name,
      nameKm: category.nameKm || '',
      bedType: category.bedType,
      bedTypeKm: category.bedTypeKm || '',
      defaultPriceUsd: category.defaultPriceUsd,
      defaultPriceKhr: category.defaultPriceKhr,
      maxOccupancy: category.maxOccupancy,
    });
    setIsAddCategoryOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const code = (editingCategory?.code || categoryForm.name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_')).replace(/^_+|_+$/g, '');
    if (editingCategory) {
      updateRoomCategory(editingCategory.id, {
        name: categoryForm.name,
        nameKm: categoryForm.nameKm,
        bedType: categoryForm.bedType,
        bedTypeKm: categoryForm.bedTypeKm,
        defaultPriceUsd: Number(categoryForm.defaultPriceUsd),
        defaultPriceKhr: Number(categoryForm.defaultPriceKhr),
        maxOccupancy: Number(categoryForm.maxOccupancy) || 2,
      });
    } else {
      addRoomCategory({
        code: code || `CAT_${Date.now()}`,
        name: categoryForm.name,
        nameKm: categoryForm.nameKm,
        bedType: categoryForm.bedType,
        bedTypeKm: categoryForm.bedTypeKm,
        defaultPriceUsd: Number(categoryForm.defaultPriceUsd),
        defaultPriceKhr: Number(categoryForm.defaultPriceKhr),
        maxOccupancy: Number(categoryForm.maxOccupancy) || 2,
      });
    }
    setIsAddCategoryOpen(false);
    setEditingCategory(null);
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D81B73] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">{isKhmer ? 'កំពុងផ្ទុកទិន្នន័យបន្ទប់...' : 'Loading rooms...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BuildingOfficeIcon className="w-7 h-7 text-[#B08C4F] dark:text-[#D3AF6E]" />
            {rmText.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {rmText.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 dark:border-slate-700 hover:border-[#C9A96E] text-[#253B73] dark:text-[#93A9D4] text-sm font-semibold shadow-sm transition-all"
          >
            <TagIcon className="w-5 h-5" />
            {rmText.manageCategories}
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B08C4F] hover:bg-[#8C6E3D] text-white text-sm font-semibold shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            {rmText.addRoom}
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{rmText.totalRooms}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{totalRooms}</p>
          {totalByCategory.length > 0 ? (
            <div className="mt-2 space-y-0.5">
              {totalByCategory.map(entry => (
                <div key={entry.label} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="truncate pr-2">{entry.label}</span>
                  <span className="font-mono font-bold shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">100% capacity</div>
          )}
        </div>

        <div className="bg-[#EEF6F1]/70 dark:bg-[#10261C]/30 p-4 rounded-2xl border border-[#BFE0CC]/80 dark:border-[#234432]/60 shadow-sm">
          <p className="text-xs font-semibold text-[#2F6748] dark:text-[#6FB68D] uppercase tracking-wider">{rmText.availableRooms}</p>
          <p className="text-2xl font-bold text-[#29523B] dark:text-[#BFE0CC] mt-1.5">{availableCount}</p>
          {availableByCategory.length > 0 ? (
            <div className="mt-2 space-y-0.5">
              {availableByCategory.map(entry => (
                <div key={entry.label} className="flex items-center justify-between text-[11px] text-[#3A8059] dark:text-[#6FB68D] font-medium">
                  <span className="truncate pr-2">{entry.label}</span>
                  <span className="font-mono font-bold shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#3A8059] dark:text-[#6FB68D] font-medium">Ready for check-in</div>
          )}
        </div>

        <div className="bg-[#FBEEEE]/70 dark:bg-[#2F1110]/30 p-4 rounded-2xl border border-[#EBB8B6]/80 dark:border-[#572220]/60 shadow-sm">
          <p className="text-xs font-semibold text-[#832F2C] dark:text-[#CE6B67] uppercase tracking-wider">{rmText.occupiedRooms}</p>
          <p className="text-2xl font-bold text-[#6B2825] dark:text-[#EBB8B6] mt-1.5">{occupiedCount}</p>
          {occupiedByCategory.length > 0 ? (
            <div className="mt-2 space-y-0.5">
              {occupiedByCategory.map(entry => (
                <div key={entry.label} className="flex items-center justify-between text-[11px] text-[#A13B37] dark:text-[#CE6B67] font-medium">
                  <span className="truncate pr-2">{entry.label}</span>
                  <span className="font-mono font-bold shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#A13B37] dark:text-[#CE6B67] font-medium">{occupancyRate}% occupancy</div>
          )}
        </div>

        <div className="bg-[#FBF7EF]/70 dark:bg-[#332812]/30 p-4 rounded-2xl border border-[#EAD9AF]/80 dark:border-[#59452A]/60 shadow-sm">
          <p className="text-xs font-semibold text-[#8C6E3D] dark:text-[#D3AF6E] uppercase tracking-wider">{rmText.cleaningRooms}</p>
          <p className="text-2xl font-bold text-[#6E5630] dark:text-[#EAD9AF] mt-1.5">{cleaningCount}</p>
          {cleaningByCategory.length > 0 ? (
            <div className="mt-2 space-y-0.5">
              {cleaningByCategory.map(entry => (
                <div key={entry.label} className="flex items-center justify-between text-[11px] text-[#B08C4F] dark:text-[#D3AF6E] font-medium">
                  <span className="truncate pr-2">{entry.label}</span>
                  <span className="font-mono font-bold shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#B08C4F] dark:text-[#D3AF6E] font-medium">In housekeeping</div>
          )}
        </div>

        <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">{rmText.maintenanceRooms}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1.5">{maintenanceCount}</p>
          {maintenanceByCategory.length > 0 ? (
            <div className="mt-2 space-y-0.5">
              {maintenanceByCategory.map(entry => (
                <div key={entry.label} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="truncate pr-2">{entry.label}</span>
                  <span className="font-mono font-bold shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Out of service</div>
          )}
        </div>

        <div className="bg-[#EEF1F8]/70 dark:bg-[#111B3A]/30 p-4 rounded-2xl border border-[#B9C7E3]/80 dark:border-[#1B2C57]/60 shadow-sm">
          <p className="text-xs font-semibold text-[#304874] dark:text-[#6D8BC3] uppercase tracking-wider">{rmText.reservedRooms}</p>
          <p className="text-2xl font-bold text-[#253B73] dark:text-[#B9C7E3] mt-1.5">{reservedCount}</p>
          {reservedByCategory.length > 0 ? (
            <div className="mt-2 space-y-0.5">
              {reservedByCategory.map(entry => (
                <div key={entry.label} className="flex items-center justify-between text-[11px] text-[#3C5A91] dark:text-[#6D8BC3] font-medium">
                  <span className="truncate pr-2">{entry.label}</span>
                  <span className="font-mono font-bold shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#3C5A91] dark:text-[#6D8BC3] font-medium">Advance bookings</div>
          )}
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKhmer ? 'ស្វែងរកបន្ទប់ ឬភ្ញៀវ...' : 'Search room # or guest...'}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A96E] text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] font-medium"
          >
            <option value="ALL">{rmText.filterAll}</option>
            <option value="AVAILABLE">{rmText.statusAvailable} ({availableCount})</option>
            <option value="OCCUPIED">{rmText.statusOccupied} ({occupiedCount})</option>
            <option value="CLEANING">{rmText.statusCleaning} ({cleaningCount})</option>
            <option value="MAINTENANCE">{rmText.statusMaintenance} ({maintenanceCount})</option>
            <option value="RESERVED">{rmText.statusReserved} ({reservedCount})</option>
          </select>

          <select
            value={floorFilter}
            onChange={e => setFloorFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] font-medium"
          >
            <option value="ALL">{rmText.allFloors}</option>
            <option value="G">{rmText.groundFloor}</option>
            <option value="1">{rmText.floor} 1</option>
            <option value="2">{rmText.floor} 2</option>
            <option value="3">{rmText.floor} 3</option>
            <option value="4">{rmText.floor} 4</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] font-medium"
          >
            <option value="ALL">{rmText.roomCategories}: {rmText.filterAll}</option>
            {roomCategories.map(cat => (
              <option key={cat.id} value={cat.code}>{isKhmer ? cat.nameKm || cat.name : cat.name}</option>
            ))}
          </select>

          <select
            value={placeFilter}
            onChange={e => setPlaceFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] font-medium"
          >
            <option value="ALL">{rmText.placeCategory}: {rmText.allPlaces}</option>
            {PLACE_CATEGORIES.map(p => (
              <option key={p.code} value={p.code}>{rmText[p.labelKey]}</option>
            ))}
          </select>
        </div>

        {/* View mode toggle & clear filters */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {(statusFilter !== 'ALL' || floorFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setFloorFilter('ALL');
                setTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-[#B08C4F] hover:text-[#8C6E3D] dark:text-[#D3AF6E] font-medium px-2.5 py-1.5"
            >
              {isKhmer ? 'កំណត់ឡើងវិញ' : 'Reset Filters'}
            </button>
          )}

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 text-[#B08C4F] dark:text-[#D3AF6E] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Grid Matrix View"
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{rmText.matrixView}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-[#B08C4F] dark:text-[#D3AF6E] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <ListBulletIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{rmText.tableView}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map(room => {
            const activeRes = room.currentReservationId 
              ? reservations.find(r => r.id === room.currentReservationId)
              : reservations.find(r => (r.room_id === room.id || r.room_number === room.number) && r.status === 'CHECKED_IN');

            return (
              <div
                key={room.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  room.status === 'AVAILABLE' 
                    ? 'border-[#BFE0CC] dark:border-[#234432]/60 hover:shadow-[#DCEEE3]/50 dark:hover:shadow-none'
                    : room.status === 'OCCUPIED'
                    ? 'border-[#EBB8B6] dark:border-[#572220]/60'
                    : room.status === 'CLEANING'
                    ? 'border-[#EAD9AF] dark:border-[#59452A]/60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar: Room # & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {room.number}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {rmText.floor} {room.floor}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#8C6E3D] dark:text-[#D3AF6E] mt-1">
                        {getRoomTypeLabel(room.type)}
                      </p>
                      {room.placeCategory && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {getPlaceCategoryLabel(room.placeCategory)}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  {/* Price & Features */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">${room.priceUsd}</span>
                      <span className="text-xs text-slate-400"> / night</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      ៛{room.priceKhr.toLocaleString()}
                    </span>
                  </div>

                  {/* Guest Info if Occupied or Reserved */}
                  {room.status === 'OCCUPIED' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FBEEEE]/80 dark:bg-[#2F1110]/40 border border-[#F6DBDA] dark:border-[#572220]/40 text-xs">
                      <p className="font-semibold text-[#572220] dark:text-[#EBB8B6] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#BC4E49]"></span>
                        {room.currentGuestName || activeRes?.guest_name || 'In-House Guest'}
                      </p>
                      {activeRes && (
                        <p className="text-[11px] text-[#832F2C] dark:text-[#DE8F8C] mt-1">
                          Check-out: {activeRes.check_out_date} ({activeRes.nights} {rmText.nights})
                        </p>
                      )}
                    </div>
                  )}

                  {room.status === 'CLEANING' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FBF7EF]/80 dark:bg-[#332812]/40 border border-[#F5EDD9] dark:border-[#59452A]/40 text-xs">
                      <p className="font-medium text-[#6E5630] dark:text-[#EAD9AF] flex items-center gap-1.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-[#B08C4F]" />
                        {rmText.cleaningInProgress}
                      </p>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFC489] mt-0.5">
                        {isKhmer ? 'បុគ្គលិកអនាម័យកំពុងរៀបចំ និងផ្លាស់ប្តូរកម្រាល' : 'Sanitizing, vacuuming & linen change'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  {room.status === 'AVAILABLE' && (
                    <button
                      onClick={() => openWalkInModalWithRoom(room.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#3A8059] hover:bg-[#2F6748] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserPlusIcon className="w-3.5 h-3.5" />
                      {rmText.quickCheckIn}
                    </button>
                  )}

                  {room.status === 'CLEANING' && (
                    <button
                      onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#3A8059] hover:bg-[#2F6748] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      {rmText.markClean}
                    </button>
                  )}

                  {room.status === 'OCCUPIED' && activeRes && (
                    <button
                      onClick={() => openCheckOutModal(activeRes)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#A13B37] hover:bg-[#832F2C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                      {rmText.checkOut}
                    </button>
                  )}

                  {/* Status Dropdown Quick Change */}
                  <select
                    value={room.status}
                    onChange={e => updateRoomStatus(room.id, e.target.value as RoomStatus)}
                    className="text-xs py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A96E]"
                    title="Change Status"
                  >
                    <option value="AVAILABLE">{rmText.statusAvailable}</option>
                    <option value="OCCUPIED">{rmText.statusOccupied}</option>
                    <option value="CLEANING">{rmText.statusCleaning}</option>
                    <option value="MAINTENANCE">{rmText.statusMaintenance}</option>
                    <option value="RESERVED">{rmText.statusReserved}</option>
                  </select>

                  {/* Edit Room Details button */}
                  <button
                    onClick={() => openEditModal(room)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                    title={rmText.editRoom}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode Display */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">{rmText.roomNumber}</th>
                  <th className="py-3.5 px-4">{rmText.floor}</th>
                  <th className="py-3.5 px-4">{rmText.roomType}</th>
                  <th className="py-3.5 px-4">{rmText.pricePerNight}</th>
                  <th className="py-3.5 px-4">{rmText.roomStatus}</th>
                  <th className="py-3.5 px-4">{rmText.guestName}</th>
                  <th className="py-3.5 px-4 text-right">{rmText.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredRooms.map(room => {
                  const activeRes = room.currentReservationId 
                    ? reservations.find(r => r.id === room.currentReservationId)
                    : reservations.find(r => (r.room_id === room.id || r.room_number === room.number) && r.status === 'CHECKED_IN');

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-base">
                        {room.number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {rmText.floor} {room.floor}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {getRoomTypeLabel(room.type)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">${room.priceUsd}</span>
                        <span className="text-xs text-slate-400 ml-1.5">(៛{room.priceKhr.toLocaleString()})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(room.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {room.currentGuestName || activeRes?.guest_name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {room.status === 'AVAILABLE' && (
                            <button
                              onClick={() => openWalkInModalWithRoom(room.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#EEF6F1] text-[#2F6748] hover:bg-[#DCEEE3] dark:bg-[#10261C]/40 dark:text-[#98CDAE] text-xs font-semibold"
                            >
                              {rmText.quickCheckIn}
                            </button>
                          )}
                          {room.status === 'CLEANING' && (
                            <button
                              onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                              className="px-2.5 py-1 rounded-lg bg-[#EEF6F1] text-[#2F6748] hover:bg-[#DCEEE3] dark:bg-[#10261C]/40 dark:text-[#98CDAE] text-xs font-semibold"
                            >
                              {rmText.markClean}
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(room)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                            title={rmText.editRoom}
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Room Modal */}
      {(editingRoom || isAddRoomOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-[#B08C4F]" />
                {editingRoom ? `${rmText.editRoom}: ${editingRoom.number}` : rmText.addRoom}
              </h2>
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setIsAddRoomOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.roomNumber}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.floor}
                  </label>
                  <select
                    required
                    value={formData.floor}
                    onChange={e => setFormData({ ...formData, floor: e.target.value === 'G' ? 'G' : Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  >
                    <option value="G">{rmText.groundFloor}</option>
                    <option value="1">{rmText.floor} 1</option>
                    <option value="2">{rmText.floor} 2</option>
                    <option value="3">{rmText.floor} 3</option>
                    <option value="4">{rmText.floor} 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {rmText.roomType}
                </label>
                <select
                  value={formData.type}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                >
                  {roomCategories.length === 0 && (
                    <option value="">{rmText.noCategoriesYet}</option>
                  )}
                  {roomCategories.map(cat => (
                    <option key={cat.id} value={cat.code}>
                      {cat.name}{cat.nameKm ? ` (${cat.nameKm})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="mt-1.5 text-xs font-semibold text-[#253B73] dark:text-[#93A9D4] hover:underline"
                >
                  + {rmText.manageCategories}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {rmText.placeCategory}
                </label>
                <select
                  value={formData.placeCategory}
                  onChange={e => setFormData({ ...formData, placeCategory: e.target.value as RoomPlaceCategory })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                >
                  <option value="">{rmText.selectPlace}</option>
                  {PLACE_CATEGORIES.map(p => (
                    <option key={p.code} value={p.code}>{rmText[p.labelKey]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Rate (USD $)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={formData.priceUsd}
                    onChange={e => {
                      const usd = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        priceUsd: usd, 
                        priceKhr: usd * 4100 
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Rate (KHR ៛)
                  </label>
                  <input
                    type="number"
                    min="40000"
                    step="1000"
                    required
                    value={formData.priceKhr}
                    onChange={e => setFormData({ ...formData, priceKhr: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.roomStatus}
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  >
                    <option value="AVAILABLE">{rmText.statusAvailable}</option>
                    <option value="OCCUPIED">{rmText.statusOccupied}</option>
                    <option value="CLEANING">{rmText.statusCleaning}</option>
                    <option value="MAINTENANCE">{rmText.statusMaintenance}</option>
                    <option value="RESERVED">{rmText.statusReserved}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.maxGuests}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.maxOccupancy}
                    onChange={e => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {rmText.amenities}
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Air Conditioning, Free WiFi, Flat TV, Modern Bathroom"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">Comma-separated list</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {editingRoom && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isKhmer ? 'តើអ្នកប្រាកដទេថាចង់លុបបន្ទប់នេះ?' : 'Are you sure you want to delete this room?')) {
                        deleteRoom(editingRoom.id);
                        setEditingRoom(null);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#832F2C] bg-[#FBEEEE] hover:bg-[#F6DBDA] transition-colors"
                  >
                    {isKhmer ? 'លុបបន្ទប់' : 'Delete Room'}
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoom(null);
                    setIsAddRoomOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B08C4F] hover:bg-[#8C6E3D] text-white text-sm font-bold shadow-sm transition-all"
                >
                  {isKhmer ? 'រក្សាទុក' : 'Save Room'}
                </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Category Manager Modal */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-[#B08C4F]" />
                {rmText.manageCategories}
              </h2>
              <button
                onClick={() => setIsCategoryManagerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto">
              <button
                onClick={openAddCategoryModal}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#C9A96E]/60 text-[#8C6E3D] dark:text-[#D3AF6E] hover:bg-[#FBF7EF] dark:hover:bg-[#332812]/30 text-sm font-semibold transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                {rmText.addCategory}
              </button>

              {roomCategories.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-6">{rmText.noCategoriesYet}</p>
              )}

              {roomCategories.map(cat => {
                const roomsUsingCategory = rooms.filter(r => r.type === cat.code).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {cat.name}{cat.nameKm ? ` · ${cat.nameKm}` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cat.bedType} &middot; {rmText.categoryMaxOccupancy}: {cat.maxOccupancy} &middot; ${cat.defaultPriceUsd} / {cat.defaultPriceKhr.toLocaleString()}&#x17DB;
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{roomsUsingCategory} room(s) using this category</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#C9A96E] text-slate-600 dark:text-slate-300"
                        title={rmText.editCategory}
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRoomCategory(cat.id)}
                        disabled={roomsUsingCategory > 0}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#BC4E49] text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={rmText.deleteCategory}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Occupancy by Date lookup */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowOccupancyLookup(!showOccupancyLookup)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-[#8C6E3D]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isKhmer ? 'ពិនិត្យបន្ទប់តាមកាលបរិច្ឆេទ' : 'Occupancy by Date'}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#F5EDD9] text-[#6E5630] text-[10px] font-bold">
              {occupancyOnDate.length}
            </span>
          </div>
          <ArrowRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${showOccupancyLookup ? 'rotate-90' : ''}`} />
        </button>

        {showOccupancyLookup && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <div className="max-w-xs">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isKhmer ? 'ជ្រើសរើសកាលបរិច្ឆេទ' : 'Select a date'}
              </label>
              <FormattedDateInput
                value={occupancyLookupDate}
                onChange={setOccupancyLookupDate}
                language={language}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKhmer
                ? `នៅថ្ងៃទី ${formatDate(occupancyLookupDate, language)} មានបន្ទប់ចំនួន ${occupancyOnDate.length} ដែលមានភ្ញៀវស្នាក់នៅ`
                : `On ${formatDate(occupancyLookupDate, language)}, ${occupancyOnDate.length} room${occupancyOnDate.length !== 1 ? 's' : ''} had a guest staying`}
            </p>

            {occupancyOnDate.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs text-slate-400">
                {isKhmer ? 'គ្មានបន្ទប់ណាមានភ្ញៀវនៅថ្ងៃនេះទេ។' : 'No rooms had guests on this date.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {occupancyOnDate
                  .sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }))
                  .map(r => (
                    <div key={r.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-extrabold text-[#111B3A] dark:text-white font-mono">
                          {isKhmer ? 'បន្ទប់' : 'Room'} {r.room_number}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'CHECKED_IN' ? 'bg-[#FBEEEE] text-[#832F2C]' :
                          r.status === 'CHECKED_OUT' ? 'bg-slate-100 text-slate-500' :
                          'bg-[#EEF1F8] text-[#304874]'
                        }`}>
                          {r.status === 'CHECKED_IN' ? (isKhmer ? 'កំពុងស្នាក់នៅ' : 'In-House') :
                           r.status === 'CHECKED_OUT' ? (isKhmer ? 'បានចាកចេញ' : 'Checked Out') :
                           (isKhmer ? 'បានបញ្ជាក់' : 'Confirmed')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{r.guest_name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(r.check_in_date, language)} → {formatDate(r.check_out_date, language)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Add / Edit Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-[#B08C4F]" />
                {editingCategory ? rmText.editCategory : rmText.addCategory}
              </h2>
              <button
                onClick={() => { setIsAddCategoryOpen(false); setEditingCategory(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.categoryName}
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. One Bed Room"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.categoryNameKm}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.nameKm}
                    onChange={e => setCategoryForm({ ...categoryForm, nameKm: e.target.value })}
                    placeholder="បន្ទប់គ្រែមួយ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.bedType}
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.bedType}
                    onChange={e => setCategoryForm({ ...categoryForm, bedType: e.target.value })}
                    placeholder="e.g. Queen Bed"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.categoryMaxOccupancy}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={categoryForm.maxOccupancy}
                    onChange={e => setCategoryForm({ ...categoryForm, maxOccupancy: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.defaultPriceUsd}
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={categoryForm.defaultPriceUsd}
                    onChange={e => {
                      const usd = Number(e.target.value);
                      setCategoryForm({ ...categoryForm, defaultPriceUsd: usd, defaultPriceKhr: usd * 4100 });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {rmText.defaultPriceKhr}
                  </label>
                  <input
                    type="number"
                    min="40000"
                    step="1000"
                    required
                    value={categoryForm.defaultPriceKhr}
                    onChange={e => setCategoryForm({ ...categoryForm, defaultPriceKhr: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddCategoryOpen(false); setEditingCategory(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B08C4F] hover:bg-[#8C6E3D] text-white text-sm font-bold shadow-sm transition-all"
                >
                  {rmText.saveCategory}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};