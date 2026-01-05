import { useState, useEffect, useCallback } from 'react';
import { getLocations, type Location } from '@/lib/supabase';
import { getFishingPredictions, type FishingPrediction } from '@/lib/weather';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, TrendingUp, Calendar, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

export default function BestTimes() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [predictions, setPredictions] = useState<FishingPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadPredictions = useCallback(async (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    
    if (!location || !location.latitude || !location.longitude) {
      setError('Please select a location with GPS coordinates');
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const preds = await getFishingPredictions(location.latitude, location.longitude);
      
      if (preds.length === 0) {
        setError('Unable to fetch weather predictions. Please try again later.');
      } else {
        setPredictions(preds);
        toast({
          title: 'Predictions Updated!',
          description: `Loaded ${preds.length} fishing predictions for ${location.name}`,
        });
      }
    } catch (err) {
      setError('Failed to load predictions. Please check your internet connection.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  }, [locations, toast]);

  useEffect(() => {
    const locs = getLocations();
    setLocations(locs);
    
    // Auto-select first location with coordinates
    const firstValidLocation = locs.find(loc => loc.latitude && loc.longitude);
    if (firstValidLocation) {
      setSelectedLocation(firstValidLocation.id);
      loadPredictions(firstValidLocation.id);
    }
  }, [loadPredictions]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    loadPredictions(locationId);
  };

  const handleRefresh = () => {
    if (selectedLocation) {
      loadPredictions(selectedLocation);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-ocean-500 to-ocean-600';
    return 'from-yellow-500 to-yellow-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/95 backdrop-blur border-ocean-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">AI Fishing Predictions</CardTitle>
                <CardDescription className="text-ocean-100">
                  Best times to fish based on real weather forecasts and moon phases
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Location Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-ocean-900 mb-2">
                Select Location
              </label>
              <div className="flex gap-3">
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="flex-1 border-ocean-300 focus:border-ocean-500">
                    <SelectValue placeholder="Choose a fishing location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {location.name}
                          {(!location.latitude || !location.longitude) && (
                            <span className="ml-2 text-xs text-red-500">(No GPS)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleRefresh}
                  disabled={loading || !selectedLocation}
                  className="bg-ocean-600 hover:bg-ocean-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Unable to load predictions</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* No Locations Message */}
            {locations.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-ocean-300" />
                <p className="text-ocean-600 text-lg mb-2">No locations found</p>
                <p className="text-ocean-500 text-sm">Add a location with GPS coordinates to see predictions</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto mb-4 text-ocean-600 animate-spin" />
                <p className="text-ocean-600">Loading weather predictions...</p>
              </div>
            )}

            {/* Predictions List */}
            {!loading && predictions.length > 0 && (
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <Card key={index} className="border-2 border-ocean-200 hover:border-ocean-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2 text-ocean-700">
                              <Calendar className="h-5 w-5" />
                              <span className="font-semibold">{formatDate(prediction.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-ocean-600">
                              <Clock className="h-4 w-4" />
                              <span>{prediction.timeWindow}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-ocean-600" />
                                <span className="text-sm font-medium text-ocean-700">Success Score</span>
                              </div>
                              <span className={`text-sm font-semibold ${
                                prediction.score >= 80 ? 'text-green-600' :
                                prediction.score >= 60 ? 'text-ocean-600' :
                                'text-yellow-600'
                              }`}>
                                {getScoreLabel(prediction.score)}
                              </span>
                            </div>
                            <div className="w-full bg-ocean-100 rounded-full h-3">
                              <div
                                className={`bg-gradient-to-r ${getScoreColor(prediction.score)} h-3 rounded-full transition-all`}
                                style={{ width: `${prediction.score}%` }}
                              />
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-2xl font-bold text-ocean-900">{prediction.score}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-ocean-50 p-3 rounded-lg">
                              <div className="text-xs text-ocean-600 mb-1">Temperature</div>
                              <div className="text-sm font-semibold text-ocean-900">{prediction.temperature.toFixed(1)}°C</div>
                            </div>
                            <div className="bg-ocean-50 p-3 rounded-lg">
                              <div className="text-xs text-ocean-600 mb-1">Moon Phase</div>
                              <div className="text-sm font-semibold text-ocean-900">{prediction.moonPhase}</div>
                            </div>
                          </div>

                          <div className="bg-ocean-50 p-3 rounded-lg border border-ocean-200">
                            <div className="text-xs text-ocean-600 mb-1">Conditions</div>
                            <div className="text-sm text-ocean-800">{prediction.conditions}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Info Note */}
            {!loading && predictions.length > 0 && (
              <div className="mt-6 p-4 bg-ocean-50 rounded-lg border border-ocean-200">
                <p className="text-sm text-ocean-700">
                  <strong>Note:</strong> These predictions are based on real-time weather forecasts, moon phases,
                  and optimal fishing conditions. Predictions are updated when you refresh or change location.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}