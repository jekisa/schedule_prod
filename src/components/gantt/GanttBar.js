'use client';

import { memo, useRef, useState } from 'react';
import { typeColors, formatDate } from './ganttUtils';

const BAR_HEIGHT = 32;
const BAR_GAP = 4;

function GanttBar({ schedule, left, width, lane, dayWidth, onDragStart, onDragEnd }) {
  const barRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const colors = typeColors[schedule.schedule_type] || typeColors.potong;
  const isDraggable = schedule.status !== 'completed' && schedule.status !== 'cancelled';
  const isMuted = schedule.status === 'completed' || schedule.status === 'cancelled';

  const top = lane * (BAR_HEIGHT + BAR_GAP);
  const label = schedule.article_name || 'No Name';
  const showQty = width > 80;

  const handleDragStart = (e) => {
    if (!isDraggable) return;

    const rect = barRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      scheduleId: schedule.id,
      scheduleType: schedule.schedule_type,
      supplierId: schedule.supplier_id,
      offsetX,
    }));

    if (barRef.current) {
      const clone = barRef.current.cloneNode(true);
      clone.style.opacity = '0.7';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, offsetX, BAR_HEIGHT / 2);
      setTimeout(() => document.body.removeChild(clone), 0);
    }

    onDragStart?.(schedule);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      ref={barRef}
      className={`absolute rounded-lg cursor-${isDraggable ? 'grab' : 'default'} select-none overflow-hidden transition-shadow group
        ${isMuted ? colors.bgMuted : colors.bg}
        ${isDraggable ? 'hover:shadow-lg hover:brightness-110 active:cursor-grabbing' : 'opacity-60'}
      `}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.max(width, 20)}px`,
        height: `${BAR_HEIGHT}px`,
      }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Bar content */}
      <div className={`flex items-center gap-1 px-2 h-full ${colors.text} text-xs font-medium whitespace-nowrap overflow-hidden`}>
        <span className="truncate">{label}</span>
        {showQty && (
          <span className="opacity-75 flex-shrink-0">({schedule.quantity})</span>
        )}
      </div>

      {/* Status indicator for completed */}
      {schedule.status === 'completed' && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <svg className="w-3.5 h-3.5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Cancelled indicator */}
      {schedule.status === 'cancelled' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-white/40 rotate-[-5deg]" />
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl min-w-[200px] whitespace-nowrap">
            <div className="font-semibold text-sm mb-1.5">{schedule.article_name}</div>
            <div className="space-y-1 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.hex }} />
                <span className="capitalize">{colors.label}</span>
              </div>
              <div>Qty: {schedule.quantity}</div>
              <div>Supplier: {schedule.supplier_name || '-'}</div>
              <div>PIC: {schedule.pic_name || '-'}</div>
              <div>{formatDate(schedule.start_date)} - {formatDate(schedule.end_date)}</div>
              <div className="capitalize">Status: {schedule.status?.replace('_', ' ')}</div>

            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(GanttBar);
export { BAR_HEIGHT, BAR_GAP };
