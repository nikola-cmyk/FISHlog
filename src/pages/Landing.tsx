import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Fish, MapPin, TrendingUp, Calendar } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A4D68] to-[#088395]">
      {/* Hero Section - More Space for Excitement */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/hero-fishing-sunrise.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35
          }}
        />
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8 animate-in fade-in duration-700">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-04/723215e3-2c13-4a6d-858a-9fdd808af0e6.png" 
              alt="Fishbook Logo" 
              className="h-32 w-32 object-contain rounded-2xl shadow-2xl ring-4 ring-white/30 bg-white/10 backdrop-blur-sm p-2"
            />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 drop-shadow-2xl animate-in slide-in-from-bottom duration-700">
            Fishbook
          </h1>
          
          <div className="h-2 w-64 bg-gradient-to-r from-[#05BFDB] to-[#00A9C5] rounded-full mx-auto mb-8 shadow-lg"></div>
          
          <p className="text-2xl md:text-3xl text-white/95 mb-12 drop-shadow-lg font-medium leading-relaxed max-w-3xl mx-auto animate-in fade-in delay-300 duration-700">
            Your intelligent fishing companion. Track catches, discover hotspots, and predict the best times to fish.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in delay-500 duration-700">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#05BFDB] to-[#00A9C5] hover:from-[#00A9C5] hover:to-[#088395] text-white px-10 py-7 text-xl font-bold shadow-2xl hover:shadow-[#05BFDB]/50 transition-all transform hover:scale-105 w-full sm:w-auto border-2 border-white/20"
              >
                Get Started Free
              </Button>
            </Link>
            
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 text-white border-3 border-white/80 hover:border-white px-10 py-7 text-xl font-bold backdrop-blur-md shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-[#0A4D68] mb-6">
            Everything You Need to Fish Smarter
          </h2>
          <div className="h-1.5 w-48 bg-gradient-to-r from-[#05BFDB] to-[#088395] rounded-full mx-auto mb-20"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Feature 1 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-[#05BFDB]/20 to-[#05BFDB]/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-shadow">
                <Fish className="h-10 w-10 text-[#05BFDB]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A4D68] mb-3">
                Track Your Catches
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Log every catch with photos, species, size, and location data
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-[#088395]/20 to-[#088395]/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-shadow">
                <MapPin className="h-10 w-10 text-[#088395]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A4D68] mb-3">
                Save Locations
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Mark your favorite fishing spots and secret hotspots
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-[#0A4D68]/20 to-[#0A4D68]/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-shadow">
                <TrendingUp className="h-10 w-10 text-[#0A4D68]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A4D68] mb-3">
                AI Predictions
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Get smart recommendations for the best fishing times
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-[#05BFDB]/20 to-[#05BFDB]/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-shadow">
                <Calendar className="h-10 w-10 text-[#05BFDB]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A4D68] mb-3">
                Trip History
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Review your fishing history and track your progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 bg-gradient-to-r from-[#0A4D68] to-[#088395] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8">
            Ready to Catch More Fish?
          </h2>
          <p className="text-2xl mb-10 text-white/95 leading-relaxed">
            Join thousands of anglers using Fishbook to improve their fishing game
          </p>
          <Link to="/signup">
            <Button 
              size="lg" 
              className="bg-white text-[#0A4D68] hover:bg-gray-100 px-12 py-7 text-xl font-bold shadow-2xl hover:shadow-white/30 transition-all transform hover:scale-105"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-10 px-6 bg-[#0A4D68] text-white/70 text-center text-lg">
        <p>© 2026 Fishbook. All rights reserved.</p>
      </div>
    </div>
  );
}