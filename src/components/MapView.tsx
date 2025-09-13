import { useState, useCallback, useRef } from 'react';
import Map, { Source, Layer, Marker, Popup, type MapRef } from 'react-map-gl';
import type { RouteData, DailyLog } from '@/lib/types/api';
import { MapPin, Navigation, Truck, Fuel, Coffee, Clock } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  route: RouteData;
  currentLocation: [number, number];
  pickup: [number, number];
  dropoff: [number, number];
  dailyLogs?: DailyLog[];
}

// Custom marker component
const CustomMarker = ({ 
  longitude, 
  latitude, 
  children, 
  color = '#FF4444',
  iconType = 'default'
}: {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  color?: string;
  iconType?: 'start' | 'pickup' | 'end' | 'fuel' | 'rest' | 'break' | 'default';
}) => {
  const [showPopup, setShowPopup] = useState(false);
  
  const getIcon = () => {
    switch (iconType) {
      case 'start':
        return <Navigation className="h-4 w-4" />;
      case 'pickup':
        return <MapPin className="h-4 w-4" />;
      case 'end':
        return <Truck className="h-4 w-4" />;
      case 'fuel':
        return <Fuel className="h-4 w-4" />;
      case 'rest':
        return <Coffee className="h-4 w-4" />;
      case 'break':
        return <Clock className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Marker
        longitude={longitude}
        latitude={latitude}
        onClick={() => setShowPopup(true)}
      >
        <div
          className="w-8 h-8 rounded-full border-3 border-white shadow-xl flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: color }}
        >
          <div className="text-white">
            {getIcon()}
          </div>
        </div>
      </Marker>
      
      {showPopup && (
        <Popup
          longitude={longitude}
          latitude={latitude}
          onClose={() => setShowPopup(false)}
          closeButton={true}
          closeOnClick={false}
          className="custom-popup"
        >
          <div className="p-2 min-w-32">
            {children}
          </div>
        </Popup>
      )}
    </>
  );
};

// Function to extract stops from daily logs
const extractStopsFromLogs = (dailyLogs: DailyLog[], routeCoordinates: number[][]) => {
  if (!dailyLogs || dailyLogs.length === 0 || !routeCoordinates || routeCoordinates.length === 0) {
    return [];
  }

  const stops: Array<{
    coordinates: [number, number];
    type: 'fuel' | 'rest' | 'break';
    location: string;
    duration: number;
    time: string;
  }> = [];

  // Process all daily logs to find stops
  dailyLogs.forEach((log, dayIndex) => {
    log.entries.forEach((entry, entryIndex) => {
      if (entry.location && (
        entry.location.includes('Fueling') || 
        entry.location.includes('Rest Break') ||
        entry.location.includes('Break')
      )) {
        // Calculate position along route based on entry index
        const totalEntries = dailyLogs.reduce((sum, d) => sum + d.entries.length, 0);
        const currentEntryIndex = dailyLogs.slice(0, dayIndex).reduce((sum, d) => sum + d.entries.length, 0) + entryIndex;
        const routePosition = Math.min(currentEntryIndex / totalEntries, 0.95); // Don't go to the very end
        
        const routeIndex = Math.floor(routePosition * (routeCoordinates.length - 1));
        const coordinates = routeCoordinates[routeIndex] as [number, number];

        let type: 'fuel' | 'rest' | 'break' = 'break';
        if (entry.location.includes('Fueling')) {
          type = 'fuel';
        } else if (entry.location.includes('Rest Break')) {
          type = 'rest';
        }

        stops.push({
          coordinates,
          type,
          location: entry.location,
          duration: entry.duration,
          time: entry.start_time
        });
      }
    });
  });

  return stops;
};

export function MapView({ route, currentLocation, pickup, dropoff, dailyLogs }: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState({
    longitude: currentLocation[0], // lng
    latitude: currentLocation[1],  // lat
    zoom: 10
  });

  // Debug logging
  console.log('MapView props:', { route, currentLocation, pickup, dropoff });
  console.log('Route geometry:', route.geometry);
  console.log('Route coordinates length:', route.geometry?.coordinates?.length);
  console.log('Current location:', currentLocation);
  console.log('Pickup location:', pickup);
  console.log('Dropoff location:', dropoff);

  // Calculate bounds to fit all points
  const calculateBounds = useCallback(() => {
    const allPoints = [currentLocation, pickup, dropoff];
    const lngs = allPoints.map(point => point[0]);
    const lats = allPoints.map(point => point[1]);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    return [
      [minLng, minLat],
      [maxLng, maxLat]
    ] as [[number, number], [number, number]];
  }, [currentLocation, pickup, dropoff]);

  // Fit map to bounds when component mounts or route changes
  const fitToBounds = useCallback(() => {
    if (mapRef.current) {
      const bounds = calculateBounds();
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }, [calculateBounds]);

  // Check if coordinates are valid
  const isValidCoordinate = (coord: [number, number]) => {
    const [lng, lat] = coord;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const defaultCurrent = !isValidCoordinate(currentLocation) ? [-74.0059, 40.7128] : currentLocation;
  const defaultPickup = !isValidCoordinate(pickup) ? [-73.9851, 40.7589] : pickup;
  const defaultDropoff = !isValidCoordinate(dropoff) ? [-74.0445, 40.6892] : dropoff;

  // Validate route data
  if (!route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length === 0) {
    console.error('Invalid route geometry:', route.geometry);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No route data available</p>
      </div>
    );
  }

  // Ensure route geometry coordinates are valid
  const validRouteCoordinates = route.geometry.coordinates.filter(coord => 
    coord && coord.length === 2 && 
    typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
    coord[0] >= -180 && coord[0] <= 180 && 
    coord[1] >= -90 && coord[1] <= 90
  );

  if (validRouteCoordinates.length === 0) {
    console.error('No valid route coordinates found:', route.geometry.coordinates);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Invalid route coordinates</p>
      </div>
    );
  }

  // Convert route geometry to GeoJSON format for Mapbox
  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: validRouteCoordinates
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">Map Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Start Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Pickup Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Dropoff Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Fueling Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Rest Break</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Other Break</span>
          </div>
        </div>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={fitToBounds}
        mapboxAccessToken={MAPBOX_CONFIG.accessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_CONFIG.defaultStyle}
        attributionControl={false}
      >
        {/* Route line */}
        {routeGeoJSON && validRouteCoordinates.length > 0 && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#FF4444',
                'line-width': 4,
                'line-opacity': 0.9
              }}
            />
            <Layer
              id="route-line-outline"
              type="line"
              paint={{
                'line-color': '#000000',
                'line-width': 6,
                'line-opacity': 0.4
              }}
            />
          </Source>
        )}

        {/* Current location marker */}
        <CustomMarker
          longitude={defaultCurrent[0]}
          latitude={defaultCurrent[1]}
          color="#FF4444"
          iconType="start"
        >
          <div>
            <h4 className="font-semibold text-brand-primary">Current Location</h4>
            <p className="text-sm text-muted-foreground">
              {defaultCurrent[1].toFixed(6)}, {defaultCurrent[0].toFixed(6)}
            </p>
          </div>
        </CustomMarker>

        {/* Pickup marker */}
        <CustomMarker
          longitude={defaultPickup[0]}
          latitude={defaultPickup[1]}
          color="#FF8800"
          iconType="pickup"
        >
          <div>
            <h4 className="font-semibold text-brand-secondary">Pickup Location</h4>
            <p className="text-sm text-muted-foreground">
              {defaultPickup[1].toFixed(6)}, {defaultPickup[0].toFixed(6)}
            </p>
          </div>
        </CustomMarker>

        {/* Dropoff marker */}
        <CustomMarker
          longitude={defaultDropoff[0]}
          latitude={defaultDropoff[1]}
          color="#0066FF"
          iconType="end"
        >
          <div>
            <h4 className="font-semibold text-brand-accent">Dropoff Location</h4>
            <p className="text-sm text-muted-foreground">
              {defaultDropoff[1].toFixed(6)}, {defaultDropoff[0].toFixed(6)}
            </p>
          </div>
        </CustomMarker>

        {/* Route stops (fueling, rest breaks, etc.) */}
        {dailyLogs && extractStopsFromLogs(dailyLogs, validRouteCoordinates).map((stop, index) => {
          let color = '#8B5CF6'; // Default purple
          if (stop.type === 'fuel') color = '#F59E0B'; // Orange
          else if (stop.type === 'rest') color = '#10B981'; // Green
          else if (stop.type === 'break') color = '#8B5CF6'; // Purple

          return (
            <CustomMarker
              key={`stop-${index}`}
              longitude={stop.coordinates[0]}
              latitude={stop.coordinates[1]}
              color={color}
              iconType={stop.type}
            >
              <div>
                <h4 className="font-semibold text-gray-800">{stop.location}</h4>
                <p className="text-sm text-gray-600">
                  Duration: {stop.duration.toFixed(1)} hours
                </p>
                <p className="text-sm text-gray-600">
                  Time: {stop.time}
                </p>
              </div>
            </CustomMarker>
          );
        })}
      </Map>
    </div>
  );
}