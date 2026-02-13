'use client';

import { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/Modal';
import { useSchedules, useUpdateSchedule } from '@/hooks/useApi';
import GanttTimeline from './GanttTimeline';
import {
  computeTimeRange,
  groupBySupplier,
  calculateChainCascade,
  normalizeDate,
  daysBetween,
  addDays,
  formatDate,
  typeColors,
  STAGE_LABELS,
} from './ganttUtils';

const SCHEDULE_TYPES = ['potong', 'jahit', 'sablon', 'bordir'];

export default function GanttChart() {
  // Filters
  const [activeTypes, setActiveTypes] = useState(new Set(SCHEDULE_TYPES));
  const [weekOffset, setWeekOffset] = useState(0);

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
      (data?.schedules || []).map((s) => ({
        ...s,
        schedule_type: type,
      }));

    return [
      ...merge(potongData, 'potong'),
      ...merge(jahitData, 'jahit'),
      ...merge(sablonData, 'sablon'),
      ...merge(bordirData, 'bordir'),
    ];
  }, [potongData, jahitData, sablonData, bordirData]);

  // Filter by active types
  const filteredSchedules = useMemo(
    () => allSchedules.filter((s) => activeTypes.has(s.schedule_type)),
    [allSchedules, activeTypes]
  );

  // Compute time range
  const timeRange = useMemo(() => {
    const range = computeTimeRange(filteredSchedules);
    if (weekOffset !== 0) {
      return {
        start: addDays(range.start, weekOffset * 7),
        end: addDays(range.end, weekOffset * 7),
      };
    }
    return range;
  }, [filteredSchedules, weekOffset]);

  // Group by supplier
  const supplierGroups = useMemo(
    () => groupBySupplier(filteredSchedules),
    [filteredSchedules]
  );

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

  // Drag handlers
  const handleBarDragStart = useCallback((schedule) => {
    setDragState({ scheduleId: schedule.id, schedule });
  }, []);

  const handleBarDragEnd = useCallback(() => {
    setDragState(null);
  }, []);

  // Handle bar drop - calculate chain cascade across production stages
  const handleBarDrop = useCallback(
    (scheduleId, scheduleType, supplierId, newDate) => {
      const schedule = allSchedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const originalStart = normalizeDate(schedule.start_date);
      const newStart = normalizeDate(newDate);
      const deltaDays = daysBetween(originalStart, newStart);

      if (deltaDays === 0) return;

      // Cascade across the production chain (same article across potong→jahit→sablon→bordir)
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

  // Scroll to today
  const scrollToToday = useCallback(() => {
    setWeekOffset(0);
  }, []);

  return (
    <DashboardLayout title="Gantt Chart" subtitle="Visualisasi jadwal produksi">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Minggu sebelumnya"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollToToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            Hari Ini
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Minggu berikutnya"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>

        {/* Right: Type filters */}
        <div className="flex flex-wrap items-center gap-2">
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
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-sm ${isActive ? 'bg-white/30' : 'bg-gray-300'}`}
                  style={isActive ? { backgroundColor: colors.hex + '80' } : undefined}
                />
                {colors.label}
              </button>
            );
          })}
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
        /* Gantt Timeline */
        <GanttTimeline
          supplierGroups={supplierGroups}
          timeRange={timeRange}
          onBarDragStart={handleBarDragStart}
          onBarDragEnd={handleBarDragEnd}
          onBarDrop={handleBarDrop}
          dragState={dragState}
        />
      )}

      {/* Info bar */}
      {!isLoading && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>{filteredSchedules.length} jadwal ditampilkan</span>
            <span>{supplierGroups.length} supplier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Drag bar untuk menggeser jadwal. Jadwal setelahnya akan otomatis menyesuaikan.</span>
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
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors?.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {change.article_name}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                            style={{ backgroundColor: colors?.hex }}
                          >
                            {stageLabel}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(change.start_date)} - {formatDate(change.end_date)}
                          <span className="mx-1.5 text-gray-300">→</span>
                          <span className="text-blue-600 font-medium">
                            {formatDate(change.new_start_date)} - {formatDate(change.new_end_date)}
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
