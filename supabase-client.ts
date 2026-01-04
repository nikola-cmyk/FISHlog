import { createClient } from '@supabase/supabase-js';

// PLACEHOLDER CREDENTIALS - Replace these with your actual Supabase project credentials
// To get your credentials:
// 1. Go to https://supabase.com and create a free account
// 2. Create a new project
// 3. Go to Project Settings > API
// 4. Copy your Project URL and anon/public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
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
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'premium';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  stripe_customer_id?: string;
  created_at: string;
}