import { useState, useEffect } from 'react';
import { getLocations, addLocation, deleteLocation, type Location } from '@/lib/supabase';
import { decimalToDMS, dmsToDecimal, isValidDMS } from '@/lib/coordinate-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Trash2, Locate } from 'lucide-react';
import Navigation from '@/components/Navigation';
import LeafletMapView from '@/components/LeafletMapView';

export default function Locations() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: '',
  });

  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedMapLocation({ lat, lng });
    setNewLocation({
      ...newLocation,
      latitude: decimalToDMS(lat, false),
      longitude: decimalToDMS(lng, true),
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setNewLocation({
            ...newLocation,
            latitude: decimalToDMS(lat, false),
            longitude: decimalToDMS(lng, true),
          });
          setSelectedMapLocation({ lat, lng });
          toast({
            title: 'Location Set',
            description: 'Using your current location.',
          });
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Could not get your current location. Please enable location services.',
            variant: 'destructive',
          });
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
    }
  };

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    setNewLocation({ ...newLocation, [field]: value });
    
    const decimal = dmsToDecimal(value);
    if (decimal !== null) {
      if (field === 'latitude' && selectedMapLocation) {
        setSelectedMapLocation({ lat: decimal, lng: selectedMapLocation.lng });
      } else if (field === 'longitude' && selectedMapLocation) {
        setSelectedMapLocation({ lat: selectedMapLocation.lat, lng: decimal });
      }
    }
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      toast({
        title: 'Missing Information',
        description: 'Please provide location name and coordinates.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidDMS(newLocation.latitude) || !isValidDMS(newLocation.longitude)) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Please use DD°MM.MMM′N/S format for latitude and DD°MM.MMM′E/W for longitude.',
        variant: 'destructive',
      });
      return;
    }

    const decimalLat = dmsToDecimal(newLocation.latitude);
    const decimalLng = dmsToDecimal(newLocation.longitude);

    if (decimalLat === null || decimalLng === null) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Could not parse coordinates. Please check the format.',
        variant: 'destructive',
      });
      return;
    }

    const location = addLocation({
      name: newLocation.name,
      latitude: decimalLat.toString(),
      longitude: decimalLng.toString(),
      description: newLocation.description,
    });

    setLocations(getLocations());
    setShowAddDialog(false);
    setNewLocation({ name: '', latitude: '', longitude: '', description: '' });
    setSelectedMapLocation(null);

    toast({
      title: 'Location Added',
      description: `${location.name} has been added to your locations.`,
    });
  };

  const handleDeleteLocation = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    deleteLocation(id);
    setLocations(getLocations());
    
    toast({
      title: 'Location Deleted',
      description: `${location?.name} has been removed.`,
    });
  };

  const locationsWithCoords = locations.map(loc => ({
    ...loc,
    latitude: loc.latitude ? parseFloat(loc.latitude) : undefined,
    longitude: loc.longitude ? parseFloat(loc.longitude) : undefined,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-xl border-ocean-200">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center space-x-2">
                  <MapPin className="h-8 w-8" />
                  <span>Fishing Locations</span>
                </CardTitle>
                <CardDescription className="text-ocean-50">
                  Manage your favorite fishing spots
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Location
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <LeafletMapView
                locations={locationsWithCoords}
                showUserLocation={true}
                height="400px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((location) => (
                <Card key={location.id} className="border-ocean-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-ocean-900 flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-ocean-600" />
                          <span>{location.name}</span>
                        </CardTitle>
                        {location.description && (
                          <CardDescription className="mt-2">{location.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeleteLocation(location.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="text-ocean-700">
                        <span className="font-medium">Latitude:</span> {location.latitude || 'N/A'}
                      </p>
                      <p className="text-ocean-700">
                        <span className="font-medium">Longitude:</span> {location.longitude || 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {locations.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-ocean-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ocean-900 mb-2">No Locations Yet</h3>
                <p className="text-ocean-600 mb-4">Start by adding your first fishing location!</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-ocean-600 hover:bg-ocean-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-ocean-600" />
              <span>Add New Fishing Location</span>
            </DialogTitle>
            <DialogDescription>
              Click on the map to set coordinates, or enter them manually in DD°MM.MMM′ format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Location on Map</Label>
              <LeafletMapView
                locations={[]}
                onLocationSelect={handleMapClick}
                selectedLocation={selectedMapLocation}
                showUserLocation={true}
                allowClickToAdd={true}
                height="300px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name *</Label>
              <Input
                id="location_name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="e.g., Lake Victoria, River Thames"
                className="border-ocean-300 focus:border-ocean-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_lat">Latitude (DD°MM.MMM′N/S)</Label>
                <Input
                  id="location_lat"
                  value={newLocation.latitude}
                  onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                  placeholder="e.g., 40°42.768′N"
                  className="border-ocean-300 focus:border-ocean-500 font-mono"
                />
                {newLocation.latitude && !isValidDMS(newLocation.latitude) && (
                  <p className="text-xs text-red-600">Invalid format. Use: DD°MM.MMM′N/S</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_lng">Longitude (DD°MM.MMM′E/W)</Label>
                <Input
                  id="location_lng"
                  value={newLocation.longitude}
                  onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                  placeholder="e.g., 74°00.360′W"
                  className="border-ocean-300 focus:border-ocean-500 font-mono"
                />
                {newLocation.longitude && !isValidDMS(newLocation.longitude) && (
                  <p className="text-xs text-red-600">Invalid format. Use: DD°MM.MMM′E/W</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_desc">Description (Optional)</Label>
              <Textarea
                id="location_desc"
                value={newLocation.description}
                onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                placeholder="e.g., Rocky shore with good bass fishing"
                rows={3}
                className="border-ocean-300 focus:border-ocean-500"
              />
            </div>

            <Button
              type="button"
              onClick={handleUseCurrentLocation}
              variant="outline"
              className="w-full border-ocean-300 text-ocean-700 hover:bg-ocean-50"
            >
              <Locate className="h-4 w-4 mr-2" />
              Use My Current Location
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="border-ocean-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Confirm Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}