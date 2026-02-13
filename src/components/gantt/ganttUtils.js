/**
 * Gantt Chart utility functions
 * Pure functions for date math, cascade logic, and layout calculations
 */

// Normalize a date to midnight (start of day)
export function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get number of days between two dates
export function daysBetween(start, end) {
  const s = normalizeDate(start);
  const e = normalizeDate(end);
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
}

// Add days to a date
export function addDays(date, days) {
  const d = normalizeDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Format date to display string
export function formatDate(date, style = 'short') {
  const d = new Date(date);
  if (style === 'short') {
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Get schedule duration in days (inclusive)
export function getScheduleDuration(schedule) {
  return daysBetween(schedule.start_date, schedule.end_date) + 1;
}

// Compute the visible time range from all schedules
export function computeTimeRange(schedules, paddingBefore = 7, paddingAfter = 14) {
  if (!schedules.length) {
    const today = normalizeDate(new Date());
    return {
      start: addDays(today, -7),
      end: addDays(today, 28),
    };
  }

  let minDate = normalizeDate(schedules[0].start_date);
  let maxDate = normalizeDate(schedules[0].end_date);

  for (const s of schedules) {
    const start = normalizeDate(s.start_date);
    const end = normalizeDate(s.end_date);
    if (start < minDate) minDate = start;
    if (end > maxDate) maxDate = end;
  }

  return {
    start: addDays(minDate, -paddingBefore),
    end: addDays(maxDate, paddingAfter),
  };
}

// Generate array of dates for the timeline header
export function generateDateRange(start, end) {
  const dates = [];
  const current = normalizeDate(start);
  const endDate = normalizeDate(end);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Group dates by month for the header
export function groupDatesByMonth(dates) {
  const months = [];
  let currentMonth = null;

  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!currentMonth || currentMonth.key !== key) {
      currentMonth = {
        key,
        label: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        days: 0,
      };
      months.push(currentMonth);
    }
    currentMonth.days++;
  }

  return months;
}

// Check if a date is a weekend
export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Check if a date is today
export function isToday(date) {
  const today = normalizeDate(new Date());
  const d = normalizeDate(date);
  return today.getTime() === d.getTime();
}

// Group schedules by supplier
export function groupBySupplier(schedules) {
  const groups = {};

  for (const schedule of schedules) {
    const key = schedule.supplier_id || 'no-supplier';
    const name = schedule.supplier_name || 'Tanpa Supplier';

    if (!groups[key]) {
      groups[key] = {
        supplier_id: key,
        supplier_name: name,
        schedules: [],
      };
    }
    groups[key].schedules.push(schedule);
  }

  // Sort schedules within each group by start_date
  for (const group of Object.values(groups)) {
    group.schedules.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  }

  return Object.values(groups);
}

// Layout bars within a supplier row to handle overlaps (lane assignment)
export function layoutBars(schedules) {
  const sorted = [...schedules].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const lanes = []; // Each lane tracks its end date

  return sorted.map((schedule) => {
    const start = normalizeDate(schedule.start_date);

    // Find the first lane where this schedule fits (no overlap)
    let assignedLane = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (start > lanes[i]) {
        assignedLane = i;
        break;
      }
    }

    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push(null);
    }

    lanes[assignedLane] = normalizeDate(schedule.end_date);

    return { ...schedule, lane: assignedLane };
  });
}

// Get max lanes for a set of schedules
export function getMaxLanes(layoutedSchedules) {
  if (!layoutedSchedules.length) return 1;
  return Math.max(...layoutedSchedules.map((s) => s.lane)) + 1;
}

/**
 * Calculate cascading date shifts when a schedule is moved forward.
 *
 * @param {Object} movedSchedule - The schedule being dragged
 * @param {number} deltaDays - Number of days shifted (positive = later)
 * @param {Array} supplierSchedules - All schedules for this supplier, sorted by start_date
 * @returns {Array} - Array of { ...schedule, new_start_date, new_end_date } for all affected schedules
 */
export function calculateCascade(movedSchedule, deltaDays, supplierSchedules) {
  if (deltaDays <= 0) {
    // Dragging backward: only move the dragged schedule, no cascade
    const duration = daysBetween(movedSchedule.start_date, movedSchedule.end_date);
    const newStart = addDays(movedSchedule.start_date, deltaDays);
    const newEnd = addDays(newStart, duration);
    return [
      {
        ...movedSchedule,
        new_start_date: newStart,
        new_end_date: newEnd,
      },
    ];
  }

  const changes = [];
  const duration = daysBetween(movedSchedule.start_date, movedSchedule.end_date);
  const newStart = addDays(movedSchedule.start_date, deltaDays);
  const newEnd = addDays(newStart, duration);

  changes.push({
    ...movedSchedule,
    new_start_date: newStart,
    new_end_date: newEnd,
  });

  // Get subsequent schedules (start on or after moved schedule's original start, excluding itself)
  const originalStart = normalizeDate(movedSchedule.start_date);
  const subsequent = supplierSchedules
    .filter(
      (s) =>
        s.id !== movedSchedule.id &&
        normalizeDate(s.start_date) >= originalStart &&
        s.status !== 'completed' &&
        s.status !== 'cancelled'
    )
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Ripple through subsequent schedules
  let lastEnd = newEnd;

  for (const schedule of subsequent) {
    const schedStart = normalizeDate(schedule.start_date);
    const schedDuration = daysBetween(schedule.start_date, schedule.end_date);

    if (schedStart <= lastEnd) {
      // Overlap detected, push forward
      const pushedStart = addDays(lastEnd, 1);
      const pushedEnd = addDays(pushedStart, schedDuration);

      changes.push({
        ...schedule,
        new_start_date: pushedStart,
        new_end_date: pushedEnd,
      });

      lastEnd = pushedEnd;
    } else {
      // No overlap, stop cascading
      break;
    }
  }

  return changes;
}

