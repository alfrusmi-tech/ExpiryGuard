import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardContent } from '../components/common/Card';

export function Login() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Mock authentication delay (Spring Boot / JWT integration goes here later)
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to the dashboard after "successful" login
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3 mb-8 group">
          <ShieldAlert className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">ExpiryGuard</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
            return to the home page
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200/60">
          <CardContent className="px-4 py-8 sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <Input 
                label="Email address or Username" 
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@expiryguard.local"
              />

              <Input 
                label="Password" 
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full text-base py-2.5" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" /> 
                      Sign in
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Demo Environment</span>
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-slate-500">
                Any credentials will work during this demo phase.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
