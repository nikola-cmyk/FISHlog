// localStorage-based data management (Supabase alternative)
import { v4 as uuidv4 } from 'uuid';

export interface Location {
  id: string;
  user_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  created_at: string;
}

export interface FishingTrip {
  id: string;
  user_id: string;
  location_id?: string;
  trip_date: string;
  trip_time: string;
  weather_temp?: number;
  weather_wind?: number;
  weather_pressure?: number;
  moon_phase?: string;
  catch_species?: string;
  catch_quantity: number;
  catch_size?: number;
  catch_weight?: number;
  water_conditions?: string;
  notes?: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  location_id?: string;
  predicted_date: string;
  predicted_time: string;
  confidence_score?: number;
  factors?: Record<string, string | number>;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  fishing_name: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEYS = {
  LOCATIONS: 'fishing_app_locations',
  TRIPS: 'fishing_app_trips',
  PREDICTIONS: 'fishing_app_predictions',
  USER_ID: 'fishing_app_user_id',
  USER_PROFILE: 'fishing_app_user_profile',
};

// Get or create user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

// User Profile
export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
};

export const setUserProfile = (fishingName: string): UserProfile => {
  const userId = getUserId();
  const profile: UserProfile = {
    user_id: userId,
    fishing_name: fishingName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  return profile;
};

export const updateUserProfile = (fishingName: string): UserProfile => {
  const existing = getUserProfile();
  const profile: UserProfile = {
    user_id: getUserId(),
    fishing_name: fishingName,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  return profile;
};

// Locations
export const getLocations = (): Location[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
  return data ? JSON.parse(data) : [];
};

export const addLocation = (location: Omit<Location, 'id' | 'user_id' | 'created_at'>): Location => {
  const locations = getLocations();
  const newLocation: Location = {
    ...location,
    id: uuidv4(),
    user_id: getUserId(),
    created_at: new Date().toISOString(),
  };
  locations.push(newLocation);
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  return newLocation;
};

export const updateLocation = (id: string, updates: Partial<Location>): Location | null => {
  const locations = getLocations();
  const index = locations.findIndex((l) => l.id === id);
  if (index === -1) return null;
  locations[index] = { ...locations[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  return locations[index];
};

export const deleteLocation = (id: string): boolean => {
  const locations = getLocations();
  const filtered = locations.filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(filtered));
  return filtered.length < locations.length;
};

// Fishing Trips
export const getTrips = (): FishingTrip[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
  return data ? JSON.parse(data) : [];
};

export const addTrip = (trip: Omit<FishingTrip, 'id' | 'user_id' | 'created_at'>): FishingTrip => {
  const trips = getTrips();
  const newTrip: FishingTrip = {
    ...trip,
    id: uuidv4(),
    user_id: getUserId(),
    created_at: new Date().toISOString(),
  };
  trips.push(newTrip);
  localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  return newTrip;
};

export const updateTrip = (id: string, updates: Partial<FishingTrip>): FishingTrip | null => {
  const trips = getTrips();
  const index = trips.findIndex((t) => t.id === id);
  if (index === -1) return null;
  trips[index] = { ...trips[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  return trips[index];
};

export const deleteTrip = (id: string): boolean => {
  const trips = getTrips();
  const filtered = trips.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(filtered));
  return filtered.length < trips.length;
};

// Predictions
export const getPredictions = (): Prediction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
  return data ? JSON.parse(data) : [];
};

export const addPrediction = (prediction: Omit<Prediction, 'id' | 'user_id' | 'created_at'>): Prediction => {
  const predictions = getPredictions();
  const newPrediction: Prediction = {
    ...prediction,
    id: uuidv4(),
    user_id: getUserId(),
    created_at: new Date().toISOString(),
  };
  predictions.push(newPrediction);
  localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(predictions));
  return newPrediction;
};

export const calculateBestTimes = (): Prediction[] => {
  const trips = getTrips();
  const locations = getLocations();
  
  if (trips.length === 0) return [];

  // Simple algorithm: find patterns in successful trips
  const successfulTrips = trips.filter((t) => t.catch_quantity > 0);
  
  if (successfulTrips.length === 0) return [];

  // Group by time of day
  const timePatterns: Record<string, number> = {};
  successfulTrips.forEach((trip) => {
    const hour = parseInt(trip.trip_time.split(':')[0]);
    const timeSlot = hour < 6 ? 'early_morning' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;
  });

  // Find best time slot
  const bestTimeSlot = Object.entries(timePatterns).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  const predictions: Prediction[] = [];
  const today = new Date();
  
  // Generate predictions for next 7 days
  for (let i = 1; i <= 7; i++) {
    const predictedDate = new Date(today);
    predictedDate.setDate(today.getDate() + i);
    
    const timeMap: Record<string, string> = {
      early_morning: '05:30',
      morning: '08:00',
      afternoon: '14:00',
      evening: '18:30',
    };
    
    predictions.push({
      id: uuidv4(),
      user_id: getUserId(),
      location_id: locations[0]?.id,
      predicted_date: predictedDate.toISOString().split('T')[0],
      predicted_time: timeMap[bestTimeSlot] || '08:00',
      confidence_score: Math.min(95, 60 + (successfulTrips.length * 5)),
      factors: {
        based_on_trips: successfulTrips.length,
        best_time_slot: bestTimeSlot,
        pattern_strength: timePatterns[bestTimeSlot],
      },
      created_at: new Date().toISOString(),
    });
  }
  
  return predictions;
};