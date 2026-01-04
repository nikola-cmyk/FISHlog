import { useState, useEffect } from 'react';
import { getTrips, getLocations, deleteTrip, type FishingTrip, type Location } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Fish, Trash2, Search, Weight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY for display
const formatDateForDisplay = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export default function History() {
  const { toast } = useToast();
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTrips(getTrips().sort((a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()));
    setLocations(getLocations());
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTrip(deleteId);
      loadData();
      setDeleteId(null);
      toast({
        title: 'Trip Deleted',
        description: 'The fishing trip has been removed.',
      });
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const location = locations.find((l) => l.id === trip.location_id);
    const searchLower = searchTerm.toLowerCase();
    const displayDate = formatDateForDisplay(trip.trip_date);
    return (
      trip.catch_species?.toLowerCase().includes(searchLower) ||
      location?.name.toLowerCase().includes(searchLower) ||
      displayDate.includes(searchTerm) ||
      trip.trip_date.includes(searchTerm) ||
      trip.notes?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 backdrop-blur border-ocean-200 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Trip History</CardTitle>
            <CardDescription className="text-ocean-100">View and manage all your fishing trips</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-5 w-5 text-ocean-500" />
              <Input
                placeholder="Search by species, location, date, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-ocean-300 focus:border-ocean-500"
              />
            </div>

            {filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <img
                  src="/assets/empty-state-fishing.jpg"
                  alt="No trips"
                  className="w-48 h-48 mx-auto mb-4 rounded-lg opacity-60"
                />
                <p className="text-ocean-600 text-lg">
                  {searchTerm ? 'No trips match your search' : 'No fishing trips logged yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((trip) => {
                  const location = locations.find((l) => l.id === trip.location_id);
                  const displayDate = formatDateForDisplay(trip.trip_date);
                  return (
                    <Card key={trip.id} className="border-ocean-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2 text-ocean-700">
                                <Calendar className="h-5 w-5" />
                                <span className="font-semibold">{displayDate}</span>
                                <span className="text-ocean-500">at {trip.trip_time}</span>
                              </div>
                              {location && (
                                <div className="flex items-center space-x-2 text-ocean-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{location.name}</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                              <div className="bg-ocean-50 p-3 rounded-lg">
                                <div className="text-xs text-ocean-600 mb-1">Species</div>
                                <div className="font-semibold text-ocean-900 text-sm">{trip.catch_species || 'N/A'}</div>
                              </div>
                              <div className="bg-ocean-50 p-3 rounded-lg">
                                <div className="text-xs text-ocean-600 mb-1">Total Quantity</div>
                                <div className="font-semibold text-ocean-900 flex items-center">
                                  <Fish className="h-4 w-4 mr-1" />
                                  {trip.catch_quantity}
                                </div>
                              </div>
                              <div className="bg-ocean-50 p-3 rounded-lg">
                                <div className="text-xs text-ocean-600 mb-1">Size</div>
                                <div className="font-semibold text-ocean-900">
                                  {trip.catch_size ? `${trip.catch_size} cm` : 'N/A'}
                                </div>
                              </div>
                              <div className="bg-ocean-50 p-3 rounded-lg">
                                <div className="text-xs text-ocean-600 mb-1">Weight</div>
                                <div className="font-semibold text-ocean-900 flex items-center">
                                  {trip.catch_weight ? (
                                    <>
                                      <Weight className="h-4 w-4 mr-1" />
                                      {trip.catch_weight} kg
                                    </>
                                  ) : (
                                    'N/A'
                                  )}
                                </div>
                              </div>
                              <div className="bg-ocean-50 p-3 rounded-lg">
                                <div className="text-xs text-ocean-600 mb-1">Temperature</div>
                                <div className="font-semibold text-ocean-900">
                                  {trip.weather_temp ? `${trip.weather_temp}°C` : 'N/A'}
                                </div>
                              </div>
                            </div>

                            {trip.notes && (
                              <div className="bg-ocean-50 p-3 rounded-lg border border-ocean-200">
                                <div className="text-xs text-ocean-600 mb-1">Notes</div>
                                <div className="text-sm text-ocean-800">{trip.notes}</div>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(trip.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this fishing trip from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}