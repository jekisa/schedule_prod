'use client';

import { useRef, useCallback, useMemo } from 'react';
import GanttBar, { BAR_HEIGHT, BAR_GAP } from './GanttBar';
import {
  generateDateRange,
  groupDatesByMonth,
  isWeekend,
  isToday,
  daysBetween,
  normalizeDate,
  layoutBars,
  getMaxLanes,
} from './ganttUtils';

const DAY_WIDTH_DEFAULT = 40;
const DAY_WIDTH_MOBILE = 28;
const LABEL_WIDTH = 200;
const HEADER_HEIGHT = 52;
const ROW_PADDING = 8;

export default function GanttTimeline({
  supplierGroups,
  timeRange,
  dayWidth: dayWidthProp,
  onBarDragStart,
  onBarDragEnd,
  onBarDrop,
  dragState,
}) {
  const timelineRef = useRef(null);
  const dayWidth = dayWidthProp || DAY_WIDTH_DEFAULT;

  const dates = useMemo(() => generateDateRange(timeRange.start, timeRange.end), [timeRange]);
  const months = useMemo(() => groupDatesByMonth(dates), [dates]);
  const totalWidth = dates.length * dayWidth;

  const todayIndex = useMemo(() => {
    const today = normalizeDate(new Date());
    for (let i = 0; i < dates.length; i++) {
      if (normalizeDate(dates[i]).getTime() === today.getTime()) return i;
    }
    return -1;
  }, [dates]);

  // Calculate bar position from schedule dates
  const getBarPosition = useCallback(
    (schedule) => {
      const start = normalizeDate(schedule.start_date);
      const timeStart = normalizeDate(timeRange.start);
      const offsetDays = daysBetween(timeStart, start);
      const duration = daysBetween(schedule.start_date, schedule.end_date) + 1;

      return {
        left: offsetDays * dayWidth,
        width: duration * dayWidth - 2,
      };
    },
    [timeRange, dayWidth]
  );

  // Handle drop on timeline
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const timelineRect = timelineRef.current?.getBoundingClientRect();
        if (!timelineRect) return;

        // Calculate the drop position relative to timeline
        const dropX = e.clientX - timelineRect.left + timelineRef.current.scrollLeft - LABEL_WIDTH;
        const newDayIndex = Math.round((dropX - data.offsetX) / dayWidth);
        const newDate = new Date(timeRange.start);
        newDate.setDate(newDate.getDate() + newDayIndex);

        onBarDrop?.(data.scheduleId, data.scheduleType, data.supplierId, newDate);
      } catch (err) {
        // Invalid drag data
      }
    },
    [dayWidth, timeRange, onBarDrop]
  );

  return (
    <div
      ref={timelineRef}
      className="relative overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex" style={{ minWidth: `${LABEL_WIDTH + totalWidth}px` }}>
        {/* Left column - supplier labels */}
        <div className="sticky left-0 z-20 bg-white border-r border-gray-200 flex-shrink-0" style={{ width: `${LABEL_WIDTH}px` }}>
          {/* Header spacer */}
          <div className="border-b border-gray-200 bg-gray-50" style={{ height: `${HEADER_HEIGHT}px` }}>
            <div className="flex items-center justify-center h-full px-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</span>
            </div>
          </div>

          {/* Supplier names */}
          {supplierGroups.map((group) => {
            const layouted = layoutBars(group.schedules);
            const lanes = getMaxLanes(layouted);
            const rowHeight = lanes * (BAR_HEIGHT + BAR_GAP) + ROW_PADDING * 2;

            return (
              <div
                key={group.supplier_id}
                className="border-b border-gray-100 flex items-center px-4"
                style={{ height: `${rowHeight}px` }}
              >
                <div className="truncate">
                  <div className="font-medium text-sm text-gray-900 truncate">{group.supplier_name}</div>
                  <div className="text-xs text-gray-400">{group.schedules.length} jadwal</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column - timeline */}
        <div className="flex-1 relative">
          {/* Month + Day header */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200" style={{ height: `${HEADER_HEIGHT}px` }}>
            {/* Month row */}
            <div className="flex" style={{ height: '24px' }}>
              {months.map((month) => (
                <div
                  key={month.key}
                  className="border-r border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600"
                  style={{ width: `${month.days * dayWidth}px` }}
                >
                  {month.label}
                </div>
              ))}
            </div>
            {/* Day row */}
            <div className="flex" style={{ height: '28px' }}>
              {dates.map((date, i) => {
                const weekend = isWeekend(date);
                const today = isToday(date);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-[10px] font-medium border-r border-gray-100
                      ${weekend ? 'bg-gray-100/80 text-gray-400' : 'text-gray-500'}
                      ${today ? 'bg-blue-50 text-blue-600 font-bold' : ''}
                    `}
                    style={{ width: `${dayWidth}px` }}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule rows */}
          {supplierGroups.map((group) => {
            const layouted = layoutBars(group.schedules);
            const lanes = getMaxLanes(layouted);
            const rowHeight = lanes * (BAR_HEIGHT + BAR_GAP) + ROW_PADDING * 2;

            return (
              <div
                key={group.supplier_id}
                className="relative border-b border-gray-100"
                style={{ height: `${rowHeight}px` }}
              >
                {/* Grid columns (day stripes) */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {dates.map((date, i) => (
                    <div
                      key={i}
                      className={`border-r border-gray-50 ${isWeekend(date) ? 'bg-gray-50/50' : ''}`}
                      style={{ width: `${dayWidth}px`, flexShrink: 0 }}
                    />
                  ))}
                </div>

                {/* Today marker */}
                {todayIndex >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 pointer-events-none"
                    style={{ left: `${todayIndex * dayWidth + dayWidth / 2}px` }}
                  />
                )}

                {/* Bars */}
                <div className="relative" style={{ padding: `${ROW_PADDING}px 0` }}>
                  {layouted.map((schedule) => {
                    const { left, width } = getBarPosition(schedule);
                    const isDragging = dragState?.scheduleId === schedule.id;

                    return (
                      <GanttBar
                        key={schedule.id}
                        schedule={schedule}
                        left={left}
                        width={width}
                        lane={schedule.lane}
                        dayWidth={dayWidth}
                        onDragStart={onBarDragStart}
                        onDragEnd={onBarDragEnd}
                        style={isDragging ? { opacity: 0.4 } : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Today marker in header */}
          {todayIndex >= 0 && (
            <div
              className="absolute top-0 w-0.5 bg-red-400 z-30 pointer-events-none"
              style={{
                left: `${todayIndex * dayWidth + dayWidth / 2}px`,
                height: `${HEADER_HEIGHT}px`,
              }}
            >
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {supplierGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">Tidak ada jadwal untuk ditampilkan</p>
          <p className="text-xs mt-1">Buat jadwal baru atau ubah filter</p>
        </div>
      )}
    </div>
  );
}
