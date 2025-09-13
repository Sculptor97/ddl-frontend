export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export interface TripPlanRequest {
  current_location: [number, number];
  pickup: [number, number];
  dropoff: [number, number];
  driver_id?: number;
  current_cycle_used_hours?: number;
  start_date?: string;
  start_time?: string;
}

export interface LogEntry {
  start_time: string;
  end_time: string;
  status: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  location: string;
  duration: number;
}

export interface DailyLog {
  date: string;
  entries: LogEntry[];
  totals: {
    driving_hours: number;
    on_duty_hours: number;
    off_duty_hours: number;
    sleeper_berth_hours: number;
  };
}

export interface RouteData {
  distance: number;
  duration: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface TripPlanResponse {
  route: RouteData;
  daily_logs: DailyLog[];
  total_distance: number;
  total_duration: number;
  // Additional fields that might be useful for form population
  pickup_address?: string;
  dropoff_address?: string;
  current_address?: string;
}

export interface Driver {
  id: number;
  name: string;
  home_tz: string;
  created_at: string;
  updated_at: string;
}
