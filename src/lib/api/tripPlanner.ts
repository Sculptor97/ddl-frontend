import axios from 'axios';
import type { TripPlanRequest, TripPlanResponse, Driver } from '../types/api';
import { ENDPOINTS } from '../constants/endpoints';

export const tripPlannerApi = {
  /**
   * Plan a trip with HOS compliance
   */
  planTrip: async (data: TripPlanRequest): Promise<TripPlanResponse> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    try {
      const response = await axios.post(`${baseURL}${ENDPOINTS.PLAN_TRIP}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
  // console.error('API Error:', error); // Uncomment for debugging
      if (error.response) {
        throw {
          error: error.response.data?.error || error.response.data?.message || 'API request failed',
          details: error.response.data
        };
      } else if (error.request) {
        throw {
          error: 'Network error - unable to reach the server',
          details: error.message
        };
      } else {
        throw {
          error: 'Request setup error',
          details: error.message
        };
      }
    }
  },

  /**
   * Get all drivers
   */
  getDrivers: async (): Promise<Driver[]> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    try {
      const response = await axios.get(`${baseURL}/drivers/`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      
      return response.data;
    } catch (error: unknown) {
      // console.error('API Error:', error); // Uncomment for debugging
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as Record<string, unknown>).response === 'object' &&
        (error as Record<string, unknown>).response !== null
      ) {
        const err = error as { response: { data?: { error?: string; message?: string } } };
        throw {
          error: err.response.data?.error || err.response.data?.message || 'API request failed',
          details: err.response.data
        };
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'request' in error &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
      ) {
        const err = error as { message: string };
        throw {
          error: 'Network error - unable to reach the server',
          details: err.message
        };
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
      ) {
        const err = error as { message: string };
        throw {
          error: 'Request setup error',
          details: err.message
        };
      } else {
        throw {
          error: 'Unknown error',
          details: error
        };
      }
    }
  },

  /**
   * Get driver logs
   */
  getDriverLogs: async (driverId: number): Promise<unknown[]> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    try {
      const response = await axios.get(`${baseURL}/drivers/${driverId}/logs/`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      
      return response.data;
    } catch (error: unknown) {
      // console.error('API Error:', error); // Uncomment for debugging
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as Record<string, unknown>).response === 'object' &&
        (error as Record<string, unknown>).response !== null
      ) {
        const err = error as { response: { data?: { error?: string; message?: string } } };
        throw {
          error: err.response.data?.error || err.response.data?.message || 'API request failed',
          details: err.response.data
        };
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'request' in error &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
      ) {
        const err = error as { message: string };
        throw {
          error: 'Network error - unable to reach the server',
          details: err.message
        };
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
      ) {
        const err = error as { message: string };
        throw {
          error: 'Request setup error',
          details: err.message
        };
      } else {
        throw {
          error: 'Unknown error',
          details: error
        };
      }
    }
  },
};
