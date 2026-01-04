import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Fish, MapPin, TrendingUp, Calendar } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A4D68] to-[#088395]">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/hero-fishing-sunrise.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }}
        />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/assets/logo.jpg" 
              alt="eFISHent Logo" 
              className="h-20 w-20 rounded-full shadow-lg"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            eFISHent Fishlog
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
            Your intelligent fishing companion. Track catches, discover hotspots, and predict the best times to fish.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-[#05BFDB] hover:bg-[#00A9C5] text-white px-8 py-6 text-lg font-semibold shadow-xl w-full sm:w-auto"
              >
                Get Started
              </Button>
            </Link>
            
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white px-8 py-6 text-lg font-semibold backdrop-blur-sm w-full sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0A4D68] mb-16">
            Everything You Need to Fish Smarter
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-[#05BFDB]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fish className="h-8 w-8 text-[#05BFDB]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0A4D68] mb-2">
                Track Your Catches
              </h3>
              <p className="text-gray-600">
                Log every catch with photos, species, size, and location data
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-[#088395]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-[#088395]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0A4D68] mb-2">
                Save Locations
              </h3>
              <p className="text-gray-600">
                Mark your favorite fishing spots and secret hotspots
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-[#0A4D68]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-[#0A4D68]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0A4D68] mb-2">
                AI Predictions
              </h3>
              <p className="text-gray-600">
                Get smart recommendations for the best fishing times
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="bg-[#05BFDB]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-[#05BFDB]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0A4D68] mb-2">
                Trip History
              </h3>
              <p className="text-gray-600">
                Review your fishing history and track your progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-[#0A4D68] to-[#088395] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Catch More Fish?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of anglers using eFISHent to improve their fishing game
          </p>
          <Link to="/signup">
            <Button 
              size="lg" 
              className="bg-white text-[#0A4D68] hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 bg-[#0A4D68] text-white/70 text-center">
        <p>© 2026 eFISHent Fishlog. All rights reserved.</p>
      </div>
    </div>
  );
}