import { useEffect, useState } from 'react';
import { getTrips, getLocations, deleteTrip, type FishingTrip, type Location } from '@/lib/supabase-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fish, MapPin, Calendar, Thermometer, Wind, Gauge, Moon, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ExportButton from '@/components/ExportButton';
import { toast } from 'sonner';

export default function History() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsData, locationsData] = await Promise.all([
        getTrips(),
        getLocations()
      ]);
      setTrips(tripsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const success = await deleteTrip(id);
      if (success) {
        setTrips(trips.filter(t => t.id !== id));
        toast.success('Trip deleted successfully');
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'Unknown Location';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-ocean-600 text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-ocean-900 mb-2">Trip History</h1>
            <p className="text-ocean-600">All your fishing adventures in one place</p>
          </div>
          <ExportButton />
        </div>

        {trips.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur border-ocean-200">
            <CardContent className="py-12 text-center">
              <Fish className="h-16 w-16 text-ocean-300 mx-auto mb-4" />
              <p className="text-ocean-600 text-lg">No trips logged yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="bg-white/95 backdrop-blur border-ocean-200 hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl flex items-center space-x-2">
                        <Fish className="h-6 w-6" />
                        <span>{trip.catch_quantity} Fish Caught</span>
                      </CardTitle>
                      <CardDescription className="text-ocean-100 mt-2">
                        {formatDate(trip.trip_date)} at {trip.trip_time}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      className="text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Location */}
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-ocean-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-ocean-600">Location</p>
                        <p className="font-semibold text-ocean-900">{getLocationName(trip.location_id)}</p>
                      </div>
                    </div>

                    {/* Species */}
                    {trip.catch_species && (
                      <div className="flex items-start space-x-3">
                        <Fish className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Species</p>
                          <p className="font-semibold text-ocean-900">{trip.catch_species}</p>
                        </div>
                      </div>
                    )}

                    {/* Size */}
                    {trip.catch_size && (
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Size</p>
                          <p className="font-semibold text-ocean-900">{trip.catch_size} cm</p>
                        </div>
                      </div>
                    )}

                    {/* Weight */}
                    {trip.catch_weight && (
                      <div className="flex items-start space-x-3">
                        <Gauge className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Weight</p>
                          <p className="font-semibold text-ocean-900">{trip.catch_weight} kg</p>
                        </div>
                      </div>
                    )}

                    {/* Temperature */}
                    {trip.weather_temp && (
                      <div className="flex items-start space-x-3">
                        <Thermometer className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Temperature</p>
                          <p className="font-semibold text-ocean-900">{trip.weather_temp}°C</p>
                        </div>
                      </div>
                    )}

                    {/* Wind */}
                    {trip.weather_wind && (
                      <div className="flex items-start space-x-3">
                        <Wind className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Wind Speed</p>
                          <p className="font-semibold text-ocean-900">{trip.weather_wind} km/h</p>
                        </div>
                      </div>
                    )}

                    {/* Pressure */}
                    {trip.weather_pressure && (
                      <div className="flex items-start space-x-3">
                        <Gauge className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Pressure</p>
                          <p className="font-semibold text-ocean-900">{trip.weather_pressure} hPa</p>
                        </div>
                      </div>
                    )}

                    {/* Moon Phase */}
                    {trip.moon_phase && (
                      <div className="flex items-start space-x-3">
                        <Moon className="h-5 w-5 text-ocean-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Moon Phase</p>
                          <p className="font-semibold text-ocean-900">{trip.moon_phase}</p>
                        </div>
                      </div>
                    )}

                    {/* Water Conditions */}
                    {trip.water_conditions && (
                      <div className="flex items-start space-x-3 md:col-span-2">
                        <div className="h-5 w-5 bg-ocean-600 rounded mt-0.5" />
                        <div>
                          <p className="text-sm text-ocean-600">Water Conditions</p>
                          <p className="font-semibold text-ocean-900">{trip.water_conditions}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {trip.notes && (
                    <div className="mt-6 p-4 bg-ocean-50 rounded-lg border border-ocean-200">
                      <p className="text-sm text-ocean-600 mb-1">Notes</p>
                      <p className="text-ocean-900">{trip.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}