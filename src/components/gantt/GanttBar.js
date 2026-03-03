'use client';

import { memo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { typeColors, formatDate } from './ganttUtils';

const BAR_HEIGHT = 32;
const BAR_GAP = 4;

const STATUS_LABEL = {
  scheduled: 'Terjadwal',
  in_progress: 'Proses',
  completed: 'Selesai',
  cancelled: 'Dibatal',
};
const STATUS_COLOR = {
  scheduled: 'text-blue-400',
  in_progress: 'text-yellow-400',
  completed: 'text-green-400',
  cancelled: 'text-red-400',
};

function TooltipPortal({ schedule, colors, mouseX, mouseY }) {
  const TOOLTIP_W = 224;
  const TOOLTIP_H = 170;
  const OFFSET = 14;

  let left = mouseX + OFFSET;
  let top = mouseY - TOOLTIP_H / 2;

  if (typeof window !== 'undefined') {
    if (left + TOOLTIP_W > window.innerWidth - 8) {
      left = mouseX - TOOLTIP_W - OFFSET;
    }
    if (top < 8) top = 8;
    if (top + TOOLTIP_H > window.innerHeight - 8) {
      top = window.innerHeight - TOOLTIP_H - 8;
    }
  }

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left, top }}
    >
      <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl w-56">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.hex }} />
          <span className="font-semibold text-sm leading-tight truncate">{schedule.article_name}</span>
        </div>

        {/* Badge */}
        <div className="mb-2">
          <span
            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: colors.hex }}
          >
            {colors.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1 text-gray-300">
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">Qty</span>
            <span className="text-white font-medium">{schedule.quantity}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">Supplier</span>
            <span className="text-white truncate max-w-[130px]">{schedule.supplier_name || '—'}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">PIC</span>
            <span className="text-white">{schedule.pic_name || '—'}</span>
          </div>
        </div>

        {/* Date + status */}
        <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
          <div className="text-gray-300">
            {formatDate(schedule.start_date)} – {formatDate(schedule.end_date)}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                schedule.status === 'in_progress' ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: schedule.status === 'completed' ? '#4ade80' : schedule.status === 'cancelled' ? '#f87171' : schedule.status === 'in_progress' ? '#fbbf24' : '#60a5fa' }}
            />
            <span className={STATUS_COLOR[schedule.status] || 'text-gray-400'}>
              {STATUS_LABEL[schedule.status] || schedule.status}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function GanttBar({ schedule, left, width, lane, dayWidth, onDragStart, onDragEnd, style }) {
  const barRef = useRef(null);
  const [mouse, setMouse] = useState(null); // { x, y } when hovering

  const colors = typeColors[schedule.schedule_type] || typeColors.potong;
  const isDraggable = schedule.status !== 'completed' && schedule.status !== 'cancelled';
  const isMuted = schedule.status === 'completed' || schedule.status === 'cancelled';

  const top = lane * (BAR_HEIGHT + BAR_GAP);
  const label = schedule.article_name || 'No Name';
  const showQty = width > 80;
  const showLabel = width > 32;

  const handleMouseMove = useCallback((e) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouse(null);
  }, []);

  const handleDragStart = (e) => {
    if (!isDraggable) return;
    setMouse(null); // hide tooltip while dragging

    const rect = barRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        scheduleId: schedule.id,
        scheduleType: schedule.schedule_type,
        supplierId: schedule.supplier_id,
        offsetX,
      })
    );

    // Custom drag ghost
    if (barRef.current) {
      const clone = barRef.current.cloneNode(true);
      clone.style.opacity = '0.85';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      clone.style.pointerEvents = 'none';
      clone.style.transform = 'scale(1.04)';
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
    <>
      <div
        ref={barRef}
        className={`absolute rounded-lg select-none overflow-hidden group
          ${isMuted ? colors.bgMuted : colors.bg}
          ${isDraggable ? 'hover:shadow-lg hover:brightness-110' : 'opacity-50'}
        `}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${Math.max(width, 20)}px`,
          height: `${BAR_HEIGHT}px`,
          cursor: isDraggable ? 'grab' : 'default',
          transition: 'opacity 0.15s',
          ...style,
        }}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Drag handle dots */}
        {isDraggable && width > 40 && (
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        )}

        {/* Bar label */}
        <div className={`flex items-center h-full ${isDraggable && width > 40 ? 'pl-5 pr-2' : 'px-2'} ${colors.text} text-xs font-medium whitespace-nowrap overflow-hidden`}>
          {showLabel && <span className="truncate">{label}</span>}
          {showQty && <span className="opacity-70 flex-shrink-0 ml-1">({schedule.quantity})</span>}
        </div>

        {/* Completed checkmark */}
        {schedule.status === 'completed' && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <svg className="w-3.5 h-3.5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Cancelled strikethrough */}
        {schedule.status === 'cancelled' && (
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="w-full h-px bg-white/50" />
          </div>
        )}
      </div>

      {/* Tooltip via portal — always on top, never clipped */}
      {mouse && (
        <TooltipPortal
          schedule={schedule}
          colors={colors}
          mouseX={mouse.x}
          mouseY={mouse.y}
        />
      )}
    </>
  );
}

export default memo(GanttBar);
export { BAR_HEIGHT, BAR_GAP };
