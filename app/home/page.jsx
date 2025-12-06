'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCityStore } from '@/store/cityStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { coachService } from '@/services/coachService';
import { reviewService } from '@/services/reviewService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CitySelector } from '@/components/ui/city-selector';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MAIN_CATEGORIES, CATEGORIES, getSubcategories, getMockDistance } from '@/lib/constants';
import { geoApi } from '@/lib/geoApi';
import { Star, Search, MapPin, Globe, Building2, Sparkles, TrendingUp, Coins, LogOut, Settings, User, HelpCircle, LayoutDashboard, Bell, Menu, X, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Category icons mapping
const categoryIcons = {
  'Tuition': '📚',
  'Dance': '💃',
  'Singing': '🎤',
  'Sports': '⚽',
  'Hobby': '🎨',
  'Music': '🎵',
  'Art': '🖌️',
  'Yoga': '🧘',
  'Fitness': '💪',
  'Cooking': '👨‍🍳',
  'Language': '🗣️',
  'Other': '✨',
};

// Category colors
const categoryColors = {
  'Tuition': 'from-blue-500 to-cyan-500',
  'Dance': 'from-pink-500 to-rose-500',
  'Singing': 'from-blue-500 to-violet-500',
  'Sports': 'from-green-500 to-emerald-500',
  'Hobby': 'from-orange-500 to-amber-500',
  'Music': 'from-indigo-500 to-blue-500',
  'Art': 'from-red-500 to-pink-500',
  'Yoga': 'from-teal-500 to-cyan-500',
  'Fitness': 'from-yellow-500 to-orange-500',
  'Cooking': 'from-amber-500 to-yellow-500',
  'Language': 'from-violet-500 to-blue-500',
  'Other': 'from-gray-500 to-slate-500',
};

export default function HomePage() {
  const { selectedCity, cityData, setCity: setCityStore } = useCityStore();
  const { user, setUser, userType } = useAuthStore();
  const router = useRouter();
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null,
    subcategory: null,
    minRating: null,
    searchQuery: '',
  });
  const [ratings, setRatings] = useState({});
  
  // Location change state
  const [country, setCountry] = useState(cityData?.countryCode || null);
  const [state, setState] = useState(cityData?.state || null);
  const [city, setCity] = useState(selectedCity || null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showLocationChange, setShowLocationChange] = useState(false);
  
  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Helper function to build comprehensive address for Google Maps
  const buildGoogleMapsAddress = (coach) => {
    if (!coach) return '';
    
    const parts = [];
    
    // Add name
    if (coach.name) parts.push(coach.name);
    
    // Add address
    if (coach.address) parts.push(coach.address);
    
    // Add nearby landmark
    if (coach.nearby_landmark) parts.push(coach.nearby_landmark);
    
    // Add pincode
    if (coach.pincode) parts.push(coach.pincode);
    
    // Add city
    if (coach.city) parts.push(coach.city);
    
    // Add state
    if (coach.state) parts.push(coach.state);
    
    // Add country
    if (coach.country) parts.push(coach.country);
    
    // Fallback to just city if nothing else is available
    if (parts.length === 0 && coach.city) {
      parts.push(coach.city);
    }
    
    return parts.join(', ');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user === null) return; // Still checking auth
    
    if (!user) {
      // Not authenticated, will redirect
      setLoading(false);
      return;
    }
    
    if (!selectedCity) {
      // If authenticated but no city selected, show location selection dialog
      setLoading(false);
      setShowLocationChange(true);
      loadCountries();
      return;
    }
    
    loadCoaches();
    if (cityData) {
      setCountry(cityData.countryCode || null);
      setState(cityData.state || null);
      setCity(selectedCity);
    }
  }, [selectedCity, router, cityData, user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?type=learner');
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
      router.push('/login?type=learner');
    }
  };

  useEffect(() => {
    if (showLocationChange) {
      loadCountries();
    }
  }, [showLocationChange]);

  useEffect(() => {
    if (country && showLocationChange) {
      loadStates();
    }
  }, [country, showLocationChange]);

  useEffect(() => {
    if (country && showLocationChange) {
      loadCities();
    }
  }, [state, country, showLocationChange]);

  useEffect(() => {
    filterCoaches();
  }, [coaches, filters]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const loadCountries = () => {
    try {
      const data = geoApi.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadStates = () => {
    try {
      const data = geoApi.getStates(country);
      setStates(data);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadCities = () => {
    if (!country) return;
    try {
      const data = geoApi.getCities(country, state);
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadCoaches = async () => {
    if (!selectedCity) return;
    try {
      setLoading(true);
      const data = await coachService.getCoachesByCity(selectedCity);
      setCoaches(data);
      
      const ratingPromises = data.map(async (coach) => {
        const avgRating = await reviewService.getAverageRating(coach.id);
        return { coachId: coach.id, rating: avgRating };
      });
      const ratingResults = await Promise.all(ratingPromises);
      const ratingMap = {};
      ratingResults.forEach(({ coachId, rating }) => {
        ratingMap[coachId] = rating;
      });
      setRatings(ratingMap);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newCity) => {
    if (!newCity || !country) return;
    
    const cityDataObj = {
      name: newCity,
      country: countries.find(c => c.code === country)?.name || country,
      state: state || null,
      countryCode: country,
    };
    setCityStore(JSON.stringify(cityDataObj));
    setShowLocationChange(false);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      router.push('/login?type=learner');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filterCoaches = () => {
    let filtered = [...coaches];

    if (filters.searchQuery) {
      filtered = filtered.filter(coach =>
        coach.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        coach.description?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Category filter - handle subcategories
    if (filters.subcategory) {
      // If subcategory is selected, filter by that specific subcategory
      filtered = filtered.filter(coach => coach.category === filters.subcategory);
    } else if (filters.category) {
      // If only main category is selected, show all coaches with subcategories of that category
      const subcategories = getSubcategories(filters.category);
      filtered = filtered.filter(coach => 
        subcategories.includes(coach.category) || coach.category === filters.category
      );
    }

    if (filters.minRating) {
      filtered = filtered.filter(coach => {
        const rating = ratings[coach.id] || 0;
        return rating >= filters.minRating;
      });
    }

    setFilteredCoaches(filtered);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-semibold text-gray-700 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden bg-white rounded-none"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="h-48 bg-[#970747]/10"></div>
                <CardHeader>
                  <div className="h-5 bg-[#970747]/10 rounded w-3/4"></div>
                  <div className="h-4 bg-[#970747]/10 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-[#970747]/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-[#970747]/10 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200/60 sticky top-0 z-50 backdrop-blur-sm"
        style={{
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and App Name */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 flex-shrink-0"
            >
              <Link href="/home" className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex items-center justify-center">
                  <img 
                    src="/images/logo.svg" 
                    alt="NearU Logo" 
                    className="h-10 w-10 object-contain"
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">NearU</h1>
              </Link>
            </motion.div>

            {/* Location - Centered */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex items-center gap-3 cursor-pointer group flex-1 justify-center"
              onClick={() => setShowLocationChange(true)}
            >
              <div className="h-9 w-9 flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(151, 7, 71, 0.1)'
                }}
              >
                <MapPin className="h-5 w-5 text-[#970747] transition-colors group-hover:text-[#970747]/80" />
              </div>
              <div className="transition-all">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-[#970747] transition-colors">
                  {selectedCity}
                  {cityData?.state && `, ${cityData.state}`}
                  {cityData?.country && `, ${cityData.country}`}
                </h2>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">

              {/* Help/Support Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-[#970747] hover:bg-[#970747]/10 rounded-none"
                onClick={() => {
                  // You can add help/support functionality here
                  alert('Help & Support: Contact us at support@nearu.com');
                }}
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                <span className="hidden lg:inline">Help</span>
              </Button>

              {/* Dashboard Button (for institutions) */}
              {user && userType === 'institution' && (
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-[#970747] hover:bg-[#970747]/10 rounded-none"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              <div className="relative user-menu-container">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-[#970747] hover:bg-[#970747]/10 rounded-none flex items-center gap-2 transition-all duration-300 group px-3 py-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-[#970747]/10 flex items-center justify-center border border-[#970747]/20 transition-all duration-300 group-hover:bg-[#970747]/20 group-hover:border-[#970747]/40">
                    <User className="h-4 w-4 text-[#970747]" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'}
                  </span>
                </Button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-none border-2 shadow-xl z-50"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 border-b mb-2" style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}>
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <p className="text-xs text-gray-500 capitalize mt-1">{userType || 'Learner'}</p>
                        </div>
                        
                        <Link href="/profile">
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </button>
                        </Link>

                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none"
                          onClick={() => {
                            setShowUserMenu(false);
                            // You can add settings functionality here
                            alert('Settings page coming soon!');
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>

                        <div className="border-t my-2" style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }} />

                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-none"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-[#970747] rounded-none"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden mt-4 pt-4 border-t"
              style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}
            >
              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none"
                  onClick={() => {
                    setShowLocationChange(true);
                    setShowMobileMenu(false);
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  Change Location
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none"
                  onClick={() => {
                    setShowMobileMenu(false);
                    alert('Help & Support: Contact us at support@nearu.com');
                  }}
                >
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </button>
                {user && userType === 'institution' && (
                  <Link href="/dashboard" onClick={() => setShowMobileMenu(false)}>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </button>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setShowMobileMenu(false)}>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                </Link>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#970747]/10 hover:text-[#970747] transition-colors rounded-none"
                  onClick={() => {
                    setShowMobileMenu(false);
                    alert('Settings page coming soon!');
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="border-t pt-2" style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }} />
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-none"
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-none shadow-xl border border-gray-200 p-6 mb-8"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(151, 7, 71, 0.1)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors z-10 text-[#970747]" />
              <Input
                placeholder="Search coaches by name or description..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="pl-12 h-12 rounded-none border-2 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                style={{ 
                  borderColor: 'rgba(151, 7, 71, 0.2)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#970747';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>
            <div className="relative">
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters({ 
                      ...filters, 
                      category: null,
                      subcategory: null
                    });
                  } else {
                    setFilters({ 
                      ...filters, 
                      category: value,
                      subcategory: null
                    });
                  }
                }}
              >
                <SelectTrigger className="h-12 rounded-none border-2 bg-white text-gray-900"
                  style={{ 
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-xl"
                  style={{
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(151, 7, 71, 0.1)'
                  }}
                >
                  <SelectItem value="all" className="text-gray-900">All Categories</SelectItem>
                  {MAIN_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-gray-900 font-semibold">
                      <span className="flex items-center gap-2">
                        <span>{categoryIcons[cat] || '✨'}</span>
                        <span>{cat}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Subcategory dropdown - only shows when a category is selected */}
            {filters.category && filters.category !== 'all' ? (
              <Select
                key={`subcategory-${filters.category}`}
                value={filters.subcategory || undefined}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    subcategory: value === 'all' || value === '' ? null : value
                  });
                }}
              >
                <SelectTrigger className="h-12 rounded-none border-2 bg-white text-gray-900"
                  style={{ 
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-xl"
                  style={{
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(151, 7, 71, 0.1)'
                  }}
                >
                  <SelectItem value="all" className="text-gray-900">All {filters.category}</SelectItem>
                  {getSubcategories(filters.category) && getSubcategories(filters.category).length > 0 ? (
                    getSubcategories(filters.category).map((subcat) => (
                      <SelectItem key={subcat} value={subcat} className="text-gray-600">
                        {subcat}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" className="text-gray-500" disabled>No subcategories</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-12"></div>
            )}
          </div>
        </motion.div>


        {/* Coaches Grid */}
        {filteredCoaches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-none border-2 border-dashed"
            style={{
              borderColor: 'rgba(151, 7, 71, 0.2)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg font-medium mb-2">
              No coaching classes found
            </p>
            <p className="text-gray-500">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoaches.map((coach, index) => {
              return (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/coaching/${coach.id}`}>
                    <Card className="h-full overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-white rounded-none"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.15)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.4)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(151, 7, 71, 0.2), 0 10px 10px -5px rgba(151, 7, 71, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      <div className="relative h-56 overflow-hidden">
                        {coach.images && coach.images.length > 0 ? (
                          <img
                            src={coach.images[0]}
                            alt={coach.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#970747]/10 to-[#970747]/5 flex items-center justify-center">
                            <span className="text-6xl">{categoryIcons[coach.category] || '✨'}</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-none text-xs font-bold bg-[#970747] text-white"
                            style={{
                              boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
                            }}
                          >
                            {coach.category}
                          </span>
                        </div>
                        {ratings[coach.id] && (
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-none flex items-center gap-1 border border-gray-200"
                            style={{
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          >
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900">{ratings[coach.id].toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                          {coach.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-[#970747]" />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildGoogleMapsAddress(coach))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium line-clamp-1 hover:text-[#970747] transition-colors cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {coach.address || coach.city || 'Address not available'}
                          </a>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
                          {coach.description || 'No description available'}
                        </p>
                        {coach.number_of_employees && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Users className="h-4 w-4 text-[#970747]" />
                            <span>
                              {coach.number_of_employees.includes('-') || coach.number_of_employees.includes('+')
                                ? `${coach.number_of_employees} employees`
                                : `${coach.number_of_employees} ${coach.number_of_employees === '1' ? 'employee' : 'employees'}`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t"
                          style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}
                        >
                          {ratings[coach.id] ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(ratings[coach.id])
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm font-semibold text-gray-900 ml-1">({ratings[coach.id].toFixed(1)})</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No ratings yet</span>
                          )}
                          {coach.batches && coach.batches.length > 0 ? (
                            coach.batches.length === 1 ? (
                              <span className="text-lg font-bold text-[#970747]">
                                ₹{coach.batches[0].cost}/mo
                              </span>
                            ) : (
                              <span className="text-lg font-bold text-[#970747]">
                                From ₹{Math.min(...coach.batches.map(b => b.cost))}/mo
                              </span>
                            )
                          ) : coach.fees ? (
                            <span className="text-lg font-bold text-[#970747]">
                              ₹{coach.fees}/mo
                            </span>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Location Dialog */}
      <Dialog open={showLocationChange} onOpenChange={setShowLocationChange}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-none"
          style={{
            borderColor: 'rgba(151, 7, 71, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(151, 7, 71, 0.1)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900">
              <MapPin className="h-5 w-5 text-[#970747]" />
              Change Location
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a new city to browse coaching classes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Globe className="h-4 w-4 text-[#970747]" />
                Country
              </label>
              <Combobox
                options={countries.map(c => ({ value: c.code, label: c.name }))}
                value={country || ''}
                onValueChange={(value) => {
                  setCountry(value);
                  setState(null);
                  setCity(null);
                }}
                placeholder="Select country..."
                emptyMessage="No countries found"
                className="border-gray-200"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.2)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#970747';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>

            {country && states.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Building2 className="h-4 w-4 text-[#970747]" />
                  State/Province
                </label>
                <Combobox
                  options={states.map(s => ({ value: s, label: s }))}
                  value={state || ''}
                  onValueChange={(value) => {
                    setState(value);
                    setCity(null);
                  }}
                  placeholder="Select state..."
                  emptyMessage="No states found"
                  className="border-gray-200"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                />
              </motion.div>
            )}

            {country && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="h-4 w-4 text-[#970747]" />
                  City
                </label>
                <CitySelector
                  options={cities.map(c => ({ value: c, label: c }))}
                  value={city || ''}
                  onValueChange={setCity}
                  placeholder="Select city..."
                  disabled={!country}
                  countryName={countries.find(c => c.code === country)?.name}
                  stateName={state}
                  className="border-gray-200"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                />
              </motion.div>
            )}

            <Button
              type="button"
              onClick={() => handleLocationChange(city)}
              className="w-full h-12 text-base font-semibold mt-6 bg-[#970747] hover:bg-[#970747]/90 text-white rounded-none"
              disabled={!city || !country}
              style={{
                boxShadow: '0 10px 15px -3px rgba(151, 7, 71, 0.3), 0 4px 6px -2px rgba(151, 7, 71, 0.2)'
              }}
            >
              Apply Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