/**
 * Calculate cascading date shifts across the PRODUCTION CHAIN.
 * When a schedule is moved, all downstream stages of the same article
 * (same article_id + week_delivery) automatically adjust.
 *
 * Flow order: potong(0) → jahit(1) → sablon(2) → bordir(3)
 *
 * @param {Object} movedSchedule - The schedule being dragged
 * @param {number} deltaDays - Number of days shifted (positive = later, negative = earlier)
 * @param {Array} allSchedules - All schedules across all types
 * @returns {Array} - Array of { ...schedule, new_start_date, new_end_date }
 */
export function calculateChainCascade(movedSchedule, deltaDays, allSchedules) {
  const changes = [];
  const changedIds = new Set();

  // 1. Move the dragged schedule
  const duration = daysBetween(movedSchedule.start_date, movedSchedule.end_date);
  const newStart = addDays(movedSchedule.start_date, deltaDays);
  const newEnd = addDays(newStart, duration);

  changes.push({
    ...movedSchedule,
    new_start_date: newStart,
    new_end_date: newEnd,
  });
  changedIds.add(movedSchedule.id);

  // 2. Find all schedules in the same production chain (same article_id + week_delivery)
  if (movedSchedule.article_id && movedSchedule.week_delivery) {
    const chainSchedules = allSchedules.filter(
      (s) =>
        s.id !== movedSchedule.id &&
        s.article_id === movedSchedule.article_id &&
        s.week_delivery === movedSchedule.week_delivery &&
        s.status !== 'completed' &&
        s.status !== 'cancelled'
    );

    // Sort by production stage order
    chainSchedules.sort(
      (a, b) => (STAGE_ORDER[a.schedule_type] ?? 99) - (STAGE_ORDER[b.schedule_type] ?? 99)
    );

    const movedStageOrder = STAGE_ORDER[movedSchedule.schedule_type] ?? 99;

    // 3. Cascade downstream stages (stages that come AFTER the moved one in production flow)
    let lastEnd = newEnd;

    for (const schedule of chainSchedules) {
      const stageOrder = STAGE_ORDER[schedule.schedule_type] ?? 99;
      if (stageOrder <= movedStageOrder) continue; // Skip upstream stages

      const schedDuration = daysBetween(schedule.start_date, schedule.end_date);
      const schedStart = normalizeDate(schedule.start_date);

      // If downstream stage starts before or on the day the previous stage ends, push it
      if (schedStart <= lastEnd) {
        const pushedStart = addDays(lastEnd, 1);
        const pushedEnd = addDays(pushedStart, schedDuration);

        changes.push({
          ...schedule,
          new_start_date: pushedStart,
          new_end_date: pushedEnd,
        });
        changedIds.add(schedule.id);
        lastEnd = pushedEnd;
      } else {
        // No overlap but still shift by same delta to keep relative spacing
        const shiftedStart = addDays(schedule.start_date, deltaDays);
        const shiftedEnd = addDays(shiftedStart, schedDuration);

        // Only shift if it would start after lastEnd
        if (normalizeDate(shiftedStart) > lastEnd) {
          changes.push({
            ...schedule,
            new_start_date: shiftedStart,
            new_end_date: shiftedEnd,
          });
          changedIds.add(schedule.id);
          lastEnd = shiftedEnd;
        } else {
          const pushedStart = addDays(lastEnd, 1);
          const pushedEnd = addDays(pushedStart, schedDuration);
          changes.push({
            ...schedule,
            new_start_date: pushedStart,
            new_end_date: pushedEnd,
          });
          changedIds.add(schedule.id);
          lastEnd = pushedEnd;
        }
      }
    }
  }

  return changes;
}

// Production stage order and labels (used by chain cascade)
export const STAGE_ORDER = { potong: 0, jahit: 1, sablon: 2, bordir: 3 };
export const STAGE_LABELS = { potong: 'Potong', jahit: 'Jahit', sablon: 'Sablon', bordir: 'Bordir' };

// Type color configuration
export const typeColors = {
  potong: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-400',
    bgMuted: 'bg-blue-300/50',
    text: 'text-white',
    border: 'border-blue-600',
    label: 'Potong',
    hex: '#3b82f6',
  },
  jahit: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-400',
    bgMuted: 'bg-emerald-300/50',
    text: 'text-white',
    border: 'border-emerald-600',
    label: 'Jahit',
    hex: '#10b981',
  },
  sablon: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-400',
    bgMuted: 'bg-purple-300/50',
    text: 'text-white',
    border: 'border-purple-600',
    label: 'Sablon',
    hex: '#8b5cf6',
  },
  bordir: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-400',
    bgMuted: 'bg-orange-300/50',
    text: 'text-white',
    border: 'border-orange-600',
    label: 'Bordir',
    hex: '#f97316',
  },
};
