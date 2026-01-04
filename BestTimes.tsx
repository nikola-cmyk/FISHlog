import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function BestTimes() {
  const [predictions] = useState([
    {
      id: '1',
      date: '2026-01-05',
      time: '06:00 - 09:00',
      score: 95,
      conditions: 'Optimal moon phase, perfect temperature',
    },
    {
      id: '2',
      date: '2026-01-06',
      time: '17:00 - 20:00',
      score: 88,
      conditions: 'Good water conditions, favorable wind',
    },
    {
      id: '3',
      date: '2026-01-07',
      time: '05:30 - 08:30',
      score: 82,
      conditions: 'Rising barometric pressure',
    },
  ]);

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
                  Best times to fish based on weather, moon phases, and historical data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="border-2 border-ocean-200 hover:border-ocean-400 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2 text-ocean-700">
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold">
                              {new Date(prediction.date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-ocean-600">
                            <Clock className="h-4 w-4" />
                            <span>{prediction.time}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-ocean-600" />
                            <span className="text-sm font-medium text-ocean-700">Success Score</span>
                          </div>
                          <div className="w-full bg-ocean-100 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-ocean-500 to-ocean-600 h-3 rounded-full transition-all"
                              style={{ width: `${prediction.score}%` }}
                            />
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-2xl font-bold text-ocean-900">{prediction.score}%</span>
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

            <div className="mt-6 p-4 bg-ocean-50 rounded-lg border border-ocean-200">
              <p className="text-sm text-ocean-700">
                <strong>Note:</strong> These predictions are based on AI analysis of weather patterns, moon phases,
                and your historical catch data. Log more trips to improve prediction accuracy!
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button className="bg-ocean-600 hover:bg-ocean-700 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh Predictions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}