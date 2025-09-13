import { 
  timeToSlotIndex, 
  createContinuousTimeline, 
  calculateTimelineTotals, 
  validateEntries,
  slotIndexToTime,
  generateTimeSlots
} from '../fmcsaUtils';
import type { LogEntry } from '@/lib/types/api';

describe('FMCSA Utils - Critical HOS Calculations', () => {
  describe('timeToSlotIndex', () => {
    it('should convert time strings to correct slot indices', () => {
      // Test basic time conversions
      expect(timeToSlotIndex('00:00')).toBe(0);
      expect(timeToSlotIndex('00:15')).toBe(1);
      expect(timeToSlotIndex('00:30')).toBe(2);
      expect(timeToSlotIndex('00:45')).toBe(3);
      expect(timeToSlotIndex('01:00')).toBe(4);
      expect(timeToSlotIndex('12:00')).toBe(48);
      expect(timeToSlotIndex('23:45')).toBe(95);
      expect(timeToSlotIndex('24:00')).toBe(96);
    });

    it('should handle edge cases correctly', () => {
      // Test midnight and end of day
      expect(timeToSlotIndex('00:00')).toBe(0);
      expect(timeToSlotIndex('24:00')).toBe(96);
      
      // Test quarter-hour boundaries
      expect(timeToSlotIndex('08:00')).toBe(32); // 8 * 4 = 32
      expect(timeToSlotIndex('08:15')).toBe(33);
      expect(timeToSlotIndex('08:30')).toBe(34);
      expect(timeToSlotIndex('08:45')).toBe(35);
    });

    it('should handle invalid time formats gracefully', () => {
      expect(timeToSlotIndex('invalid')).toBe(0);
      expect(timeToSlotIndex('25:00')).toBe(0);
      expect(timeToSlotIndex('12:70')).toBe(0);
      expect(timeToSlotIndex('')).toBe(0);
    });

    it('should handle fractional minutes correctly', () => {
      // Should floor fractional minutes
      expect(timeToSlotIndex('08:14')).toBe(32); // 8*4 + floor(14/15) = 32
      expect(timeToSlotIndex('08:16')).toBe(33); // 8*4 + floor(16/15) = 33
    });
  });

  describe('slotIndexToTime', () => {
    it('should convert slot indices back to time strings', () => {
      expect(slotIndexToTime(0)).toBe('00:00');
      expect(slotIndexToTime(1)).toBe('00:15');
      expect(slotIndexToTime(4)).toBe('01:00');
      expect(slotIndexToTime(32)).toBe('08:00');
      expect(slotIndexToTime(48)).toBe('12:00');
      expect(slotIndexToTime(95)).toBe('23:45');
      expect(slotIndexToTime(96)).toBe('24:00');
    });

    it('should handle edge cases', () => {
      expect(slotIndexToTime(-1)).toBe('00:00');
      expect(slotIndexToTime(100)).toBe('24:00');
    });
  });

  describe('createContinuousTimeline', () => {
    it('should create a continuous timeline from entries', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '14:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 6 
        },
        { 
          start_time: '14:00', 
          end_time: '24:00', 
          status: 'off_duty', 
          location: 'Rest', 
          duration: 10 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      
      expect(timeline).toHaveLength(96);
      expect(timeline[32]).toBe('driving'); // 08:00
      expect(timeline[55]).toBe('driving'); // 13:45
      expect(timeline[56]).toBe('off_duty'); // 14:00
      expect(timeline[95]).toBe('off_duty'); // 23:45
    });

    it('should fill gaps with off_duty status', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '14:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 6 
        },
        { 
          start_time: '16:00', 
          end_time: '18:00', 
          status: 'on_duty', 
          location: 'Loading', 
          duration: 2 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      
      // Gap between 14:00 and 16:00 should be filled with off_duty
      expect(timeline[56]).toBe('off_duty'); // 14:00
      expect(timeline[63]).toBe('off_duty'); // 15:45
      expect(timeline[64]).toBe('on_duty'); // 16:00
    });

    it('should handle midnight crossover correctly', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '23:00', 
          end_time: '00:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 1 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      
      // Should fill from 23:00 to end of day (24:00)
      expect(timeline[92]).toBe('driving'); // 23:00
      expect(timeline[95]).toBe('driving'); // 23:45
    });

    it('should handle empty entries array', () => {
      const timeline = createContinuousTimeline([]);
      
      expect(timeline).toHaveLength(96);
      expect(timeline.every(status => status === 'off_duty')).toBe(true);
    });

    it('should sort entries by start time', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '14:00', 
          end_time: '18:00', 
          status: 'on_duty', 
          location: 'Loading', 
          duration: 4 
        },
        { 
          start_time: '08:00', 
          end_time: '14:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 6 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      
      expect(timeline[32]).toBe('driving'); // 08:00
      expect(timeline[56]).toBe('on_duty'); // 14:00
    });
  });

  describe('calculateTimelineTotals', () => {
    it('should calculate correct totals from timeline', () => {
      const timeline = new Array(96).fill('off_duty');
      
      // Set 8 hours (32 slots) to driving
      for (let i = 32; i < 64; i++) {
        timeline[i] = 'driving';
      }
      
      // Set 2 hours (8 slots) to on_duty
      for (let i = 64; i < 72; i++) {
        timeline[i] = 'on_duty';
      }

      const totals = calculateTimelineTotals(timeline);
      
      expect(totals.driving).toBe(8); // 32 slots * 0.25 hours
      expect(totals.on_duty).toBe(2); // 8 slots * 0.25 hours
      expect(totals.off_duty).toBe(14); // 56 slots * 0.25 hours
      expect(totals.sleeper_berth).toBe(0);
    });

    it('should handle mixed status timeline', () => {
      const timeline = [
        'driving', 'driving', 'driving', 'driving', // 1 hour driving
        'on_duty', 'on_duty', 'on_duty', 'on_duty', // 1 hour on_duty
        'off_duty', 'off_duty', 'off_duty', 'off_duty', // 1 hour off_duty
        'sleeper_berth', 'sleeper_berth', 'sleeper_berth', 'sleeper_berth', // 1 hour sleeper_berth
        ...new Array(80).fill('off_duty') // Rest of day
      ];

      const totals = calculateTimelineTotals(timeline);
      
      expect(totals.driving).toBe(1);
      expect(totals.on_duty).toBe(1);
      expect(totals.off_duty).toBe(21); // 1 + 80*0.25
      expect(totals.sleeper_berth).toBe(1);
    });

    it('should handle null values in timeline', () => {
      const timeline = [
        'driving', 'driving', null, 'driving', // 3 slots driving, 1 null
        ...new Array(92).fill('off_duty')
      ];

      const totals = calculateTimelineTotals(timeline);
      
      expect(totals.driving).toBe(0.75); // 3 slots * 0.25 hours
      expect(totals.off_duty).toBe(23); // 92 slots * 0.25 hours
    });
  });

  describe('validateEntries', () => {
    it('should detect gaps between entries', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '14:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 6 
        },
        { 
          start_time: '15:00', 
          end_time: '18:00', 
          status: 'on_duty', 
          location: 'Loading', 
          duration: 3 
        }
      ];

      const issues = validateEntries(entries);
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('Gap of 60 minutes');
    });

    it('should detect overlaps between entries', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '15:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 7 
        },
        { 
          start_time: '14:00', 
          end_time: '18:00', 
          status: 'on_duty', 
          location: 'Loading', 
          duration: 4 
        }
      ];

      const issues = validateEntries(entries);
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('Overlap of 60 minutes');
    });

    it('should return no issues for continuous entries', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '14:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 6 
        },
        { 
          start_time: '14:00', 
          end_time: '18:00', 
          status: 'on_duty', 
          location: 'Loading', 
          duration: 4 
        }
      ];

      const issues = validateEntries(entries);
      
      expect(issues).toHaveLength(0);
    });

    it('should handle single entry', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '18:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 10 
        }
      ];

      const issues = validateEntries(entries);
      
      expect(issues).toHaveLength(0);
    });

    it('should handle empty entries array', () => {
      const issues = validateEntries([]);
      
      expect(issues).toHaveLength(0);
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate 96 time slots for 24 hours', () => {
      const slots = generateTimeSlots();
      
      expect(slots).toHaveLength(96);
    });

    it('should have correct time structure', () => {
      const slots = generateTimeSlots();
      
      // Test first few slots
      expect(slots[0]).toEqual({
        time: '00:00',
        hour: 0,
        quarter: 0,
        displayHour: 'Mid-night'
      });
      
      expect(slots[1]).toEqual({
        time: '00:15',
        hour: 0,
        quarter: 1,
        displayHour: 'Mid-night'
      });
      
      expect(slots[4]).toEqual({
        time: '01:00',
        hour: 1,
        quarter: 0,
        displayHour: '1 AM'
      });
    });

    it('should have correct display hours', () => {
      const slots = generateTimeSlots();
      
      expect(slots[0].displayHour).toBe('Mid-night'); // 00:00
      expect(slots[48].displayHour).toBe('Noon'); // 12:00
      expect(slots[4].displayHour).toBe('1 AM'); // 01:00
      expect(slots[16].displayHour).toBe('4 AM'); // 04:00
      expect(slots[56].displayHour).toBe('2 PM'); // 14:00
    });

    it('should have correct quarter values', () => {
      const slots = generateTimeSlots();
      
      // Every 4th slot should have quarter 0
      for (let i = 0; i < 96; i += 4) {
        expect(slots[i].quarter).toBe(0);
      }
      
      // Test specific quarters
      expect(slots[0].quarter).toBe(0); // 00:00
      expect(slots[1].quarter).toBe(1); // 00:15
      expect(slots[2].quarter).toBe(2); // 00:30
      expect(slots[3].quarter).toBe(3); // 00:45
    });
  });

  describe('HOS Compliance Edge Cases', () => {
    it('should handle 11-hour driving limit scenario', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '19:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 11 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      const totals = calculateTimelineTotals(timeline);
      
      expect(totals.driving).toBe(11);
      expect(totals.driving).toBeLessThanOrEqual(11); // FMCSA limit
    });

    it('should handle 14-hour on-duty limit scenario', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '14:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 6 
        },
        { 
          start_time: '14:00', 
          end_time: '22:00', 
          status: 'on_duty', 
          location: 'Loading', 
          duration: 8 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      const totals = calculateTimelineTotals(timeline);
      
      const totalOnDuty = totals.driving + totals.on_duty;
      expect(totalOnDuty).toBe(14);
      expect(totalOnDuty).toBeLessThanOrEqual(14); // FMCSA limit
    });

    it('should handle 10-hour rest requirement', () => {
      const entries: LogEntry[] = [
        { 
          start_time: '08:00', 
          end_time: '18:00', 
          status: 'driving', 
          location: 'Route', 
          duration: 10 
        },
        { 
          start_time: '18:00', 
          end_time: '04:00', 
          status: 'off_duty', 
          location: 'Rest', 
          duration: 10 
        }
      ];

      const timeline = createContinuousTimeline(entries);
      const totals = calculateTimelineTotals(timeline);
      
      expect(totals.off_duty).toBe(14); // 24 - 10 = 14 hours off duty
      expect(totals.off_duty).toBeGreaterThanOrEqual(10); // FMCSA requirement
    });
  });
});
