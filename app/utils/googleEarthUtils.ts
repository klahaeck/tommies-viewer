// Utility functions for Google Earth component

export interface Coordinate {
  longitude: number;
  latitude: number;
  altitude?: number;
}

export interface FlyingAnimationOptions {
  duration?: number; // Duration in milliseconds
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  lookAtTarget?: boolean; // Whether to look at the target coordinate
}

// Predefined locations for quick access
export const LOCATIONS = {
  ST_THOMAS: { latitude: 44.9778, longitude: -93.2650, altitude: 5000 },
  NEW_YORK: { latitude: 40.7128, longitude: -74.0060, altitude: 10000 },
  SAN_FRANCISCO: { latitude: 37.7749, longitude: -122.4194, altitude: 8000 },
  LONDON: { latitude: 51.5074, longitude: -0.1278, altitude: 12000 },
  TOKYO: { latitude: 35.6762, longitude: 139.6503, altitude: 15000 },
  PARIS: { latitude: 48.8566, longitude: 2.3522, altitude: 8000 },
  SYDNEY: { latitude: -33.8688, longitude: 151.2093, altitude: 10000 },
  DUBAI: { latitude: 25.2048, longitude: 55.2708, altitude: 12000 },
} as const;

// Helper function to create a tour of multiple locations
export const createLocationTour = (locationKeys: (keyof typeof LOCATIONS)[]): Coordinate[] => {
  return locationKeys.map(key => LOCATIONS[key]);
};

// Helper function to validate coordinates
export const isValidCoordinate = (coord: any): coord is Coordinate => {
  return (
    typeof coord === 'object' &&
    coord !== null &&
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
};

// Helper function to calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper function to create a smooth flight path between coordinates
export const createSmoothFlightPath = (
  startCoord: Coordinate, 
  endCoord: Coordinate, 
  numPoints: number = 10
): Coordinate[] => {
  const path: Coordinate[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = startCoord.latitude + (endCoord.latitude - startCoord.latitude) * t;
    const lon = startCoord.longitude + (endCoord.longitude - startCoord.longitude) * t;
    const alt = startCoord.altitude && endCoord.altitude 
      ? startCoord.altitude + (endCoord.altitude - startCoord.altitude) * t
      : undefined;
    
    path.push({ latitude: lat, longitude: lon, altitude: alt });
  }
  
  return path;
};

// Helper function to get optimal altitude based on distance
export const getOptimalAltitude = (distance: number): number => {
  // Scale altitude based on distance for better viewing
  if (distance < 1) return 1000; // Local view
  if (distance < 10) return 5000; // City view
  if (distance < 100) return 15000; // Regional view
  if (distance < 1000) return 50000; // Country view
  return 100000; // Continental view
};

// Type guard for the global flyToCoordinates function
export const isFlyToCoordinatesAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).flyToCoordinates === 'function';
};

// Wrapper function to safely call flyToCoordinates
export const safeFlyToCoordinates = async (
  coordinates: Coordinate[], 
  options?: FlyingAnimationOptions
): Promise<boolean> => {
  if (!isFlyToCoordinatesAvailable()) {
    console.warn('flyToCoordinates function is not available. Make sure Google Earth is loaded.');
    return false;
  }
  
  try {
    await (window as any).flyToCoordinates(coordinates, options);
    return true;
  } catch (error) {
    console.error('Error calling flyToCoordinates:', error);
    return false;
  }
};
