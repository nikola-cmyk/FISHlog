import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, getLocations, getUserProfile, type FishingTrip } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fish, MapPin, Calendar, TrendingUp, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [fishingName, setFishingName] = useState('');
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalCatch: 0,
    totalLocations: 0,
    avgCatchPerTrip: 0,
  });

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setFishingName(profile.fishing_name);
    }

    const allTrips = getTrips();
    const locations = getLocations();
    
    setTrips(allTrips.slice(0, 5).reverse());
    
    const totalCatch = allTrips.reduce((sum, trip) => sum + trip.catch_quantity, 0);
    setStats({
      totalTrips: allTrips.length,
      totalCatch,
      totalLocations: locations.length,
      avgCatchPerTrip: allTrips.length > 0 ? Math.round(totalCatch / allTrips.length) : 0,
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const displayTitle = fishingName 
    ? `${fishingName.toUpperCase()}'S FishLog` 
    : 'FishLog';

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      {/* Hero Section - More Space to Show Picture */}
      <div className="relative h-[500px] overflow-hidden -mt-16">
        <img 
          src="/assets/hero-fishing.jpg" 
          alt="Fishing Adventure" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center pt-20">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-04/723215e3-2c13-4a6d-858a-9fdd808af0e6.png" 
                alt="FishLog Logo" 
                className="h-16 w-16 object-contain rounded-xl shadow-2xl"
              />
              <h1 className="text-6xl font-bold text-white drop-shadow-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {displayTitle}
              </h1>
            </div>
            <div className="h-1.5 w-56 bg-gradient-to-r from-[#05BFDB] to-[#00A9C5] rounded-full mb-4 shadow-lg"></div>
            <p className="text-white text-2xl drop-shadow-lg font-bold">Track. Analyze. Catch More.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-24 relative z-10">
          <Card className="bg-white/95 backdrop-blur border-ocean-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ocean-700">Total Trips</CardTitle>
              <Calendar className="h-4 w-4 text-ocean-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ocean-900">{stats.totalTrips}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-ocean-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ocean-700">Total Catch</CardTitle>
              <Fish className="h-4 w-4 text-ocean-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ocean-900">{stats.totalCatch}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-ocean-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ocean-700">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-ocean-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ocean-900">{stats.totalLocations}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-ocean-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ocean-700">Avg per Trip</CardTitle>
              <TrendingUp className="h-4 w-4 text-ocean-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ocean-900">{stats.avgCatchPerTrip}</div>
            </CardContent>
          </Card>
        </div>

        {/* New Log Button */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/log')}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-[#05BFDB] to-[#088395] hover:from-[#00A9C5] hover:to-[#0A4D68] text-white font-bold text-lg py-6 px-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-white/20"
          >
            <Plus className="mr-2 h-6 w-6" />
            New Log
          </Button>
        </div>

        {/* Recent Trips */}
        <Card className="bg-white/95 backdrop-blur border-ocean-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Recent Trips</CardTitle>
            <CardDescription className="text-ocean-100">Your latest fishing adventures</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {trips.length === 0 ? (
              <div className="text-center py-12">
                <Fish className="h-16 w-16 text-ocean-300 mx-auto mb-4" />
                <p className="text-ocean-600 text-lg mb-4">No trips logged yet</p>
                <Button
                  onClick={() => navigate('/log')}
                  className="bg-ocean-600 hover:bg-ocean-700 text-white"
                >
                  Log Your First Trip
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 bg-ocean-50 rounded-lg border border-ocean-200 hover:bg-ocean-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-ocean-600 text-white p-3 rounded-lg">
                        <Fish className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-ocean-900">
                          {trip.catch_quantity} fish caught
                        </p>
                        <p className="text-sm text-ocean-600">
                          {formatDate(trip.trip_date)} at {trip.trip_time}
                        </p>
                        {trip.catch_species && (
                          <p className="text-sm text-ocean-700 mt-1">
                            {trip.catch_species}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/history')}
                      className="text-ocean-700 hover:text-ocean-900 hover:bg-ocean-200"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
                {trips.length >= 5 && (
                  <Button
                    variant="outline"
                    className="w-full border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                    onClick={() => navigate('/history')}
                  >
                    View All Trips
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}