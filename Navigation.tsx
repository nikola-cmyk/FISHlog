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
    <nav className="bg-gradient-to-r from-ocean-700 to-ocean-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-04/c5e14ed8-0a42-42e2-bb5d-c011a6ea4dc6.png" 
              alt="eFISHent Fishlog Logo" 
              className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="text-white font-bold text-xl hidden sm:block">eFISHent Fishlog</span>
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
                  className={`text-white hover:bg-ocean-600 transition-colors ${
                    isActive ? 'bg-ocean-600' : ''
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
              className="text-white hover:bg-red-600 transition-colors ml-2"
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