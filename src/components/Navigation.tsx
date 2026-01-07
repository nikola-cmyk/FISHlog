import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Fish, MapPin, History, TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('fishing_name, full_name')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          // Use full_name if available, otherwise use fishing_name
          setUserName(data.full_name || data.fishing_name || '');
        }
      }
    };

    loadUserProfile();
  }, [user, location]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed Out', {
        description: 'You have been successfully signed out.',
      });
      navigate('/login');
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/log', label: 'New Log', icon: Fish },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/history', label: 'History', icon: History },
    { path: '/best-times', label: 'Best Times', icon: TrendingUp },
  ];

  const displayName = userName ? `${userName}'s FishLog` : 'FishLog';

  return (
    <nav className="bg-gradient-to-r from-[#0A4D68] to-[#088395] shadow-lg sticky top-0 z-50 border-b-2 border-[#05BFDB]/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-04/58ed5bc6-c3b2-4ac5-a2db-1e0fc71b0461.png" 
              alt="FishLog Logo" 
              className="h-10 w-10 object-contain rounded-lg shadow-md"
            />
            <span className="text-white font-bold text-xl hidden sm:block drop-shadow-md">{displayName}</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  variant="ghost"
                  size="sm"
                  className={`text-white font-semibold hover:bg-white/20 hover:text-white transition-all duration-200 ${
                    isActive ? 'bg-white/25 text-white shadow-md' : ''
                  }`}
                >
                  <Icon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
            
            {/* Profile Button */}
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="sm"
              className={`text-white font-semibold hover:bg-white/20 hover:text-white transition-all duration-200 ${
                location.pathname === '/profile' ? 'bg-white/25 text-white shadow-md' : ''
              }`}
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            
            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-white font-semibold hover:bg-red-600/90 hover:text-white transition-all duration-200 ml-2"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}