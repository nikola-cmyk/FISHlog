import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import LogTrip from './pages/LogTrip';
import History from './pages/History';
import Locations from './pages/Locations';
import BestTimes from './pages/BestTimes';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Redirect root and login to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
          
          {/* Main app routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log-trip" element={<LogTrip />} />
          <Route path="/history" element={<History />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/best-times" element={<BestTimes />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;