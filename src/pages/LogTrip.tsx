import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTrip, getLocations, addLocation, getUniqueSpecies, type Location } from '@/lib/supabase-data';
import { getCurrentWeather } from '@/lib/weather';
import { decimalToDMS, dmsToDecimal, isValidDMS } from '@/lib/coordinate-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Fish, Plus, X, MapPin, Camera, Upload, CloudSun, Loader2, Locate } from 'lucide-react';
import Navigation from '@/components/Navigation';
import GoogleMapView from '@/components/GoogleMapView';
import { toast } from 'sonner';

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [previousSpecies, setPreviousSpecies] = useState<string[]>([]);
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
    loadLocations();
    loadPreviousSpecies();
  }, []);

  const loadLocations = async () => {
    const locs = await getLocations();
    setLocations(locs);
  };

  const loadPreviousSpecies = async () => {
    const species = await getUniqueSpecies();
    setPreviousSpecies(species);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedMapLocation({ lat, lng });
    setNewLocationData({
      ...newLocationData,
      latitude: decimalToDMS(lat, false),
      longitude: decimalToDMS(lng, true),
    });
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
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
      toast.error('Location Required', {
        description: 'Please select a location with GPS coordinates to fetch weather.',
      });
      return;
    }

    setLoadingWeather(true);
    try {
      const weather = await getCurrentWeather(location.latitude, location.longitude);
      
      if (weather) {
        setFormData(prev => ({
          ...prev,
          weather_temp: weather.temperature.toFixed(1),
          wind_speed: weather.windSpeed.toFixed(1),
          wind_direction: weather.windDirection,
          weather_pressure: weather.pressure.toFixed(1),
          moon_phase: weather.moonPhase.toLowerCase().replace(' ', '_'),
        }));
        
        toast.success('Weather Loaded!', {
          description: `Current conditions: ${weather.temperature}°C, ${weather.condition}`,
        });
      } else {
        toast.error('Weather Unavailable', {
          description: 'Could not fetch weather data. Please enter manually.',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to fetch weather data.',
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > 10) {
      toast.error('Too Many Photos', {
        description: 'You can upload a maximum of 10 photos per trip.',
      });
      return;
    }

    setPhotos(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLocation = async () => {
    if (!newLocationData.name.trim()) {
      toast.error('Location Name Required', {
        description: 'Please enter a location name.',
      });
      return;
    }

    // Parse coordinates
    const latDecimal = dmsToDecimal(newLocationData.latitude);
    const lngDecimal = dmsToDecimal(newLocationData.longitude);

    if (newLocationData.latitude && !latDecimal) {
      toast.error('Invalid Latitude', {
        description: 'Please use format: DD°MM.MMM′N/S (e.g., 40°42.768′N)',
      });
      return;
    }

    if (newLocationData.longitude && !lngDecimal) {
      toast.error('Invalid Longitude', {
        description: 'Please use format: DD°MM.MMM′E/W (e.g., 74°00.360′W)',
      });
      return;
    }

    const newLocation = await addLocation({
      name: newLocationData.name,
      latitude: latDecimal || undefined,
      longitude: lngDecimal || undefined,
      description: newLocationData.description || undefined,
    });

    if (newLocation) {
      await loadLocations();
      setFormData((prev) => ({ ...prev, location_id: newLocation.id }));
      setNewLocationData({ name: '', latitude: '', longitude: '', description: '' });
      setSelectedMapLocation(null);
      setShowAddLocationDialog(false);

      toast.success('Location Added!', {
        description: `${newLocation.name} has been added successfully.`,
      });
    } else {
      toast.error('Error', {
        description: 'Failed to add location. Please try again.',
      });
    }
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
      if (c.id === catchId && c.fish.length > 1) {
        return {
          ...c,
          fish: c.fish.filter(f => f.id !== fishId)
        };
      }
      return c;
    }));
  };

  const updateFish = (catchId: string, fishId: string, field: 'size' | 'weight', value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location_id) {
      toast.error('Location Required', {
        description: 'Please select a fishing location.',
      });
      return;
    }

    // Calculate totals
    let totalCatch = 0;
    let totalSize = 0;
    let totalWeight = 0;
    const speciesList: string[] = [];

    catches.forEach(catchEntry => {
      if (catchEntry.species.trim()) {
        speciesList.push(catchEntry.species.trim());
        catchEntry.fish.forEach(fish => {
          totalCatch++;
          if (fish.size) totalSize += parseFloat(fish.size);
          if (fish.weight) totalWeight += parseFloat(fish.weight);
        });
      }
    });

    const avgSize = totalCatch > 0 ? totalSize / totalCatch : 0;
    const avgWeight = totalCatch > 0 ? totalWeight / totalCatch : 0;

    const tripData = {
      location_id: formData.location_id,
      trip_date: formData.trip_date,
      trip_time: formData.trip_time,
      weather_temp: formData.weather_temp ? parseFloat(formData.weather_temp) : undefined,
      weather_wind: formData.wind_speed ? parseFloat(formData.wind_speed) : undefined,
      weather_pressure: formData.weather_pressure ? parseFloat(formData.weather_pressure) : undefined,
      moon_phase: formData.moon_phase || undefined,
      catch_species: speciesList.join(', '),
      catch_quantity: totalCatch,
      catch_size: avgSize > 0 ? avgSize : undefined,
      catch_weight: avgWeight > 0 ? avgWeight : undefined,
      water_conditions: formData.water_conditions || undefined,
      notes: formData.notes || undefined,
    };

    const newTrip = await addTrip(tripData);

    if (newTrip) {
      toast.success('Trip Logged!', {
        description: `Successfully logged ${totalCatch} fish catch.`,
      });
      navigate('/history');
    } else {
      toast.error('Error', {
        description: 'Failed to log trip. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto border-ocean-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Fish className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl font-bold">Log Fishing Trip</CardTitle>
                <CardDescription className="text-ocean-100">Record your catch and conditions</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-ocean-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </Label>
                
                <div className="flex gap-2">
                  <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })}>
                    <SelectTrigger className="flex-1 border-ocean-300">
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
                  
                  <Button
                    type="button"
                    onClick={() => setShowAddLocationDialog(true)}
                    className="bg-ocean-600 hover:bg-ocean-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trip_date" className="text-ocean-900">Date</Label>
                  <Input
                    id="trip_date"
                    type="date"
                    value={formData.trip_date}
                    onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                    required
                    className="border-ocean-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trip_time" className="text-ocean-900">Time</Label>
                  <Input
                    id="trip_time"
                    type="time"
                    value={formData.trip_time}
                    onChange={(e) => setFormData({ ...formData, trip_time: e.target.value })}
                    required
                    className="border-ocean-300"
                  />
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-ocean-900 flex items-center gap-2">
                    <CloudSun className="h-5 w-5" />
                    Weather Conditions
                  </Label>
                  <Button
                    type="button"
                    onClick={handleFetchWeather}
                    disabled={loadingWeather || !formData.location_id}
                    variant="outline"
                    size="sm"
                    className="border-ocean-300"
                  >
                    {loadingWeather ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CloudSun className="h-4 w-4 mr-1" />
                        Fetch Weather
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
                      onChange={(e) => setFormData({ ...formData, weather_temp: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, wind_speed: e.target.value })}
                      placeholder="e.g., 15.5"
                      className="border-ocean-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weather_pressure" className="text-ocean-900">Pressure (hPa)</Label>
                    <Input
                      id="weather_pressure"
                      type="number"
                      step="0.1"
                      value={formData.weather_pressure}
                      onChange={(e) => setFormData({ ...formData, weather_pressure: e.target.value })}
                      placeholder="e.g., 1013.2"
                      className="border-ocean-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moon_phase" className="text-ocean-900">Moon Phase</Label>
                    <Select value={formData.moon_phase} onValueChange={(value) => setFormData({ ...formData, moon_phase: value })}>
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
                      onChange={(e) => setFormData({ ...formData, water_conditions: e.target.value })}
                      placeholder="e.g., Clear, Murky, Choppy"
                      className="border-ocean-300"
                    />
                  </div>
                </div>
              </div>

              {/* Catch Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-ocean-900 flex items-center gap-2">
                    <Fish className="h-5 w-5" />
                    Catch Details
                  </Label>
                  <Button
                    type="button"
                    onClick={addCatchEntry}
                    variant="outline"
                    size="sm"
                    className="border-ocean-300"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Species
                  </Button>
                </div>

                {catches.map((catchEntry, catchIndex) => (
                  <Card key={catchEntry.id} className="border-ocean-200">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <Label className="text-ocean-900">Species {catchIndex + 1}</Label>
                          
                          {previousSpecies.length > 0 && (
                            <Select
                              value={catchEntry.species}
                              onValueChange={(value) => {
                                if (value === '__new__') {
                                  updateCatchSpecies(catchEntry.id, '');
                                } else {
                                  updateCatchSpecies(catchEntry.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="border-ocean-300 mb-2">
                                <SelectValue placeholder="Select from previous catches" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__new__">+ Type New Species</SelectItem>
                                {previousSpecies.map((species) => (
                                  <SelectItem key={species} value={species}>
                                    {species}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          <Input
                            value={catchEntry.species}
                            onChange={(e) => updateCatchSpecies(catchEntry.id, e.target.value)}
                            placeholder="e.g., Bass, Trout, Pike"
                            className="border-ocean-300"
                          />
                        </div>
                        
                        {catches.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeCatchEntry(catchEntry.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {catchEntry.fish.map((fish, fishIndex) => (
                        <div key={fish.id} className="flex items-center gap-2 pl-4 border-l-2 border-ocean-300">
                          <span className="text-sm text-ocean-600 w-16">Fish {fishIndex + 1}</span>
                          <Input
                            type="number"
                            step="0.1"
                            value={fish.size}
                            onChange={(e) => updateFish(catchEntry.id, fish.id, 'size', e.target.value)}
                            placeholder="Size (cm)"
                            className="flex-1 border-ocean-300"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={fish.weight}
                            onChange={(e) => updateFish(catchEntry.id, fish.id, 'weight', e.target.value)}
                            placeholder="Weight (kg)"
                            className="flex-1 border-ocean-300"
                          />
                          {catchEntry.fish.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeFishFromSpecies(catchEntry.id, fish.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        onClick={() => addFishToSpecies(catchEntry.id)}
                        variant="outline"
                        size="sm"
                        className="ml-4 border-ocean-300"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Fish
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-ocean-900 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos (Optional)
                </Label>
                
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-ocean-100 hover:bg-ocean-200 text-ocean-900 rounded-lg border-2 border-ocean-300 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Upload Photos</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
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
                          className="w-full h-32 object-cover rounded-lg border-2 border-ocean-300"
                        />
                        <Button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional observations, techniques used, or memorable moments..."
                  rows={4}
                  className="border-ocean-300"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1 border-ocean-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold shadow-lg"
                >
                  <Fish className="h-4 w-4 mr-2" />
                  Log Trip
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-ocean-900">Add New Location</DialogTitle>
            <DialogDescription>
              Add a new fishing location with GPS coordinates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location_name" className="text-ocean-900">Location Name *</Label>
              <Input
                id="location_name"
                value={newLocationData.name}
                onChange={(e) => setNewLocationData({ ...newLocationData, name: e.target.value })}
                placeholder="e.g., Lake Michigan North Shore"
                className="border-ocean-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-ocean-900">Coordinates (DD°MM.MMM′ format)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm text-ocean-700">
                    Latitude (e.g., 40°42.768′N)
                  </Label>
                  <Input
                    id="latitude"
                    value={newLocationData.latitude}
                    onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                    placeholder="40°42.768′N"
                    className="border-ocean-300 font-mono"
                  />
                  {newLocationData.latitude && !isValidDMS(newLocationData.latitude) && (
                    <p className="text-xs text-red-600">Invalid format. Use: DD°MM.MMM′N/S</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm text-ocean-700">
                    Longitude (e.g., 74°00.360′W)
                  </Label>
                  <Input
                    id="longitude"
                    value={newLocationData.longitude}
                    onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                    placeholder="74°00.360′W"
                    className="border-ocean-300 font-mono"
                  />
                  {newLocationData.longitude && !isValidDMS(newLocationData.longitude) && (
                    <p className="text-xs text-red-600">Invalid format. Use: DD°MM.MMM′E/W</p>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleUseCurrentLocation}
                variant="outline"
                size="sm"
                className="border-ocean-300"
              >
                <Locate className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-ocean-900">Map</Label>
              <GoogleMapView
                locations={[]}
                selectedLocation={selectedMapLocation}
                onLocationSelect={handleMapClick}
                allowClickToAdd={true}
                showUserLocation={true}
                height="400px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-ocean-900">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newLocationData.description}
                onChange={(e) => setNewLocationData({ ...newLocationData, description: e.target.value })}
                placeholder="Any notes about this location..."
                rows={3}
                className="border-ocean-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddLocationDialog(false);
                setNewLocationData({ name: '', latitude: '', longitude: '', description: '' });
                setSelectedMapLocation(null);
              }}
              className="border-ocean-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddLocation}
              className="bg-ocean-600 hover:bg-ocean-700"
            >
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}