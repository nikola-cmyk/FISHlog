import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Fish, MapPin, History, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
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

  return (
    <nav className="bg-gradient-to-r from-[#0A4D68] to-[#088395] shadow-lg sticky top-0 z-50 border-b-2 border-[#05BFDB]/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-04/723215e3-2c13-4a6d-858a-9fdd808af0e6.png" 
              alt="Fishbook Logo" 
              className="h-10 w-10 object-contain rounded-lg shadow-md"
            />
            <span className="text-white font-bold text-xl hidden sm:block drop-shadow-md">Fishbook</span>
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