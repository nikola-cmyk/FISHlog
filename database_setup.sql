CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fishing_trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  location_id UUID REFERENCES locations,
  trip_date DATE NOT NULL,
  trip_time TIME NOT NULL,
  weather_temp DECIMAL(5, 2),
  weather_wind DECIMAL(5, 2),
  weather_pressure DECIMAL(6, 2),
  moon_phase TEXT,
  catch_species TEXT,
  catch_quantity INTEGER DEFAULT 0,
  catch_size DECIMAL(6, 2),
  catch_weight DECIMAL(6, 2),
  water_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  location_id UUID REFERENCES locations,
  predicted_date DATE NOT NULL,
  predicted_time TIME NOT NULL,
  confidence_score INTEGER,
  factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own locations" ON locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own locations" ON locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own locations" ON locations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own locations" ON locations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own trips" ON fishing_trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trips" ON fishing_trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trips" ON fishing_trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trips" ON fishing_trips FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own predictions" ON predictions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_fishing_trips_user_id ON fishing_trips(user_id);
CREATE INDEX idx_fishing_trips_date ON fishing_trips(trip_date DESC);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);