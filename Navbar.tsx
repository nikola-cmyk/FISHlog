import { BarChart3, MapPin, Calendar, Fish, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/log', icon: Fish, label: 'Log Trip' },
    { path: '/history', icon: Calendar, label: 'History' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-ocean-900 to-ocean-800 border-b border-ocean-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-03/9479ec96-d4d7-496c-b897-530d6d651891.png" 
              alt="eFISHent Fishlog Logo" 
              className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="text-xl font-bold text-white">eFISHent Fishlog</span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-ocean-700 text-white'
                      : 'text-ocean-200 hover:bg-ocean-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </Link>
              );
            })}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-2 text-ocean-200 hover:bg-ocean-800 hover:text-white">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-xs text-gray-500">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-xs text-gray-500">
                    Plan: Free (All features unlocked)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}