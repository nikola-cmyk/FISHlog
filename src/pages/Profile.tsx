import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fishingName, setFishingName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setFishingName(profile.fishing_name);
    }
  }, []);

  const handleSave = () => {
    if (!fishingName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your fishing name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    updateUserProfile(fishingName.trim());
    
    toast({
      title: 'Success',
      description: 'Your fishing name has been updated!',
    });
    
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur border-ocean-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Profile Settings</CardTitle>
                <CardDescription className="text-ocean-100">
                  Personalize your FishLog experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fishingName" className="text-lg font-semibold text-ocean-900">
                Your Fishing Name
              </Label>
              <p className="text-sm text-ocean-600 mb-3">
                This name will appear throughout the app (e.g., "JOHN'S FishLog")
              </p>
              <Input
                id="fishingName"
                type="text"
                placeholder="Enter your fishing name (e.g., John, Captain Mike, etc.)"
                value={fishingName}
                onChange={(e) => setFishingName(e.target.value)}
                className="text-lg border-ocean-300 focus:border-ocean-500"
                maxLength={30}
              />
              <p className="text-xs text-ocean-500 mt-1">
                {fishingName.length}/30 characters
              </p>
            </div>

            {fishingName && (
              <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4">
                <p className="text-sm text-ocean-600 mb-2">Preview:</p>
                <p className="text-2xl font-bold text-ocean-900">
                  {fishingName.toUpperCase()}'S FishLog
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading || !fishingName.trim()}
                className="flex-1 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold shadow-lg"
              >
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}