// Mapbox configuration
export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  defaultStyle: 'mapbox://styles/mapbox/streets-v12',
  defaultZoom: 10,
  defaultCenter: [-74.0059, 40.7128] as [number, number], // New York City
};

 
