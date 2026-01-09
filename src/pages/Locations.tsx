import { useState, useEffect } from 'react';
import { getLocations, addLocation, deleteLocation, type Location } from '@/lib/supabase-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Plus, Trash2, Map } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '@/components/MapView';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newLocationData, setNewLocationData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: '',
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const locs = await getLocations();
    setLocations(locs);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedMapLocation({ lat, lng });
    setNewLocationData({
      ...newLocationData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const handleAddLocation = async () => {
    if (!newLocationData.name.trim()) {
      toast.error('Location Name Required', {
        description: 'Please enter a location name.',
      });
      return;
    }

    const result = await addLocation({
      name: newLocationData.name,
      latitude: newLocationData.latitude ? parseFloat(newLocationData.latitude) : undefined,
      longitude: newLocationData.longitude ? parseFloat(newLocationData.longitude) : undefined,
      description: newLocationData.description || undefined,
    });

    if (result) {
      await loadLocations();
      setNewLocationData({ name: '', latitude: '', longitude: '', description: '' });
      setSelectedMapLocation(null);
      setShowAddDialog(false);

      toast.success('Location Added!', {
        description: `${newLocationData.name} has been added successfully.`,
      });
    } else {
      toast.error('Error', {
        description: 'Failed to add location. Please try again.',
      });
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await deleteLocation(id);
      if (success) {
        await loadLocations();
        toast.success('Location Deleted', {
          description: `${name} has been removed.`,
        });
      } else {
        toast.error('Error', {
          description: 'Failed to delete location.',
        });
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setNewLocationData({
            ...newLocationData,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          });
          setSelectedMapLocation({ lat, lng });
          toast.success('Location Set', {
            description: 'Using your current location.',
          });
        },
        (error) => {
          toast.error('Location Error', {
            description: 'Could not get your current location. Please enable location services.',
          });
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast.error('Not Supported', {
        description: 'Geolocation is not supported by your browser.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-white/95 backdrop-blur border-ocean-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Fishing Locations</CardTitle>
                <CardDescription className="text-ocean-100">
                  Manage your favorite fishing spots
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-ocean-600 hover:bg-ocean-700 text-white border-2 border-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                {locations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto text-ocean-300 mb-4" />
                    <p className="text-lg text-ocean-600 mb-2">No locations saved yet</p>
                    <p className="text-sm text-ocean-500 mb-4">
                      Add your first fishing spot to get started
                    </p>
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      className="bg-ocean-600 hover:bg-ocean-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Location
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locations.map((location) => (
                      <Card key={location.id} className="border-2 border-ocean-200 hover:border-ocean-400 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-5 w-5 text-ocean-600" />
                              <CardTitle className="text-lg text-ocean-900">
                                {location.name}
                              </CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocation(location.id, location.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {location.description && (
                            <p className="text-sm text-ocean-700 mb-3">{location.description}</p>
                          )}
                          {location.latitude && location.longitude ? (
                            <div className="space-y-1">
                              <p className="text-xs text-ocean-600 font-medium">Coordinates:</p>
                              <p className="text-sm text-ocean-800 font-mono">
                                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-ocean-500 italic">No coordinates set</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map">
                <MapView
                  locations={locations}
                  showUserLocation={true}
                  allowClickToAdd={false}
                  height="600px"
                />
                {locations.length === 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-ocean-600">
                      No locations to display on map. Add locations with coordinates to see them here.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-ocean-600" />
              <span>Add New Fishing Location</span>
            </DialogTitle>
            <DialogDescription>
              Create a new fishing location. You can click on the map or use your current location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Interactive Map */}
            <div className="space-y-2">
              <Label>Select Location on Map</Label>
              <MapView
                locations={[]}
                onLocationSelect={handleMapClick}
                selectedLocation={selectedMapLocation}
                showUserLocation={true}
                allowClickToAdd={true}
                height="300px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_location_name">Location Name *</Label>
              <Input
                id="new_location_name"
                value={newLocationData.name}
                onChange={(e) => setNewLocationData({ ...newLocationData, name: e.target.value })}
                placeholder="e.g., Lake Victoria, River Thames"
                className="border-ocean-300 focus:border-ocean-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_location_lat">Latitude</Label>
                <Input
                  id="new_location_lat"
                  type="number"
                  step="0.000001"
                  value={newLocationData.latitude}
                  onChange={(e) => setNewLocationData({ ...newLocationData, latitude: e.target.value })}
                  placeholder="e.g., -1.286389"
                  className="border-ocean-300 focus:border-ocean-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_location_lng">Longitude</Label>
                <Input
                  id="new_location_lng"
                  type="number"
                  step="0.000001"
                  value={newLocationData.longitude}
                  onChange={(e) => setNewLocationData({ ...newLocationData, longitude: e.target.value })}
                  placeholder="e.g., 36.817223"
                  className="border-ocean-300 focus:border-ocean-500"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleUseCurrentLocation}
              variant="outline"
              className="w-full border-ocean-300 text-ocean-700 hover:bg-ocean-50"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Use My Current Location
            </Button>

            <div className="space-y-2">
              <Label htmlFor="new_location_desc">Description</Label>
              <Textarea
                id="new_location_desc"
                value={newLocationData.description}
                onChange={(e) => setNewLocationData({ ...newLocationData, description: e.target.value })}
                placeholder="Additional details about this location..."
                rows={3}
                className="border-ocean-300 focus:border-ocean-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewLocationData({ name: '', latitude: '', longitude: '', description: '' });
                setSelectedMapLocation(null);
              }}
              className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
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