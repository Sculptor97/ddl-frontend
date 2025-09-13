import * as turf from '@turf/turf';
import type { RouteData, DailyLog } from '@/lib/types/api';

/**
 * Spatial analysis utilities using Turf.js
 */

// Convert route coordinates to Turf LineString
export const createRouteLineString = (route: RouteData): turf.Feature<turf.LineString> => {
  return turf.lineString(route.geometry.coordinates);
};

// Calculate total distance of a route
export const calculateRouteDistance = (route: RouteData): number => {
  const lineString = createRouteLineString(route);
  return turf.length(lineString, { units: 'miles' });
};

// Calculate route duration in hours
export const calculateRouteDuration = (route: RouteData): number => {
  return route.duration / 3600; // Convert seconds to hours
};

// Split route into segments based on driving time limits
export const splitRouteByDrivingTime = (
  route: RouteData, 
  maxDrivingHours: number = 11
): Array<{ segment: turf.Feature<turf.LineString>, distance: number, duration: number }> => {
  const lineString = createRouteLineString(route);
  const totalDistance = calculateRouteDistance(route);
  const totalDuration = calculateRouteDuration(route);
  
  // Calculate how many segments we need
  const segmentsNeeded = Math.ceil(totalDuration / maxDrivingHours);
  const segmentDistance = totalDistance / segmentsNeeded;
  
  const segments: Array<{ segment: turf.Feature<turf.LineString>, distance: number, duration: number }> = [];
  
  for (let i = 0; i < segmentsNeeded; i++) {
    const startDistance = i * segmentDistance;
    const endDistance = Math.min((i + 1) * segmentDistance, totalDistance);
    
    // Create a point at the start distance
    const startPoint = turf.along(lineString, startDistance, { units: 'miles' });
    const endPoint = turf.along(lineString, endDistance, { units: 'miles' });
    
    // Create a line segment between these points
    const segment = turf.lineString([startPoint.geometry.coordinates, endPoint.geometry.coordinates]);
    
    const segmentDist = turf.distance(startPoint, endPoint, { units: 'miles' });
    const segmentDuration = (segmentDist / totalDistance) * totalDuration;
    
    segments.push({
      segment,
      distance: segmentDist,
      duration: segmentDuration
    });
  }
  
  return segments;
};

// Calculate optimal rest stops along route
export const calculateRestStops = (
  route: RouteData,
  restIntervalHours: number = 8
): Array<{ location: [number, number], distance: number, timeFromStart: number }> => {
  const lineString = createRouteLineString(route);
  const totalDistance = calculateRouteDistance(route);
  const totalDuration = calculateRouteDuration(route);
  
  const restStops: Array<{ location: [number, number], distance: number, timeFromStart: number }> = [];
  
  // Calculate rest stops at regular intervals
  const restIntervals = Math.floor(totalDuration / restIntervalHours);
  
  for (let i = 1; i <= restIntervals; i++) {
    const timeFromStart = i * restIntervalHours;
    const distanceRatio = timeFromStart / totalDuration;
    const distance = distanceRatio * totalDistance;
    
    const restPoint = turf.along(lineString, distance, { units: 'miles' });
    
    restStops.push({
      location: restPoint.geometry.coordinates as [number, number],
      distance,
      timeFromStart
    });
  }
  
  return restStops;
};

