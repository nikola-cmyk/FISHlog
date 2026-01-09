import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTrip, getLocations, addLocation, type Location } from '@/lib/supabase';
import { getCurrentWeather } from '@/lib/weather';
import { decimalToDMS, dmsToDecimal, isValidDMS } from '@/lib/coordinate-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Fish, Plus, X, MapPin, Camera, Upload, CloudSun, Loader2, Locate } from 'lucide-react';
import Navigation from '@/components/Navigation';
import GoogleMapView from '@/components/GoogleMapView';

interface IndividualFish {
  id: string;
  size: string;
  weight: string;
}

interface CatchEntry {
  id: string;
  species: string;
  fish: IndividualFish[];
}

// Get today's date in YYYY-MM-DD format for date input
const getTodayFormatted = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LogTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newLocationData, setNewLocationData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: '',
  });
  const [catches, setCatches] = useState<CatchEntry[]>([
    { id: '1', species: '', fish: [{ id: '1-1', size: '', weight: '' }] }
  ]);
  const [formData, setFormData] = useState({
    location_id: '',
    trip_date: getTodayFormatted(),
    trip_time: new Date().toTimeString().slice(0, 5),
    weather_temp: '',
    wind_name: '',
    wind_direction: '',
    wind_speed: '',
    weather_pressure: '',
    moon_phase: '',
    water_conditions: '',
    notes: '',
  });

  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedMapLocation({ lat, lng });
    setNewLocationData({
      ...newLocationData,
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
          setNewLocationData({
            ...newLocationData,
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
    setNewLocationData({ ...newLocationData, [field]: value });
    
    // Try to parse and update map if valid
    const decimal = dmsToDecimal(value);
    if (decimal !== null) {
      if (field === 'latitude' && selectedMapLocation) {
        setSelectedMapLocation({ lat: decimal, lng: selectedMapLocation.lng });
      } else if (field === 'longitude' && selectedMapLocation) {
        setSelectedMapLocation({ lat: selectedMapLocation.lat, lng: decimal });
      }
    }
  };

  const handleFetchWeather = async () => {
    const location = locations.find(loc => loc.id === formData.location_id);
    
    if (!location || !location.latitude || !location.longitude) {
      toast({
        title: 'Location Required',
        description: 'Please select a location with GPS coordinates to fetch weather.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingWeather(true);
    
    try {
      const weather = await getCurrentWeather(parseFloat(location.latitude), parseFloat(location.longitude));
      
      if (weather) {
        setFormData(prev => ({
          ...prev,
          weather_temp: weather.temperature.toString(),
          wind_name: weather.windName,
          wind_direction: weather.windDirection,
          wind_speed: weather.windSpeed.toString(),
          weather_pressure: weather.pressure.toString(),
          moon_phase: weather.moonPhase.toLowerCase().replace(' ', '_'),
        }));
        
        toast({
          title: 'Weather Loaded!',
          description: `Current conditions: ${weather.temperature}°C, ${weather.condition}`,
        });
      } else {
        toast({
          title: 'Weather Unavailable',
          description: 'Could not fetch weather data. Please enter manually.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch weather data.',
        variant: 'destructive',
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.filter(file => file.type.startsWith('image/'));
    
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > 10) {
      toast({
        title: 'Too Many Photos',
        description: 'You can upload a maximum of 10 photos per trip.',
        variant: 'destructive',
      });
      return;
    }

    setPhotos(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const addCatchEntry = () => {
    setCatches([...catches, { 
      id: Date.now().toString(), 
      species: '', 
      fish: [{ id: `${Date.now()}-1`, size: '', weight: '' }] 
    }]);
  };

  const removeCatchEntry = (id: string) => {
    if (catches.length > 1) {
      setCatches(catches.filter(c => c.id !== id));
    }
  };

  const updateCatchSpecies = (catchId: string, species: string) => {
    setCatches(catches.map(c => c.id === catchId ? { ...c, species } : c));
  };

  const addFishToSpecies = (catchId: string) => {
    setCatches(catches.map(c => {
      if (c.id === catchId) {
        return {
          ...c,
          fish: [...c.fish, { id: `${catchId}-${Date.now()}`, size: '', weight: '' }]
        };
      }
      return c;
    }));
  };

  const removeFishFromSpecies = (catchId: string, fishId: string) => {
    setCatches(catches.map(c => {
      if (c.id === catchId) {
        const updatedFish = c.fish.filter(f => f.id !== fishId);
        return { ...c, fish: updatedFish.length > 0 ? updatedFish : [{ id: `${catchId}-new`, size: '', weight: '' }] };
      }
      return c;
    }));
  };

  const updateFishDetails = (catchId: string, fishId: string, field: 'size' | 'weight', value: string) => {
    setCatches(catches.map(c => {
      if (c.id === catchId) {
        return {
          ...c,
          fish: c.fish.map(f => f.id === fishId ? { ...f, [field]: value } : f)
        };
      }
      return c;
    }));
  };

  const handleAddLocation = async () => {
    if (!newLocationData.name || !newLocationData.latitude || !newLocationData.longitude) {
      toast({
        title: 'Missing Information',
        description: 'Please provide location name and coordinates.',
        variant: 'destructive',
      });
      return;
    }

    // Validate DMS format
    if (!isValidDMS(newLocationData.latitude) || !isValidDMS(newLocationData.longitude)) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Please use DD°MM.MMM′N/S format for latitude and DD°MM.MMM′E/W for longitude.',
        variant: 'destructive',
      });
      return;
    }

    // Convert DMS to decimal for storage
    const decimalLat = dmsToDecimal(newLocationData.latitude);
    const decimalLng = dmsToDecimal(newLocationData.longitude);

    if (decimalLat === null || decimalLng === null) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Could not parse coordinates. Please check the format.',
        variant: 'destructive',
      });
      return;
    }

    const newLocation = addLocation({
      name: newLocationData.name,
      latitude: decimalLat.toString(),
      longitude: decimalLng.toString(),
      description: newLocationData.description,
    });

    setLocations(getLocations());
    setFormData({ ...formData, location_id: newLocation.id });
    setShowAddLocationDialog(false);
    setNewLocationData({ name: '', latitude: '', longitude: '', description: '' });
    setSelectedMapLocation(null);

    toast({
      title: 'Location Added',
      description: `${newLocation.name} has been added to your locations.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location_id) {
      toast({
        title: 'Missing Location',
        description: 'Please select a location for this trip.',
        variant: 'destructive',
      });
      return;
    }

    const validCatches = catches.filter(c => c.species.trim() !== '');
    
    if (validCatches.length === 0) {
      toast({
        title: 'No Catches',
        description: 'Please add at least one fish species.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const tripData = {
        ...formData,
        catches: validCatches,
        photos: photos,
      };

      addTrip(tripData);

      toast({
        title: 'Trip Logged!',
        description: 'Your fishing trip has been successfully recorded.',
      });

      navigate('/history');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log trip. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-xl border-ocean-200">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center space-x-2">
              <Fish className="h-8 w-8" />
              <span>Log Fishing Trip</span>
            </CardTitle>
            <CardDescription className="text-ocean-50">
              Record your catch, location, and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trip_date" className="text-ocean-900">Date</Label>
                  <Input
                    id="trip_date"
                    type="date"
                    value={formData.trip_date}
                    onChange={(e) => handleChange('trip_date', e.target.value)}
                    required
                    className="border-ocean-300 focus:border-ocean-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trip_time" className="text-ocean-900">Time</Label>
                  <Input
                    id="trip_time"
                    type="time"
                    value={formData.trip_time}
                    onChange={(e) => handleChange('trip_time', e.target.value)}
                    required
                    className="border-ocean-300 focus:border-ocean-500"
                  />
                </div>
              </div>

              {/* Location with Add New Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location_id" className="text-ocean-900">Location</Label>
                  <Button
                    type="button"
                    onClick={() => setShowAddLocationDialog(true)}
                    variant="outline"
                    size="sm"
                    className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Add New Location
                  </Button>
                </div>
                <Select value={formData.location_id} onValueChange={(value) => handleChange('location_id', value)}>
                  <SelectTrigger className="border-ocean-300 focus:border-ocean-500">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weather Section */}
              <div className="space-y-4 p-4 bg-ocean-50 rounded-lg border border-ocean-200">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-ocean-900 flex items-center space-x-2">
                    <CloudSun className="h-5 w-5" />
                    <span>Weather Conditions</span>
                  </Label>
                  <Button
                    type="button"
                    onClick={handleFetchWeather}
                    disabled={loadingWeather || !formData.location_id}
                    variant="outline"
                    size="sm"
                    className="border-ocean-300 text-ocean-700 hover:bg-ocean-100"
                  >
                    {loadingWeather ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CloudSun className="h-4 w-4 mr-2" />
                        Auto-Fill Weather
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weather_temp" className="text-ocean-900">Temperature (°C)</Label>
                    <Input
                      id="weather_temp"
                      type="number"
                      step="0.1"
                      value={formData.weather_temp}
                      onChange={(e) => handleChange('weather_temp', e.target.value)}
                      placeholder="e.g., 22.5"
                      className="border-ocean-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wind_speed" className="text-ocean-900">Wind Speed (km/h)</Label>
                    <Input
                      id="wind_speed"
                      type="number"
                      step="0.1"
                      value={formData.wind_speed}
                      onChange={(e) => handleChange('wind_speed', e.target.value)}
                      placeholder="e.g., 15"
                      className="border-ocean-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wind_direction" className="text-ocean-900">Wind Direction</Label>
                    <Input
                      id="wind_direction"
                      value={formData.wind_direction}
                      onChange={(e) => handleChange('wind_direction', e.target.value)}
                      placeholder="e.g., NE"
                      className="border-ocean-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weather_pressure" className="text-ocean-900">Pressure (hPa)</Label>
                    <Input
                      id="weather_pressure"
                      type="number"
                      value={formData.weather_pressure}
                      onChange={(e) => handleChange('weather_pressure', e.target.value)}
                      placeholder="e.g., 1013"
                      className="border-ocean-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moon_phase" className="text-ocean-900">Moon Phase</Label>
                    <Select value={formData.moon_phase} onValueChange={(value) => handleChange('moon_phase', value)}>
                      <SelectTrigger className="border-ocean-300">
                        <SelectValue placeholder="Select moon phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_moon">New Moon</SelectItem>
                        <SelectItem value="waxing_crescent">Waxing Crescent</SelectItem>
                        <SelectItem value="first_quarter">First Quarter</SelectItem>
                        <SelectItem value="waxing_gibbous">Waxing Gibbous</SelectItem>
                        <SelectItem value="full_moon">Full Moon</SelectItem>
                        <SelectItem value="waning_gibbous">Waning Gibbous</SelectItem>
                        <SelectItem value="last_quarter">Last Quarter</SelectItem>
                        <SelectItem value="waning_crescent">Waning Crescent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water_conditions" className="text-ocean-900">Water Conditions</Label>
                    <Input
                      id="water_conditions"
                      value={formData.water_conditions}
                      onChange={(e) => handleChange('water_conditions', e.target.value)}
                      placeholder="e.g., Clear, Choppy"
                      className="border-ocean-300"
                    />
                  </div>
                </div>
              </div>

              {/* Catches Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-ocean-900">Catches</Label>
                  <Button
                    type="button"
                    onClick={addCatchEntry}
                    variant="outline"
                    size="sm"
                    className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Species
                  </Button>
                </div>

                {catches.map((catchEntry, catchIndex) => (
                  <div key={catchEntry.id} className="p-4 bg-ocean-50 rounded-lg border border-ocean-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <Label className="text-ocean-900">Species</Label>
                        <Input
                          value={catchEntry.species}
                          onChange={(e) => updateCatchSpecies(catchEntry.id, e.target.value)}
                          placeholder="e.g., Bass, Trout, Salmon"
                          className="border-ocean-300"
                        />
                      </div>
                      {catches.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeCatchEntry(catchEntry.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-ocean-700">Individual Fish</Label>
                        <Button
                          type="button"
                          onClick={() => addFishToSpecies(catchEntry.id)}
                          variant="ghost"
                          size="sm"
                          className="text-ocean-600 hover:text-ocean-700 hover:bg-ocean-100"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Fish
                        </Button>
                      </div>

                      {catchEntry.fish.map((fish, fishIndex) => (
                        <div key={fish.id} className="flex items-center space-x-2">
                          <span className="text-sm text-ocean-600 w-8">#{fishIndex + 1}</span>
                          <Input
                            value={fish.size}
                            onChange={(e) => updateFishDetails(catchEntry.id, fish.id, 'size', e.target.value)}
                            placeholder="Size (cm)"
                            className="flex-1 border-ocean-300"
                          />
                          <Input
                            value={fish.weight}
                            onChange={(e) => updateFishDetails(catchEntry.id, fish.id, 'weight', e.target.value)}
                            placeholder="Weight (kg)"
                            className="flex-1 border-ocean-300"
                          />
                          {catchEntry.fish.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeFishFromSpecies(catchEntry.id, fish.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Photos Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-ocean-900 flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Photos (Max 10)</span>
                </Label>
                
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Upload Photos</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-ocean-600">{photos.length}/10 photos</span>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-ocean-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-ocean-900">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional observations, techniques used, or memorable moments..."
                  rows={4}
                  className="border-ocean-300 focus:border-ocean-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-md"
                >
                  <Fish className="h-5 w-5 mr-2" />
                  Confirm Log Trip
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog with Google Maps */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-ocean-600" />
              <span>Add New Fishing Location</span>
            </DialogTitle>
            <DialogDescription>
              Create a new fishing location. Click on the map, use your current location, or enter coordinates manually in DD°MM.MMM′ format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Interactive Google Map */}
            <div className="space-y-2">
              <Label>Select Location on Map</Label>
              <GoogleMapView
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
                <Label htmlFor="new_location_lat">Latitude (DD°MM.MMM′N/S)</Label>
                <Input
                  id="new_location_lat"
                  value={newLocationData.latitude}
                  onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                  placeholder="e.g., 40°42.768′N"
                  className="border-ocean-300 focus:border-ocean-500 font-mono"
                />
                {newLocationData.latitude && !isValidDMS(newLocationData.latitude) && (
                  <p className="text-xs text-red-600">Invalid format. Use: DD°MM.MMM′N/S</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_location_lng">Longitude (DD°MM.MMM′E/W)</Label>
                <Input
                  id="new_location_lng"
                  value={newLocationData.longitude}
                  onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                  placeholder="e.g., 74°00.360′W"
                  className="border-ocean-300 focus:border-ocean-500 font-mono"
                />
                {newLocationData.longitude && !isValidDMS(newLocationData.longitude) && (
                  <p className="text-xs text-red-600">Invalid format. Use: DD°MM.MMM′E/W</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_location_desc">Description (Optional)</Label>
              <Textarea
                id="new_location_desc"
                value={newLocationData.description}
                onChange={(e) => setNewLocationData({ ...newLocationData, description: e.target.value })}
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
              onClick={() => setShowAddLocationDialog(false)}
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