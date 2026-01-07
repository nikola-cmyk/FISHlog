// Coordinate conversion utilities for DD°MM.MMM′ format

export interface DMSCoordinate {
  degrees: number;
  minutes: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

/**
 * Convert decimal degrees to degrees and decimal minutes (DD°MM.MMM′)
 * @param decimal - Decimal coordinate (e.g., 40.7128 or -74.0060)
 * @param isLongitude - Whether this is a longitude coordinate
 * @returns Formatted string like "40°42.768′N" or "74°00.360′W"
 */
export function decimalToDMS(decimal: number, isLongitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  
  let direction: 'N' | 'S' | 'E' | 'W';
  if (isLongitude) {
    direction = decimal >= 0 ? 'E' : 'W';
  } else {
    direction = decimal >= 0 ? 'N' : 'S';
  }
  
  return `${degrees}°${minutesDecimal.toFixed(3)}′${direction}`;
}

/**
 * Parse DD°MM.MMM′N/S/E/W format to decimal degrees
 * @param dmsString - String like "40°42.768′N" or "74°00.360′W"
 * @returns Decimal coordinate (e.g., 40.7128 or -74.0060)
 */
export function dmsToDecimal(dmsString: string): number | null {
  // Remove spaces and convert to uppercase
  const cleaned = dmsString.replace(/\s/g, '').toUpperCase();
  
  // Match patterns like: 40°42.768′N or 40°42.768'N or 40 42.768 N
  const match = cleaned.match(/^(\d+)[°\s]+(\d+\.?\d*)[′'\s]*([NSEW])$/);
  
  if (!match) {
    return null;
  }
  
  const degrees = parseInt(match[1]);
  const minutes = parseFloat(match[2]);
  const direction = match[3];
  
  // Validate ranges
  if (minutes >= 60) {
    return null;
  }
  
  let decimal = degrees + minutes / 60;
  
  // Apply direction (S and W are negative)
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

/**
 * Validate DMS coordinate string format
 * @param dmsString - String to validate
 * @returns true if valid format
 */
export function isValidDMS(dmsString: string): boolean {
  const cleaned = dmsString.replace(/\s/g, '').toUpperCase();
  return /^\d+[°\s]+\d+\.?\d*[′'\s]*[NSEW]$/.test(cleaned);
}

/**
 * Format decimal coordinates to DMS display
 * @param lat - Latitude in decimal degrees
 * @param lng - Longitude in decimal degrees
 * @returns Object with formatted strings
 */
export function formatCoordinates(lat: number, lng: number): { latitude: string; longitude: string } {
  return {
    latitude: decimalToDMS(lat, false),
    longitude: decimalToDMS(lng, true)
  };
}