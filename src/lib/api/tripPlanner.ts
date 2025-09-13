import ApiRequest from '../axiosClient';
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
      console.error('API Error:', error);
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
    } catch (error: any) {
      console.error('API Error:', error);
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
   * Get driver logs
   */
  getDriverLogs: async (driverId: number): Promise<any[]> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    try {
      const response = await axios.get(`${baseURL}/drivers/${driverId}/logs/`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
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
};
