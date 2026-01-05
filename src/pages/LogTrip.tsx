import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTrip, getLocations, addLocation, type Location } from '@/lib/supabase';
import { getCurrentWeather } from '@/lib/weather';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Fish, Plus, X, MapPin, Camera, Upload, CloudSun, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MapView from '@/components/MapView';

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

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY for display
const formatDateForDisplay = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

// Helper function to convert DD/MM/YYYY to YYYY-MM-DD for storage
const formatDateForStorage = (dateStr: string): string => {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

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
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
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
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
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
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > 10) {
      toast({
        title: 'Too Many Photos',
        description: 'You can upload a maximum of 10 photos per trip.',
        variant: 'destructive',
      });
      return;
    }

    // Add new files
    setPhotos(prev => [...prev, ...newFiles]);

    // Create preview URLs
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

  const handleAddLocation = () => {
    if (!newLocationData.name.trim()) {
      toast({
        title: 'Location Name Required',
        description: 'Please enter a location name.',
        variant: 'destructive',
      });
      return;
    }

    const newLocation = addLocation({
      name: newLocationData.name,
      latitude: newLocationData.latitude ? parseFloat(newLocationData.latitude) : undefined,
      longitude: newLocationData.longitude ? parseFloat(newLocationData.longitude) : undefined,
      description: newLocationData.description || undefined,
    });

    setLocations(getLocations());
    setFormData((prev) => ({ ...prev, location_id: newLocation.id }));
    setNewLocationData({ name: '', latitude: '', longitude: '', description: '' });
    setSelectedMapLocation(null);
    setShowAddLocationDialog(false);

    toast({
      title: 'Location Added!',
      description: `${newLocation.name} has been added successfully.`,
    });
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

  const updateFish = (catchId: string, fishId: string, field: keyof IndividualFish, value: string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Calculate totals and create detailed species summary
      let totalQuantity = 0;
      let totalWeight = 0;
      const speciesList: string[] = [];

      catches.forEach(catchEntry => {
        if (!catchEntry.species.trim()) return;

        const validFish = catchEntry.fish.filter(f => f.size || f.weight);
        if (validFish.length === 0) return;

        totalQuantity += validFish.length;

        const fishDetails = validFish.map((f, idx) => {
          const weight = parseFloat(f.weight) || 0;
          totalWeight += weight;
          const details = [];
          if (f.size) details.push(`${f.size}cm`);
          if (f.weight) details.push(`${f.weight}kg`);
          return `#${idx + 1}: ${details.join(', ')}`;
        }).join('; ');

        speciesList.push(`${catchEntry.species} (${validFish.length} fish - ${fishDetails})`);
      });

      if (totalQuantity === 0) {
        toast({
          title: 'No Catch Data',
          description: 'Please add at least one fish with size or weight.',
          variant: 'destructive',
        });
        return;
      }

      // Date is already in YYYY-MM-DD format from the date input
      const storageDate = formData.trip_date;

      // Calculate average size from first species first fish (for backward compatibility)
      const firstFish = catches[0]?.fish[0];
      const avgSize = firstFish?.size ? parseFloat(firstFish.size) : undefined;

      // Combine wind speed for backward compatibility (store in weather_wind field)
      const windSpeed = formData.wind_speed ? parseFloat(formData.wind_speed) : undefined;

      addTrip({
        location_id: formData.location_id || undefined,
        trip_date: storageDate,
        trip_time: formData.trip_time,
        weather_temp: formData.weather_temp ? parseFloat(formData.weather_temp) : undefined,
        weather_wind: windSpeed,
        weather_pressure: formData.weather_pressure ? parseFloat(formData.weather_pressure) : undefined,
        moon_phase: formData.moon_phase || undefined,
        catch_species: speciesList.join(' | '),
        catch_quantity: totalQuantity,
        catch_size: avgSize,
        catch_weight: totalWeight > 0 ? totalWeight : undefined,
        water_conditions: formData.water_conditions || undefined,
        notes: formData.notes || undefined,
      });

      toast({
        title: 'Trip Logged Successfully!',
        description: `Logged ${totalQuantity} fish with ${photos.length} photo${photos.length !== 1 ? 's' : ''}.`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log trip. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/95 backdrop-blur border-ocean-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Log Fishing Trip</CardTitle>
            <CardDescription className="text-ocean-100">Record each catch with detailed measurements and photos</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="border-2 border-dashed border-ocean-300 rounded-lg p-6 bg-ocean-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ocean-900 flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Trip Photos
                    </h3>
                    <p className="text-sm text-ocean-600">Upload up to 10 photos of your catches (optional)</p>
                  </div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Add Photos</span>
                    </div>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </Label>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Catch photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-ocean-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photoPreviews.length === 0 && (
                  <div className="text-center py-8 text-ocean-400">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No photos uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trip_date" className="text-ocean-900">Date *</Label>
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
                  <Label htmlFor="trip_time" className="text-ocean-900">Time *</Label>
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
                {locations.length === 0 && (
                  <p className="text-sm text-ocean-600">
                    No locations yet. Click "Add New Location" above to create one.
                  </p>
                )}
              </div>

              {/* Catch Details - Detailed Individual Entries */}
              <div className="border-t border-ocean-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ocean-900">Catch Details</h3>
                    <p className="text-sm text-ocean-600">Add each fish individually with its measurements</p>
                  </div>
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
                
                <div className="space-y-6">
                  {catches.map((catchEntry, speciesIndex) => (
                    <div key={catchEntry.id} className="bg-ocean-50 p-4 rounded-lg border-2 border-ocean-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Label htmlFor={`species-${catchEntry.id}`} className="text-ocean-900 font-semibold">
                            Species #{speciesIndex + 1}
                          </Label>
                          <Input
                            id={`species-${catchEntry.id}`}
                            value={catchEntry.species}
                            onChange={(e) => updateCatchSpecies(catchEntry.id, e.target.value)}
                            placeholder="e.g., Bass, Trout, Pike"
                            className="mt-2 border-ocean-300 focus:border-ocean-500"
                          />
                        </div>
                        {catches.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeCatchEntry(catchEntry.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-ocean-700">Individual Fish</Label>
                          <Button
                            type="button"
                            onClick={() => addFishToSpecies(catchEntry.id)}
                            variant="outline"
                            size="sm"
                            className="border-ocean-300 text-ocean-600 hover:bg-ocean-50 h-8"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Fish
                          </Button>
                        </div>

                        {catchEntry.fish.map((fish, fishIndex) => (
                          <div key={fish.id} className="bg-white p-3 rounded border border-ocean-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-ocean-600">Fish #{fishIndex + 1}</span>
                              {catchEntry.fish.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeFishFromSpecies(catchEntry.id, fish.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`size-${fish.id}`} className="text-xs text-ocean-700">Size (cm)</Label>
                                <Input
                                  id={`size-${fish.id}`}
                                  type="number"
                                  step="0.1"
                                  value={fish.size}
                                  onChange={(e) => updateFish(catchEntry.id, fish.id, 'size', e.target.value)}
                                  placeholder="e.g., 32"
                                  className="border-ocean-300 focus:border-ocean-500 h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`weight-${fish.id}`} className="text-xs text-ocean-700">Weight (kg)</Label>
                                <Input
                                  id={`weight-${fish.id}`}
                                  type="number"
                                  step="0.01"
                                  value={fish.weight}
                                  onChange={(e) => updateFish(catchEntry.id, fish.id, 'weight', e.target.value)}
                                  placeholder="e.g., 1.5"
                                  className="border-ocean-300 focus:border-ocean-500 h-9"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="border-t border-ocean-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ocean-900">Weather Conditions</h3>
                  <Button
                    type="button"
                    onClick={handleFetchWeather}
                    disabled={loadingWeather || !formData.location_id}
                    variant="outline"
                    size="sm"
                    className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                  >
                    {loadingWeather ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CloudSun className="h-4 w-4 mr-2" />
                    )}
                    Auto-Fill Weather
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weather_temp" className="text-ocean-900">Temperature (°C)</Label>
                    <Input
                      id="weather_temp"
                      type="number"
                      step="0.1"
                      value={formData.weather_temp}
                      onChange={(e) => handleChange('weather_temp', e.target.value)}
                      placeholder="e.g., 22"
                      className="border-ocean-300 focus:border-ocean-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weather_pressure" className="text-ocean-900">Pressure (hPa)</Label>
                    <Input
                      id="weather_pressure"
                      type="number"
                      step="0.1"
                      value={formData.weather_pressure}
                      onChange={(e) => handleChange('weather_pressure', e.target.value)}
                      placeholder="e.g., 1013"
                      className="border-ocean-300 focus:border-ocean-500"
                    />
                  </div>
                </div>
                
                {/* Wind Information */}
                <div className="mt-4">
                  <Label className="text-ocean-900 mb-2 block">Wind Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wind_name" className="text-sm text-ocean-700">Wind Name</Label>
                      <Input
                        id="wind_name"
                        value={formData.wind_name}
                        onChange={(e) => handleChange('wind_name', e.target.value)}
                        placeholder="e.g., Northerly"
                        className="border-ocean-300 focus:border-ocean-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind_direction" className="text-sm text-ocean-700">Direction</Label>
                      <Select value={formData.wind_direction} onValueChange={(value) => handleChange('wind_direction', value)}>
                        <SelectTrigger className="border-ocean-300 focus:border-ocean-500">
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N">N (North)</SelectItem>
                          <SelectItem value="NE">NE (Northeast)</SelectItem>
                          <SelectItem value="E">E (East)</SelectItem>
                          <SelectItem value="SE">SE (Southeast)</SelectItem>
                          <SelectItem value="S">S (South)</SelectItem>
                          <SelectItem value="SW">SW (Southwest)</SelectItem>
                          <SelectItem value="W">W (West)</SelectItem>
                          <SelectItem value="NW">NW (Northwest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind_speed" className="text-sm text-ocean-700">Speed (km/h)</Label>
                      <Input
                        id="wind_speed"
                        type="number"
                        step="0.1"
                        value={formData.wind_speed}
                        onChange={(e) => handleChange('wind_speed', e.target.value)}
                        placeholder="e.g., 8"
                        className="border-ocean-300 focus:border-ocean-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t border-ocean-200 pt-4">
                <h3 className="text-lg font-semibold text-ocean-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="moon_phase" className="text-ocean-900">Moon Phase</Label>
                    <Select value={formData.moon_phase} onValueChange={(value) => handleChange('moon_phase', value)}>
                      <SelectTrigger className="border-ocean-300 focus:border-ocean-500">
                        <SelectValue placeholder="Select moon phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Moon</SelectItem>
                        <SelectItem value="waxing_crescent">Waxing Crescent</SelectItem>
                        <SelectItem value="first_quarter">First Quarter</SelectItem>
                        <SelectItem value="waxing_gibbous">Waxing Gibbous</SelectItem>
                        <SelectItem value="full">Full Moon</SelectItem>
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
                      placeholder="e.g., Clear, Murky, Choppy"
                      className="border-ocean-300 focus:border-ocean-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-ocean-900">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Any additional observations or details..."
                      rows={4}
                      className="border-ocean-300 focus:border-ocean-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button - Matching "New Log" button style */}
              <div className="flex space-x-4 pt-4 border-t border-ocean-200">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold py-3 shadow-lg"
                >
                  <Fish className="h-5 w-5 mr-2" />
                  Save Trip
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog with Map */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-ocean-600" />
              <span>Add New Fishing Location</span>
            </DialogTitle>
            <DialogDescription>
              Create a new fishing location. Click on the map, use your current location, or enter coordinates manually.
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
                setShowAddLocationDialog(false);
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
              className="bg-gradient-to-r from-[#05BFDB] to-[#088395] hover:from-[#00A9C5] hover:to-[#0A4D68] text-white font-semibold"
            >
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}