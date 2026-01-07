import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database, CheckCircle } from 'lucide-react';
import { migrateLocalStorageToSupabase } from '@/lib/supabase-data';
import { toast } from 'sonner';

export default function MigrationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    // Check if user has localStorage data and hasn't migrated yet
    const hasLocalData = localStorage.getItem('fishing_app_trips') || localStorage.getItem('fishing_app_locations');
    const hasMigrated = localStorage.getItem('fishing_app_migrated');
    
    if (hasLocalData && !hasMigrated) {
      setShowPrompt(true);
    }
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        localStorage.setItem('fishing_app_migrated', 'true');
        setMigrated(true);
        toast.success('Migration complete!', {
          description: result.message,
        });
        setTimeout(() => {
          setShowPrompt(false);
          window.location.reload(); // Refresh to show migrated data
        }, 2000);
      } else {
        toast.error('Migration failed', {
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('fishing_app_migrated', 'skipped');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            {migrated ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
            <div>
              <CardTitle className="text-2xl">
                {migrated ? 'Migration Complete!' : 'Data Migration Available'}
              </CardTitle>
              <CardDescription className="text-ocean-100">
                {migrated ? 'Your data is now safely stored in the cloud' : 'Move your fishing logs to cloud storage'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!migrated ? (
            <>
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  We've detected fishing logs stored locally on your device. Migrate them to cloud storage to:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <Database className="h-4 w-4 mr-2 mt-0.5 text-ocean-600 flex-shrink-0" />
                    <span>Access your data from any device</span>
                  </li>
                  <li className="flex items-start">
                    <Database className="h-4 w-4 mr-2 mt-0.5 text-ocean-600 flex-shrink-0" />
                    <span>Never lose your fishing logs</span>
                  </li>
                  <li className="flex items-start">
                    <Database className="h-4 w-4 mr-2 mt-0.5 text-ocean-600 flex-shrink-0" />
                    <span>Automatic backup and sync</span>
                  </li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleMigrate}
                  disabled={migrating}
                  className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white"
                >
                  {migrating ? 'Migrating...' : 'Migrate Now'}
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  disabled={migrating}
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-gray-700">
                Your fishing logs are now safely stored in the cloud and will be available on all your devices!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}