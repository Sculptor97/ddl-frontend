import { MAPBOX_CONFIG } from '@/lib/config/mapbox';

export interface GeocodingResult {
  place_name: string;
  coordinates: [number, number]; // [longitude, latitude]
  context?: Array<{
    id: string;
    text: string;
  }>;
  properties?: {
    accuracy?: string;
    address?: string;
    category?: string;
  };
}

export interface GeocodingResponse {
  type: string;
  query: string[];
  features: Array<{
    id: string;
    type: string;
    place_type: string[];
    relevance: number;
    properties: {
      accuracy?: string;
      address?: string;
      category?: string;
    };
    text: string;
    place_name: string;
    bbox?: number[];
    center: [number, number];
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    context?: Array<{
      id: string;
      text: string;
    }>;
  }>;
  attribution: string;
}

/**
 * Geocode an address to coordinates using Mapbox Geocoding API
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult[]> => {
  if (!address.trim()) {
    return [];
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_CONFIG.accessToken}&limit=5&types=place,locality,neighborhood,address,poi`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data: GeocodingResponse = await response.json();
    
    return data.features.map(feature => ({
      place_name: feature.place_name,
      coordinates: feature.geometry.coordinates,
      context: feature.context,
      properties: feature.properties
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address. Please check your internet connection and try again.');
  }
};

/**
 * Reverse geocode coordinates to an address
 */
export const reverseGeocode = async (coordinates: [number, number]): Promise<GeocodingResult | null> => {
  try {
    const [lng, lat] = coordinates;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_CONFIG.accessToken}&limit=1`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data: GeocodingResponse = await response.json();
    
    if (data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    return {
      place_name: feature.place_name,
      coordinates: feature.geometry.coordinates,
      context: feature.context,
      properties: feature.properties
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Get address suggestions for autocomplete
 */
export const getAddressSuggestions = async (query: string): Promise<GeocodingResult[]> => {
  if (query.length < 3) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_CONFIG.accessToken}&limit=5&types=place,locality,neighborhood,address,poi&autocomplete=true`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data: GeocodingResponse = await response.json();
    
    return data.features.map(feature => ({
      place_name: feature.place_name,
      coordinates: feature.geometry.coordinates,
      context: feature.context,
      properties: feature.properties
    }));
  } catch (error) {
    console.error('Address suggestions error:', error);
    return [];
  }
};

/**
 * Validate if coordinates are within reasonable bounds
 */
export const validateCoordinates = (coordinates: [number, number]): boolean => {
  const [lng, lat] = coordinates;
  return (
    lng >= -180 && lng <= 180 &&
    lat >= -90 && lat <= 90
  );
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coordinates: [number, number]): string => {
  const [lng, lat] = coordinates;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Calculate distance between two coordinates (in miles)
 */
export const calculateDistance = (
  coord1: [number, number], 
  coord2: [number, number]
): number => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};
