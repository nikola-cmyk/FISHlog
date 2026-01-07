# FishLog Migration Guide - localStorage to Supabase

## Overview

Your FishLog app has been upgraded from browser localStorage to cloud-based Supabase database storage. This ensures your fishing logs persist across devices and browsers when you log in.

## What Changed

### 1. **Data Storage Migration**
- **Before**: All fishing trips and locations were stored in browser localStorage (device-specific)
- **After**: Data is now stored in Supabase PostgreSQL database (cloud-based, tied to your account)

### 2. **New Features**

#### CSV Export
- Export all your fishing logs to CSV format for Excel/Numbers
- Click the "Export to CSV" button on the History page
- Includes all trip details: date, time, location, catch data, weather conditions, notes

#### Automatic Migration Prompt
- When you first log in after this update, you'll see a migration prompt
- Click "Migrate Data" to transfer your old localStorage data to Supabase
- This is a one-time operation and happens automatically

### 3. **Database Tables Created**

```sql
- locations: Stores your fishing locations with GPS coordinates
- fishing_trips: Stores all your fishing trip logs
- predictions: Stores AI-generated fishing predictions (future use)
```

All tables have Row Level Security (RLS) enabled, meaning you can only see your own data.

## How to Use

### First Login After Update
1. Log in with your existing credentials
2. You'll see a migration prompt if you have old localStorage data
3. Click "Migrate Data" to transfer your data to the cloud
4. Your old trips and locations will now be accessible from any device

### Exporting Your Data
1. Navigate to the History page
2. Click the "Export to CSV" button in the top-right corner
3. Your browser will download a CSV file with all your fishing logs
4. Open the file in Excel, Google Sheets, or any spreadsheet application

### CSV File Format
The exported CSV includes these columns:
- Date
- Time
- Location
- Species
- Quantity
- Size (cm)
- Weight (kg)
- Temperature (°C)
- Wind Speed (km/h)
- Pressure (hPa)
- Moon Phase
- Water Conditions
- Notes

## Technical Details

### Data Access Functions
All data operations now use async functions from `/src/lib/supabase-data.ts`:

```typescript
// Get current user ID
await getCurrentUserId()

// Locations
await getLocations()
await addLocation(locationData)
await updateLocation(id, updates)
await deleteLocation(id)

// Fishing Trips
await getTrips()
await addTrip(tripData)
await deleteTrip(id)

// Export
await exportTripsToCSV()

// Migration
await migrateLocalStorageToSupabase()
```

### Database Schema
Each table includes:
- `id`: UUID primary key
- `user_id`: References auth.users (your Supabase account)
- `created_at`: Timestamp of record creation
- Additional fields specific to each table

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- You can only view your own data
- You can only insert/update/delete your own records
- No one else can access your fishing logs

## Troubleshooting

### "No trips showing after login"
- Click the migration prompt to transfer your old data
- If you dismissed it, refresh the page to see it again
- The migration only needs to happen once

### "Export button not working"
- Ensure you have at least one fishing trip logged
- Check your browser's download settings
- Try a different browser if issues persist

### "Data not syncing across devices"
- Ensure you're logged in with the same account on all devices
- Check your internet connection
- Refresh the page to load latest data

### "Migration failed"
- Check your internet connection
- Ensure you're logged in
- Try logging out and back in
- Contact support if issues persist

## Benefits of Cloud Storage

1. **Cross-Device Access**: Access your logs from any device
2. **Data Persistence**: Never lose your data when clearing browser cache
3. **Backup**: Your data is automatically backed up by Supabase
4. **Scalability**: No storage limits (within Supabase plan limits)
5. **Export**: Download your data anytime as CSV

## Privacy & Security

- All data is encrypted in transit (HTTPS)
- Row Level Security ensures data isolation
- Only you can access your fishing logs
- Supabase follows industry-standard security practices

## Support

If you encounter any issues:
1. Check this guide first
2. Try logging out and back in
3. Clear browser cache and try again
4. Contact support with specific error messages

---

**Last Updated**: January 2026
**Version**: 2.0.0