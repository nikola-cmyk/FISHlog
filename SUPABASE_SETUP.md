# Supabase Setup Instructions

Your eFISHent Fishlog app is now configured with Supabase authentication! Follow these steps to connect your own Supabase project:

## Step 1: Create a Supabase Account (Free)

1. Go to https://supabase.com
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

## Step 2: Create a New Project

1. Click "New Project" in your dashboard
2. Choose an organization (or create one)
3. Fill in project details:
   - **Name**: efishent-fishlog (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select "Free" (includes 500MB database, 50,000 monthly active users)
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Get Your API Credentials

1. In your project dashboard, click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
4. Copy both values

## Step 4: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. Save the file

## Step 5: Create Database Tables

1. In Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fishing_trips table
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

-- Create predictions table
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

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Users can view their own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for fishing_trips
CREATE POLICY "Users can view their own trips"
  ON fishing_trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
  ON fishing_trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON fishing_trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON fishing_trips FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for predictions
CREATE POLICY "Users can view their own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
  ON predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
  ON predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_fishing_trips_user_id ON fishing_trips(user_id);
CREATE INDEX idx_fishing_trips_date ON fishing_trips(trip_date DESC);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
```

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" message

## Step 6: Configure Email Settings (Optional but Recommended)

1. Go to "Authentication" > "Email Templates" in Supabase dashboard
2. Customize the confirmation email template if desired
3. Go to "Authentication" > "Providers"
4. Ensure "Email" provider is enabled
5. Configure "Confirm email" setting (recommended: enabled)

## Step 7: Test Your Setup

1. Restart your development server:
   ```bash
   pnpm run dev
   ```

2. Open your app in the browser
3. Try signing up with a test email
4. Check your email for confirmation link
5. Confirm your email and log in

## Troubleshooting

### "Invalid API credentials" error
- Double-check your `.env` file has the correct URL and key
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

### "Email not confirmed" error
- Check your spam folder for confirmation email
- In Supabase dashboard, go to Authentication > Users
- Find your user and click "..." > "Confirm email"

### Database connection issues
- Verify all SQL commands ran successfully
- Check Supabase project status (should be "Active")
- Try refreshing the Supabase dashboard

## What's Next?

Your app is now ready for users to sign up! Here's what works:

✅ User sign-up with email confirmation
✅ User login/logout
✅ Password reset
✅ Secure data storage (each user sees only their data)
✅ All features are FREE for all users

### Future Monetization (When Ready)

When you're ready to add paid plans:
1. Set up Stripe account
2. Uncomment Stripe integration code
3. Define subscription tiers
4. Add "Upgrade" buttons
5. Gate premium features

For now, focus on building your user base with the free tier!

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- MGX Support: https://docs.mgx.dev/introduction/community