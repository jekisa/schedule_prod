/**
 * Calculate schedule status automatically based on current date and schedule dates
 * @param {Date|string} startDate - Schedule start date
 * @param {Date|string} endDate - Schedule end date
 * @param {string} currentStatus - Current status in database (used for 'cancelled' status)
 * @returns {string} - Calculated status: 'scheduled', 'in_progress', 'completed', or 'cancelled'
 */
export function calculateAutoStatus(startDate, endDate, currentStatus = 'scheduled') {
  // If status is cancelled, keep it as cancelled (manual override)
  if (currentStatus === 'cancelled') {
    return 'cancelled';
  }

  const now = new Date();
  // Reset time to start of day for accurate date comparison
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // If current date is before start date → scheduled
  if (now < start) {
    return 'scheduled';
  }

  // If current date is after end date → completed
  if (now > end) {
    return 'completed';
  }

  // If current date is between start and end (inclusive) → in_progress
  return 'in_progress';
}

/**
 * Transform schedule with auto-calculated status
 * @param {Object} schedule - Schedule document
 * @returns {Object} - Schedule with calculated status
 */
export function transformScheduleWithAutoStatus(schedule) {
  const scheduleObj = schedule.toJSON ? schedule.toJSON() : schedule;
  const autoStatus = calculateAutoStatus(
    scheduleObj.start_date,
    scheduleObj.end_date,
    scheduleObj.status
  );

  return {
    ...scheduleObj,
    status: autoStatus,
  };
}
