import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 to-ocean-100 p-4">
      <Card className="w-full max-w-md border-ocean-200 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/843310/2026-01-04/58ed5bc6-c3b2-4ac5-a2db-1e0fc71b0461.png" 
              alt="FishLog Logo" 
              className="h-20 w-20 object-contain rounded-lg shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-ocean-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Welcome Back
          </CardTitle>
          <CardDescription className="text-ocean-600">Sign in to your FishLog account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-ocean-900">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-ocean-300 focus:border-ocean-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-ocean-900">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-ocean-300 focus:border-ocean-500"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold shadow-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm space-y-2">
              <Link to="/reset-password" className="text-ocean-600 hover:text-ocean-700 hover:underline">
                Forgot password?
              </Link>
              <div className="text-ocean-700">
                Don't have an account?{' '}
                <Link to="/signup" className="text-ocean-600 hover:text-ocean-700 hover:underline font-semibold">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}