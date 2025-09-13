import { 
  validateHOSCompliance,
  calculateRouteStatistics,
  generateHOSSchedule
} from '../spatialAnalysis';
import type { DailyLog, RouteData } from '@/lib/types/api';

describe('Spatial Analysis - HOS Compliance', () => {
  describe('validateHOSCompliance', () => {
    it('should validate compliant daily logs', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [
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
              status: 'off_duty',
              location: 'Rest',
              duration: 8
            }
          ],
          totals: {
            driving_hours: 6,
            on_duty_hours: 6,
            off_duty_hours: 8,
            sleeper_berth_hours: 0
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect 11-hour driving limit violation', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [],
          totals: {
            driving_hours: 12, // Exceeds 11-hour limit
            on_duty_hours: 12,
            off_duty_hours: 12,
            sleeper_berth_hours: 0
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Exceeded 11-hour driving limit');
    });

    it('should detect 14-hour on-duty limit violation', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [],
          totals: {
            driving_hours: 8,
            on_duty_hours: 15, // Exceeds 14-hour limit
            off_duty_hours: 9,
            sleeper_berth_hours: 0
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Exceeded 14-hour on-duty limit');
    });

    it('should detect insufficient rest period', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [],
          totals: {
            driving_hours: 8,
            on_duty_hours: 8,
            off_duty_hours: 8, // Less than 10 hours required
            sleeper_berth_hours: 0
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Insufficient rest period');
    });

    it('should handle sleeper berth hours in rest calculation', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [],
          totals: {
            driving_hours: 8,
            on_duty_hours: 8,
            off_duty_hours: 6,
            sleeper_berth_hours: 4 // Total rest = 10 hours
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should generate warnings for high driving hours', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [],
          totals: {
            driving_hours: 10.5, // High but not exceeding limit
            on_duty_hours: 10.5,
            off_duty_hours: 13.5,
            sleeper_berth_hours: 0
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('High driving hours');
    });

    it('should handle multiple days with violations', () => {
      const dailyLogs: DailyLog[] = [
        {
          date: '2024-01-01',
          entries: [],
          totals: {
            driving_hours: 12, // Violation
            on_duty_hours: 12,
            off_duty_hours: 12,
            sleeper_berth_hours: 0
          }
        },
        {
          date: '2024-01-02',
          entries: [],
          totals: {
            driving_hours: 8,
            on_duty_hours: 15, // Violation
            off_duty_hours: 9,
            sleeper_berth_hours: 0
          }
        }
      ];

      const result = validateHOSCompliance(dailyLogs);
      
      expect(result.isCompliant).toBe(false);
      expect(result.violations).toHaveLength(2);
      expect(result.violations[0]).toContain('Day 1');
      expect(result.violations[1]).toContain('Day 2');
    });
  });

  describe('calculateRouteStatistics', () => {
    it('should calculate correct route statistics', () => {
      const route: RouteData = {
        distance: 500, // miles
        duration: 36000, // 10 hours in seconds
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]]
        }
      };

      const stats = calculateRouteStatistics(route);
      
      expect(stats.totalDistance).toBe(500);
      expect(stats.totalDuration).toBe(10); // 36000 seconds = 10 hours
      expect(stats.averageSpeed).toBe(50); // 500 miles / 10 hours
      expect(stats.estimatedFuelCost).toBe(75); // 500 * 0.15
      expect(stats.estimatedTolls).toBe(25); // 500 * 0.05
    });

    it('should handle zero distance and duration', () => {
      const route: RouteData = {
        distance: 0,
        duration: 0,
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0]]
        }
      };

      const stats = calculateRouteStatistics(route);
      
      expect(stats.totalDistance).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.averageSpeed).toBe(0);
      expect(stats.estimatedFuelCost).toBe(0);
      expect(stats.estimatedTolls).toBe(0);
    });
  });

  describe('generateHOSSchedule', () => {
    it('should generate HOS-compliant schedule for short route', () => {
      const route: RouteData = {
        distance: 200, // Short route
        duration: 14400, // 4 hours in seconds
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]]
        }
      };

      const schedule = generateHOSSchedule(route, '08:00', new Date('2024-01-01'));
      
      expect(schedule).toHaveLength(1); // Should fit in one day
      expect(schedule[0].totals.driving_hours).toBe(4);
      expect(schedule[0].totals.driving_hours).toBeLessThanOrEqual(11);
      expect(schedule[0].totals.off_duty_hours).toBeGreaterThanOrEqual(10);
    });

    it('should generate multi-day schedule for long route', () => {
      const route: RouteData = {
        distance: 2000, // Long route
        duration: 144000, // 40 hours in seconds
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]]
        }
      };

      const schedule = generateHOSSchedule(route, '08:00', new Date('2024-01-01'));
      
      expect(schedule.length).toBeGreaterThan(1); // Should span multiple days
      
      // Each day should be HOS compliant
      schedule.forEach(day => {
        expect(day.totals.driving_hours).toBeLessThanOrEqual(11);
        expect(day.totals.on_duty_hours).toBeLessThanOrEqual(14);
        expect(day.totals.off_duty_hours).toBeGreaterThanOrEqual(10);
      });
    });

    it('should respect maximum driving hours per day', () => {
      const route: RouteData = {
        distance: 1000, // Long route
        duration: 72000, // 20 hours in seconds
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]]
        }
      };

      const schedule = generateHOSSchedule(route, '08:00', new Date('2024-01-01'));
      
      // First day should have maximum 11 hours driving
      expect(schedule[0].totals.driving_hours).toBeLessThanOrEqual(11);
      
      // Should have multiple days
      expect(schedule.length).toBeGreaterThan(1);
    });

    it('should include proper rest periods', () => {
      const route: RouteData = {
        distance: 500,
        duration: 36000, // 10 hours
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]]
        }
      };

      const schedule = generateHOSSchedule(route, '08:00', new Date('2024-01-01'));
      
      expect(schedule[0].totals.off_duty_hours).toBeGreaterThanOrEqual(10);
    });

    it('should handle different start times', () => {
      const route: RouteData = {
        distance: 200,
        duration: 14400, // 4 hours
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]]
        }
      };

      const morningSchedule = generateHOSSchedule(route, '08:00', new Date('2024-01-01'));
      const eveningSchedule = generateHOSSchedule(route, '20:00', new Date('2024-01-01'));
      
      expect(morningSchedule[0].entries[0].start_time).toBe('08:00');
      expect(eveningSchedule[0].entries[0].start_time).toBe('20:00');
    });
  });
});
