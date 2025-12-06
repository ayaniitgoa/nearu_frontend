'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Building2, LogIn, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [userType, setUserType] = useState('learner');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'learner' || type === 'institution') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        setUser(data.user);
        
        const userMetadata = data.user.user_metadata || {};
        const userTypeFromMeta = userMetadata.user_type || 'learner';
        
        // If user selected institution but metadata says learner, update metadata
        if (userType === 'institution' && userTypeFromMeta !== 'institution') {
          try {
            // Update user metadata to institution
            const { error: updateError } = await supabase.auth.updateUser({
              data: { user_type: 'institution' }
            });
            if (!updateError) {
              // Refresh user data
              const { data: { user: updatedUser } } = await supabase.auth.getUser();
              if (updatedUser) setUser(updatedUser);
              router.push('/dashboard');
              return;
            }
          } catch (updateErr) {
            console.error('Error updating user type:', updateErr);
          }
        }
        
        // If user selected learner but metadata says institution, update metadata
        if (userType === 'learner' && userTypeFromMeta === 'institution') {
          try {
            // Update user metadata to learner
            const { error: updateError } = await supabase.auth.updateUser({
              data: { user_type: 'learner' }
            });
            if (!updateError) {
              // Refresh user data
              const { data: { user: updatedUser } } = await supabase.auth.getUser();
              if (updatedUser) setUser(updatedUser);
              router.push('/home');
              return;
            }
          } catch (updateErr) {
            console.error('Error updating user type:', updateErr);
          }
        }
        
        // Default routing based on metadata
        if (userTypeFromMeta === 'institution') {
          router.push('/dashboard');
        } else {
          router.push('/home');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative bg-gradient-to-br from-[#970747]/5 to-white">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#970747]/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#970747]/5 rounded-full blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md relative z-10"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative h-24 w-24 flex items-center justify-center">
              <img 
                src="/images/logo.svg" 
                alt="NearU Logo" 
                className="h-24 w-24 object-contain"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(151, 7, 71, 0.2))'
                  }}
              />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">NearU</h1>
          </div>
          
          {/* Illustration */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-lg relative">
              <img 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=800&fit=crop&q=80" 
                alt="Welcome back" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#970747]/20 to-transparent"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover local tutors, coaches, and activities — all in one place.
          </h2>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <img 
                src="/images/logo.svg" 
                alt="NearU Logo" 
                className="h-12 w-12 object-contain"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(151, 7, 71, 0.2))'
                  }}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">NearU</h1>
          </div>

          {/* User Type Selector */}
          <div className="mb-8 flex gap-3 bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setUserType('learner')}
              disabled={loading}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                userType === 'learner'
                  ? 'bg-white text-[#970747] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="h-4 w-4 inline-block mr-2" />
              Learner
            </button>
            <button
              type="button"
              onClick={() => setUserType('institution')}
              disabled={loading}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                userType === 'institution'
                  ? 'bg-white text-[#970747] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-4 w-4 inline-block mr-2" />
              Institution
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold mt-6"
              disabled={loading}
              style={{
                background: '#970747'
              }}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href={`/register?type=${userType}`}
                className="text-[#970747] hover:text-[#970747]/80 font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#970747] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