// Generate HOS-compliant daily schedule
export const generateHOSSchedule = (
  route: RouteData,
  startTime: string = '08:00',
  startDate: Date = new Date()
): DailyLog[] => {
  const totalDuration = calculateRouteDuration(route);
  const maxDrivingHours = 11; // FMCSA limit
  const maxOnDutyHours = 14; // FMCSA limit
  const requiredRestHours = 10; // FMCSA requirement
  
  const dailyLogs: DailyLog[] = [];
  let currentTime = new Date(`${startDate.toDateString()} ${startTime}`);
  let remainingDrivingHours = totalDuration;
  let dayNumber = 1;
  
  while (remainingDrivingHours > 0) {
    const dayStartTime = new Date(currentTime);
    const dayEntries: Array<{
      start_time: string;
      end_time: string;
      status: 'driving' | 'on_duty' | 'off_duty';
      location: string;
      duration: number;
    }> = [];
    
    let dayDrivingHours = 0;
    let dayOnDutyHours = 0;
    
    // Morning driving period
    const morningDrivingHours = Math.min(remainingDrivingHours, maxDrivingHours);
    if (morningDrivingHours > 0) {
      const endTime = new Date(currentTime.getTime() + morningDrivingHours * 60 * 60 * 1000);
      
      dayEntries.push({
        start_time: currentTime.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
        status: 'driving',
        location: `Route Segment ${dayNumber}`,
        duration: morningDrivingHours
      });
      
      dayDrivingHours += morningDrivingHours;
      dayOnDutyHours += morningDrivingHours;
      remainingDrivingHours -= morningDrivingHours;
      currentTime = endTime;
    }
    
    // Break period (if more driving needed)
    if (remainingDrivingHours > 0) {
      const breakHours = 0.5; // 30-minute break
      const breakEndTime = new Date(currentTime.getTime() + breakHours * 60 * 60 * 1000);
      
      dayEntries.push({
        start_time: currentTime.toTimeString().slice(0, 5),
        end_time: breakEndTime.toTimeString().slice(0, 5),
        status: 'on_duty',
        location: 'Break Location',
        duration: breakHours
      });
      
      dayOnDutyHours += breakHours;
      currentTime = breakEndTime;
      
      // Afternoon driving period
      const afternoonDrivingHours = Math.min(remainingDrivingHours, maxDrivingHours - dayDrivingHours);
      if (afternoonDrivingHours > 0) {
        const endTime = new Date(currentTime.getTime() + afternoonDrivingHours * 60 * 60 * 1000);
        
        dayEntries.push({
          start_time: currentTime.toTimeString().slice(0, 5),
          end_time: endTime.toTimeString().slice(0, 5),
          status: 'driving',
          location: `Route Segment ${dayNumber} (continued)`,
          duration: afternoonDrivingHours
        });
        
        dayDrivingHours += afternoonDrivingHours;
        dayOnDutyHours += afternoonDrivingHours;
        remainingDrivingHours -= afternoonDrivingHours;
        currentTime = endTime;
      }
    }
    
    // Off-duty period
    const offDutyHours = Math.max(requiredRestHours, 24 - dayOnDutyHours);
    const offDutyEndTime = new Date(currentTime.getTime() + offDutyHours * 60 * 60 * 1000);
    
    dayEntries.push({
      start_time: currentTime.toTimeString().slice(0, 5),
      end_time: offDutyEndTime.toTimeString().slice(0, 5),
      status: 'off_duty',
      location: 'Rest Area',
      duration: offDutyHours
    });
    
    // Create daily log
    dailyLogs.push({
      date: dayStartTime.toISOString().split('T')[0],
      entries: dayEntries,
      totals: {
        driving_hours: dayDrivingHours,
        on_duty_hours: dayOnDutyHours,
        off_duty_hours: offDutyHours,
        sleeper_berth_hours: 0 // Default to 0, could be calculated if sleeper berth entries exist
      }
    });
    
    currentTime = offDutyEndTime;
    dayNumber++;
  }
  
  return dailyLogs;
};

// Calculate route statistics
export const calculateRouteStatistics = (route: RouteData) => {
  const distance = calculateRouteDistance(route);
  const duration = calculateRouteDuration(route);
  const averageSpeed = distance / duration; // mph
  
  return {
    totalDistance: distance,
    totalDuration: duration,
    averageSpeed: averageSpeed,
    estimatedFuelCost: distance * 0.15, // Assuming $0.15 per mile
    estimatedTolls: distance * 0.05, // Assuming $0.05 per mile in tolls
  };
};

// Find nearest rest areas or truck stops
export const findNearestRestAreas = (
  route: RouteData,
  restStops: Array<{ location: [number, number], distance: number, timeFromStart: number }>
): Array<{ location: [number, number], distance: number, timeFromStart: number, amenities: string[] }> => {
  // This would typically integrate with a real API for truck stops
  // For now, we'll return the rest stops with mock amenities
  return restStops.map(stop => ({
    ...stop,
    amenities: ['Fuel', 'Food', 'Restrooms', 'Parking']
  }));
};

// Validate HOS compliance
export const validateHOSCompliance = (dailyLogs: DailyLog[]): {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
} => {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  dailyLogs.forEach((log, dayIndex) => {
    const { driving_hours, on_duty_hours, off_duty_hours, sleeper_berth_hours } = log.totals;
    
    // Check driving hours limit (11 hours)
    if (driving_hours > 11) {
      violations.push(`Day ${dayIndex + 1}: Exceeded 11-hour driving limit (${driving_hours.toFixed(1)} hours)`);
    }
    
    // Check on-duty hours limit (14 hours)
    if (on_duty_hours > 14) {
      violations.push(`Day ${dayIndex + 1}: Exceeded 14-hour on-duty limit (${on_duty_hours.toFixed(1)} hours)`);
    }
    
    // Check minimum rest requirement (10 hours total off duty + sleeper berth)
    const totalRestHours = off_duty_hours + (sleeper_berth_hours || 0);
    if (totalRestHours < 10) {
      violations.push(`Day ${dayIndex + 1}: Insufficient rest period (${totalRestHours.toFixed(1)} hours, minimum 10 required)`);
    }
    
    // Check 70-hour rule (would need 7-day rolling window)
    if (driving_hours > 10) {
      warnings.push(`Day ${dayIndex + 1}: High driving hours (${driving_hours.toFixed(1)} hours)`);
    }
  });
  
  return {
    isCompliant: violations.length === 0,
    violations,
    warnings
  };
};
