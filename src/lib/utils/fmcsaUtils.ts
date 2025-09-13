// Duty status colors matching FMCSA standards
export const DUTY_STATUS_COLORS = {
  off_duty: '#000000',      // Black
  sleeper_berth: '#000000', // Black (same as off duty)
  driving: '#FF0000',       // Red
  on_duty: '#00FF00',       // Green
};

// Convert time string to slot index
export const timeToSlotIndex = (timeStr: string): number => {
  if (timeStr === '24:00') {
    return 96; // End of day (96th slot)
  }
  if (timeStr === '00:00') {
    return 0; // Start of day (0th slot)
  }
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Validate time format
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
    console.warn(`Invalid time format: ${timeStr}`);
    return 0;
  }
  
  return hours * 4 + Math.floor(minutes / 15);
};

// Create duty status bar for a time period
export const createDutyBar = (startTime: string, endTime: string, status: string) => {
  const startSlot = timeToSlotIndex(startTime);
  const endSlot = timeToSlotIndex(endTime);
  const duration = endSlot - startSlot;
  
  return {
    startSlot,
    duration,
    status,
    color: DUTY_STATUS_COLORS[status as keyof typeof DUTY_STATUS_COLORS] || '#000000'
  };
};

// Create a continuous timeline from entries
export const createContinuousTimeline = (entries: any[]) => {
  const timeline = new Array(96).fill(null); // 96 slots for 24 hours (15-min intervals)
  
  // Sort entries by start time to ensure proper order
  const sortedEntries = [...entries].sort((a, b) => {
    const aStart = timeToSlotIndex(a.start_time);
    const bStart = timeToSlotIndex(b.start_time);
    return aStart - bStart;
  });
  
  sortedEntries.forEach((entry) => {
    const startSlot = timeToSlotIndex(entry.start_time);
    let endSlot = timeToSlotIndex(entry.end_time);
    
    // Handle midnight crossover cases
    if (entry.end_time === '00:00' && entry.start_time !== '00:00') {
      endSlot = 96; // End of day
    }
    
    // Handle case where end time is next day (e.g., 23:00 to 01:00)
    if (endSlot <= startSlot && entry.end_time !== '00:00') {
      endSlot += 96; // Next day
    }
    
    // Ensure we don't exceed the timeline bounds for current day
    const actualEndSlot = Math.min(endSlot, 96);
    
    // Fill timeline slots
    for (let slot = startSlot; slot < actualEndSlot && slot < 96; slot++) {
      if (slot >= 0) {
        timeline[slot] = entry.status;
      }
    }
  });
  
  // Fill gaps with 'off_duty' status (FMCSA requirement - unaccounted time is off duty)
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i] === null) {
      timeline[i] = 'off_duty';
    }
  }
  
  return timeline;
};

// Generate 24-hour time slots (15-minute intervals)
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const minutes = quarter * 15;
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push({
        time: timeString,
        hour,
        quarter,
        displayHour: hour === 0 ? 'Mid-night' : 
                    hour === 12 ? 'Noon' : 
                    hour > 12 ? `${hour - 12} PM` : 
                    `${hour} AM`
      });
    }
  }
  return slots;
};

// Calculate totals from timeline (more accurate than backend totals)
export const calculateTimelineTotals = (timeline: (string | null)[]) => {
  const totals = {
    off_duty: 0,
    sleeper_berth: 0,
    driving: 0,
    on_duty: 0
  };
  
  timeline.forEach((status) => {
    if (status && status in totals) {
      totals[status as keyof typeof totals] += 0.25; // 15-minute slots = 0.25 hours
    }
  });
  
  return totals;
};

// Validate entry continuity and detect gaps
export const validateEntries = (entries: any[]) => {
  const issues: string[] = [];
  const sortedEntries = [...entries].sort((a, b) => {
    const aStart = timeToSlotIndex(a.start_time);
    const bStart = timeToSlotIndex(b.start_time);
    return aStart - bStart;
  });
  
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = sortedEntries[i];
    const next = sortedEntries[i + 1];
    
    const currentEndSlot = timeToSlotIndex(current.end_time);
    const nextStartSlot = timeToSlotIndex(next.start_time);
    
    // Check for gaps
    if (currentEndSlot < nextStartSlot) {
      const gapMinutes = (nextStartSlot - currentEndSlot) * 15;
      issues.push(`Gap of ${gapMinutes} minutes between ${current.end_time} and ${next.start_time}`);
    }
    
    // Check for overlaps
    if (currentEndSlot > nextStartSlot) {
      const overlapMinutes = (currentEndSlot - nextStartSlot) * 15;
      issues.push(`Overlap of ${overlapMinutes} minutes between ${current.end_time} and ${next.start_time}`);
    }
  }
  
  return issues;
};

// Convert slot index back to time string
export const slotIndexToTime = (slotIndex: number): string => {
  if (slotIndex >= 96) return '24:00';
  if (slotIndex < 0) return '00:00';
  
  const hours = Math.floor(slotIndex / 4);
  const minutes = (slotIndex % 4) * 15;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
