import { supabase } from './supabase-client';

// Types
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

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Location functions
export async function getLocations(): Promise<Location[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  return data || [];
}

export async function addLocation(location: Omit<Location, 'id' | 'user_id' | 'created_at'>): Promise<Location | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('locations')
    .insert([{ ...location, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding location:', error);
    return null;
  }

  return data;
}

export async function updateLocation(id: string, updates: Partial<Location>): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating location:', error);
    return null;
  }

  return data;
}

export async function deleteLocation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting location:', error);
    return false;
  }

  return true;
}

// Fishing Trip functions
export async function getTrips(): Promise<FishingTrip[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('fishing_trips')
    .select('*')
    .eq('user_id', userId)
    .order('trip_date', { ascending: false })
    .order('trip_time', { ascending: false });

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return data || [];
}

export async function addTrip(trip: Omit<FishingTrip, 'id' | 'user_id' | 'created_at'>): Promise<FishingTrip | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('fishing_trips')
    .insert([{ ...trip, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding trip:', error);
    return null;
  }

  return data;
}

export async function deleteTrip(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('fishing_trips')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting trip:', error);
    return false;
  }

  return true;
}

// Get unique species from user's previous trips
export async function getUniqueSpecies(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('fishing_trips')
    .select('catch_species')
    .eq('user_id', userId)
    .not('catch_species', 'is', null);

  if (error) {
    console.error('Error fetching species:', error);
    return [];
  }

  // Extract unique species from the catch_species field
  const speciesSet = new Set<string>();
  data?.forEach(trip => {
    if (trip.catch_species) {
      // Split by ' | ' to get individual species entries
      const entries = trip.catch_species.split(' | ');
      entries.forEach(entry => {
        // Extract species name (before the parenthesis)
        const speciesMatch = entry.match(/^([^(]+)/);
        if (speciesMatch) {
          const species = speciesMatch[1].trim();
          if (species) {
            speciesSet.add(species);
          }
        }
      });
    }
  });

  return Array.from(speciesSet).sort();
}

// CSV Export function
export async function exportTripsToCSV(): Promise<void> {
  const trips = await getTrips();
  const locations = await getLocations();

  if (trips.length === 0) {
    throw new Error('No trips to export');
  }

  // Create location lookup map
  const locationMap = new Map(locations.map(loc => [loc.id, loc.name]));

  // CSV headers
  const headers = [
    'Date',
    'Time',
    'Location',
    'Species',
    'Quantity',
    'Size (cm)',
    'Weight (kg)',
    'Temperature (°C)',
    'Wind Speed (km/h)',
    'Pressure (hPa)',
    'Moon Phase',
    'Water Conditions',
    'Notes'
  ];

  // Convert trips to CSV rows
  const rows = trips.map(trip => [
    trip.trip_date,
    trip.trip_time,
    trip.location_id ? locationMap.get(trip.location_id) || 'Unknown' : 'N/A',
    trip.catch_species || 'N/A',
    trip.catch_quantity.toString(),
    trip.catch_size?.toString() || 'N/A',
    trip.catch_weight?.toString() || 'N/A',
    trip.weather_temp?.toString() || 'N/A',
    trip.weather_wind?.toString() || 'N/A',
    trip.weather_pressure?.toString() || 'N/A',
    trip.moon_phase || 'N/A',
    trip.water_conditions || 'N/A',
    trip.notes || 'N/A'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `fishlog_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Migration function from localStorage to Supabase
export async function migrateLocalStorageToSupabase(): Promise<{ success: boolean; message: string }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, message: 'User not authenticated' };
  }

  try {
    // Check if migration already done
    const migrated = localStorage.getItem('migrated_to_supabase');
    if (migrated === 'true') {
      return { success: true, message: 'Data already migrated' };
    }

    // Get old localStorage data
    const oldLocations = localStorage.getItem('fishlog_locations');
    const oldTrips = localStorage.getItem('fishlog_trips');

    let locationCount = 0;
    let tripCount = 0;

    // Migrate locations
    if (oldLocations) {
      const locations = JSON.parse(oldLocations);
      const locationIdMap = new Map<string, string>();

      for (const loc of locations) {
        const newLocation = await addLocation({
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          description: loc.description,
        });
        if (newLocation) {
          locationIdMap.set(loc.id, newLocation.id);
          locationCount++;
        }
      }

      // Migrate trips with updated location IDs
      if (oldTrips) {
        const trips = JSON.parse(oldTrips);
        for (const trip of trips) {
          const newLocationId = trip.location_id ? locationIdMap.get(trip.location_id) : undefined;
          await addTrip({
            location_id: newLocationId,
            trip_date: trip.date,
            trip_time: trip.time,
            weather_temp: trip.weather?.temperature,
            weather_wind: trip.weather?.windSpeed,
            weather_pressure: trip.weather?.pressure,
            moon_phase: trip.weather?.moonPhase,
            catch_species: trip.species,
            catch_quantity: trip.quantity || 0,
            catch_size: trip.size,
            catch_weight: trip.weight,
            water_conditions: trip.waterConditions,
            notes: trip.notes,
          });
          tripCount++;
        }
      }
    }

    // Mark migration as complete
    localStorage.setItem('migrated_to_supabase', 'true');

    return {
      success: true,
      message: `Successfully migrated ${locationCount} locations and ${tripCount} trips`,
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: 'Failed to migrate data. Please try again.',
    };
  }
}