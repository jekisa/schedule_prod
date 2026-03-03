'use client';

import { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/Modal';
import { useSchedules, useUpdateSchedule } from '@/hooks/useApi';
import GanttTimeline from './GanttTimeline';
import {
  groupBySupplier,
  calculateChainCascade,
  normalizeDate,
  daysBetween,
  formatDate,
  typeColors,
  STAGE_LABELS,
} from './ganttUtils';

const SCHEDULE_TYPES = ['potong', 'jahit', 'sablon', 'bordir'];

// 'active' = scheduled + in_progress combined
const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'in_progress', label: 'Proses' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatal' },
];

const ZOOM_PRESETS = [
  { label: 'S', value: 28, title: 'Kecil (28px/hari)' },
  { label: 'M', value: 40, title: 'Normal (40px/hari)' },
  { label: 'L', value: 56, title: 'Besar (56px/hari)' },
];

export default function GanttChart() {
  // Type filter
  const [activeTypes, setActiveTypes] = useState(new Set(SCHEDULE_TYPES));

  // Search & status filter
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Navigation & zoom
  const [monthOffset, setMonthOffset] = useState(0);
  const [dayWidth, setDayWidth] = useState(40);

  // Drag state
  const [dragState, setDragState] = useState(null);

  // Cascade confirmation
  const [cascadeData, setCascadeData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all schedule types
  const { data: potongData, isLoading: l1 } = useSchedules('potong');
  const { data: jahitData, isLoading: l2 } = useSchedules('jahit');
  const { data: sablonData, isLoading: l3 } = useSchedules('sablon');
  const { data: bordirData, isLoading: l4 } = useSchedules('bordir');

  const isLoading = l1 || l2 || l3 || l4;

  // Update mutations for each type
  const updatePotong = useUpdateSchedule('potong');
  const updateJahit = useUpdateSchedule('jahit');
  const updateSablon = useUpdateSchedule('sablon');
  const updateBordir = useUpdateSchedule('bordir');

  const updateMutations = useMemo(
    () => ({
      potong: updatePotong,
      jahit: updateJahit,
      sablon: updateSablon,
      bordir: updateBordir,
    }),
    [updatePotong, updateJahit, updateSablon, updateBordir]
  );

  // Merge all schedules with type tag
  const allSchedules = useMemo(() => {
    const merge = (data, type) =>
      (data?.schedules || []).map((s) => ({ ...s, schedule_type: type }));
    return [
      ...merge(potongData, 'potong'),
      ...merge(jahitData, 'jahit'),
      ...merge(sablonData, 'sablon'),
      ...merge(bordirData, 'bordir'),
    ];
  }, [potongData, jahitData, sablonData, bordirData]);

  // Fixed 1-month time range (independent of filtered data)
  const timeRange = useMemo(() => {
    const today = new Date();
    const start = normalizeDate(new Date(today.getFullYear(), today.getMonth() + monthOffset, 1));
    const end = normalizeDate(new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0));
    return { start, end };
  }, [monthOffset]);

  // Month label for display in nav button
  const monthLabel = useMemo(() => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [monthOffset]);

  // Apply all filters (type, search, status)
  const filteredSchedules = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    return allSchedules.filter((s) => {
      if (!activeTypes.has(s.schedule_type)) return false;
      if (q && !s.article_name?.toLowerCase().includes(q) && !s.supplier_name?.toLowerCase().includes(q)) return false;
      if (statusFilter === 'active') {
        if (s.status !== 'scheduled' && s.status !== 'in_progress') return false;
      } else if (statusFilter !== 'all') {
        if (s.status !== statusFilter) return false;
      }
      return true;
    });
  }, [allSchedules, activeTypes, searchText, statusFilter]);

  // Only show schedules that overlap the visible month window
  const visibleSchedules = useMemo(() => {
    const rangeStart = timeRange.start;
    const rangeEnd = timeRange.end;
    return filteredSchedules.filter((s) => {
      const start = normalizeDate(s.start_date);
      const end = normalizeDate(s.end_date);
      return start <= rangeEnd && end >= rangeStart;
    });
  }, [filteredSchedules, timeRange]);

  // Group by supplier (only visible schedules)
  const supplierGroups = useMemo(
    () => groupBySupplier(visibleSchedules),
    [visibleSchedules]
  );

  // Count active extra filters (besides type)
  const activeFilterCount = (searchText.trim() ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  // Toggle type filter
  const toggleType = useCallback((type) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Clear all extra filters
  const clearFilters = useCallback(() => {
    setSearchText('');
    setStatusFilter('all');
    setActiveTypes(new Set(SCHEDULE_TYPES));
  }, []);

  // Drag handlers
  const handleBarDragStart = useCallback((schedule) => {
    setDragState({ scheduleId: schedule.id, schedule });
  }, []);

  const handleBarDragEnd = useCallback(() => {
    setDragState(null);
  }, []);

  // Handle bar drop - calculate chain cascade across production stages
  const handleBarDrop = useCallback(
    (scheduleId, _scheduleType, _supplierId, newDate) => {
      const schedule = allSchedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const originalStart = normalizeDate(schedule.start_date);
      const newStart = normalizeDate(newDate);
      const deltaDays = daysBetween(originalStart, newStart);

      if (deltaDays === 0) return;

      const changes = calculateChainCascade(schedule, deltaDays, allSchedules);
      setCascadeData({ changes, deltaDays });
      setDragState(null);
    },
    [allSchedules]
  );

  // Confirm cascade changes
  const handleConfirmCascade = useCallback(async () => {
    if (!cascadeData) return;
    setIsUpdating(true);
    try {
      for (const change of cascadeData.changes) {
        const mutation = updateMutations[change.schedule_type];
        if (mutation) {
          await mutation.mutateAsync({
            id: change.id,
            article_id: change.article_id,
            article_name: change.article_name,
            description: change.description,
            quantity: change.quantity,
            pic_id: change.pic_id,
            supplier_id: change.supplier_id,
            week_delivery: change.week_delivery,
            start_date: change.new_start_date.toISOString(),
            end_date: change.new_end_date.toISOString(),
            notes: change.notes,
          });
        }
      }
      setCascadeData(null);
    } catch (error) {
      alert('Gagal memperbarui jadwal: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  }, [cascadeData, updateMutations]);

  const scrollToToday = useCallback(() => setMonthOffset(0), []);

  return (
    <DashboardLayout title="Gantt Chart" subtitle="Visualisasi jadwal produksi">

      {/* ── Toolbar ── */}
      <div className="space-y-2 mb-4">

        {/* Row 1: Navigation | Search | Zoom */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Navigation: month picker */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setMonthOffset((m) => m - 1)}
              className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-200"
              title="Bulan sebelumnya"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-4 py-1.5 text-sm font-semibold text-gray-700 min-w-[140px] text-center capitalize select-none">
              {monthLabel}
            </span>
            <button
              onClick={() => setMonthOffset((m) => m + 1)}
              className="p-2 hover:bg-gray-50 transition-colors border-l border-gray-200"
              title="Bulan berikutnya"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {/* Jump to current month */}
          {monthOffset !== 0 && (
            <button
              onClick={scrollToToday}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"
            >
              Bulan Ini
            </button>
          )}

          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari artikel / supplier..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Zoom presets */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
            <span className="pl-3 text-xs text-gray-400 font-medium select-none">Zoom</span>
            {ZOOM_PRESETS.map((z) => (
              <button
                key={z.value}
                onClick={() => setDayWidth(z.value)}
                title={z.title}
                className={`px-2.5 py-1.5 text-xs font-semibold transition-colors
                  ${dayWidth === z.value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Clear filters button */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset filter ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Row 2: Type filters | divider | Status filters */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Type filter toggles */}
          {SCHEDULE_TYPES.map((type) => {
            const colors = typeColors[type];
            const isActive = activeTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                  ${isActive
                    ? `${colors.bg} ${colors.text} border-transparent shadow-sm`
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                  }
                `}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.4)' : '#d1d5db' }}
                />
                {colors.label}
              </button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Status filter pills */}
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${statusFilter === opt.value
                  ? 'bg-gray-800 text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
            <span className="text-sm text-gray-500">Memuat jadwal...</span>
          </div>
        </div>
      ) : (
        <GanttTimeline
          supplierGroups={supplierGroups}
          timeRange={timeRange}
          dayWidth={dayWidth}
          onBarDragStart={handleBarDragStart}
          onBarDragEnd={handleBarDragEnd}
          onBarDrop={handleBarDrop}
          dragState={dragState}
        />
      )}

      {/* Info bar */}
      {!isLoading && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-500">{visibleSchedules.length} jadwal</span>
            <span className="text-gray-400">dari {filteredSchedules.length} total</span>
            <span>{supplierGroups.length} supplier</span>
            {activeFilterCount > 0 && (
              <span className="text-orange-500">{activeFilterCount} filter aktif</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            <span>Drag bar untuk menggeser jadwal. Jadwal berikutnya akan otomatis menyesuaikan.</span>
          </div>
        </div>
      )}

      {/* Cascade Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cascadeData}
        onClose={() => setCascadeData(null)}
        onConfirm={handleConfirmCascade}
        title="Konfirmasi Perubahan Jadwal"
        message={
          cascadeData ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                {cascadeData.changes.length === 1
                  ? 'Jadwal berikut akan diubah:'
                  : `Menggeser jadwal ini akan mempengaruhi ${cascadeData.changes.length - 1} jadwal lainnya (rantai produksi yang sama):`}
              </p>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {cascadeData.changes.map((change, i) => {
                  const colors = typeColors[change.schedule_type];
                  const stageLabel = STAGE_LABELS[change.schedule_type] || change.schedule_type;
                  return (
                    <div
                      key={change.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${i === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors?.hex }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 truncate">{change.article_name}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: colors?.hex }}>
                            {stageLabel}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(change.start_date)} – {formatDate(change.end_date)}
                          <span className="mx-1.5 text-gray-300">→</span>
                          <span className="text-blue-600 font-medium">
                            {formatDate(change.new_start_date)} – {formatDate(change.new_end_date)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : ''
        }
        confirmText={isUpdating ? 'Menyimpan...' : 'Konfirmasi'}
        cancelText="Batal"
        variant="info"
        isLoading={isUpdating}
      />
    </DashboardLayout>
  );
}
