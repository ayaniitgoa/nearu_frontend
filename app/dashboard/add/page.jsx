'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { coachService } from '@/services/coachService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { MAIN_CATEGORIES, CATEGORIES, getSubcategories } from '@/lib/constants';
import { geoApi } from '@/lib/geoApi';
import { batchService } from '@/services/batchService';
import { ArrowLeft, Plus, X, Trash2, Building2, MapPin, Tag, FileText, Clock, DollarSign, GraduationCap, CheckCircle2, Clock as ClockIcon, Users, Phone, Mail, Globe, CheckSquare, Square, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    country: 'IN',
    state: '',
    city: '',
    category: '',
    subcategory: [],
    description: '',
    timing: '',
    fees: '',
    address: '',
    pincode: '',
    nearby_landmark: '',
    phone: '',
    email: '',
    website: '',
    number_of_employees: '',
    google_maps_link: '',
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [batches, setBatches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedMapsLink, setGeneratedMapsLink] = useState('');
  const [linkValidated, setLinkValidated] = useState(false);
  const [showManualLinkInput, setShowManualLinkInput] = useState(false);
  const [showMapsLinkSection, setShowMapsLinkSection] = useState(false);
  const [showLinkForValidation, setShowLinkForValidation] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAuth();
    loadCountries();
  }, []);

  useEffect(() => {
    if (formData.country) {
      loadStates();
    } else {
      setStates([]);
      setCities([]);
      setFormData({ ...formData, state: '', city: '' });
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state && formData.country) {
      loadCities();
    } else {
      setCities([]);
      setFormData({ ...formData, city: '' });
    }
  }, [formData.state, formData.country]);

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
      const data = geoApi.getStates(formData.country);
      setStates(data);
      setFormData({ ...formData, state: '', city: '' });
      setCities([]);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadCities = () => {
    try {
      const data = geoApi.getCities(formData.country, formData.state);
      setCities(data);
      setFormData({ ...formData, city: '' });
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?type=institution');
        return;
      }
      // Set user in auth store
      const { setUser } = useAuthStore.getState();
      setUser(session.user);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login?type=institution');
    } finally {
      setLoading(false);
    }
  };

  const addBatch = () => {
    setBatches([...batches, { name: '', description: '', cost: '' }]);
  };

  const removeBatch = (index) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const updateBatch = (index, field, value) => {
    const updated = [...batches];
    updated[index][field] = value;
    setBatches(updated);
  };

  // Generate Google Maps link from address fields
  const generateGoogleMapsLink = () => {
    const parts = [];
    
    // Add name
    if (formData.name) parts.push(formData.name);
    
    // Add address
    if (formData.address) parts.push(formData.address);
    
    // Add nearby landmark
    if (formData.nearby_landmark) parts.push(formData.nearby_landmark);
    
    // Add pincode
    if (formData.pincode) parts.push(formData.pincode);
    
    // Add city
    if (formData.city) parts.push(formData.city);
    
    // Add state
    if (formData.state) parts.push(formData.state);
    
    // Add country (get country name from code)
    if (formData.country) {
      const countryObj = countries.find(c => c.isoCode === formData.country);
      if (countryObj) parts.push(countryObj.name);
    }
    
    // Fallback to just city if nothing else is available
    if (parts.length === 0 && formData.city) {
      parts.push(formData.city);
    }
    
    if (parts.length > 0) {
      const query = parts.join(', ');
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    
    return '';
  };

  // Check if all address fields are filled to show Google Maps link section
  const allAddressFieldsFilled = 
    formData.name && 
    formData.address && 
    formData.city && 
    formData.country && 
    formData.pincode && 
    formData.nearby_landmark &&
    (states.length === 0 || formData.state); // State is only required if states exist for the country

  useEffect(() => {
    setShowMapsLinkSection(allAddressFieldsFilled);
    
    // Reset validation if address fields change
    if (!allAddressFieldsFilled) {
      setLinkValidated(false);
      setShowLinkForValidation(false);
      setGeneratedMapsLink('');
      setFormData({ ...formData, google_maps_link: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, formData.address, formData.city, formData.pincode, formData.nearby_landmark, formData.state, formData.country, states.length]);

  // Generate and show Google Maps link for validation
  const generateAndShowMapsLink = () => {
    const link = generateGoogleMapsLink();
    if (!link) {
      alert('Unable to generate Google Maps link. Please check your address fields.');
      return;
    }
    setGeneratedMapsLink(link);
    setShowLinkForValidation(true);
    setLinkValidated(false);
  };

  // Validate Google Maps link (user confirms location is correct)
  const confirmLocationIsCorrect = () => {
    const linkToValidate = showManualLinkInput ? formData.google_maps_link : generatedMapsLink;
    
    if (!linkToValidate || !linkToValidate.trim()) {
      alert('Please enter a Google Maps link');
      return;
    }
    
    // Basic validation - check if it's a Google Maps URL
    const googleMapsPattern = /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com)/;
    if (!googleMapsPattern.test(linkToValidate)) {
      alert('Please enter a valid Google Maps link (should start with https://www.google.com/maps or https://maps.google.com)');
      return;
    }
    
    // Store the validated link
    setFormData({ ...formData, google_maps_link: linkToValidate });
    setLinkValidated(true);
    setShowManualLinkInput(false);
  };

  // Open link in new tab for testing
  const testMapsLink = () => {
    const linkToTest = showManualLinkInput ? formData.google_maps_link : generatedMapsLink;
    if (linkToTest) {
      window.open(linkToTest, '_blank');
    }
  };

  // Handle image selection (store file, show preview, but don't upload yet)
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      e.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Maximum size is 5MB`);
      e.target.value = '';
      return;
    }

    // Store the file for later upload
    setSelectedImageFile(file);

    // Create preview using FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  };

  // Upload image to Supabase Storage (called only after successful listing creation)
  const uploadImageToStorage = async (userId) => {
    if (!selectedImageFile) return null;

    try {
      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `coaching-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('coaching-images')
        .upload(filePath, selectedImageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('coaching-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Remove image
  const removeImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get user from session directly if not in store
    let currentUser = user;
    if (!currentUser) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to create a listing');
        router.push('/login?type=institution');
        return;
      }
      currentUser = session.user;
      // Update store
      const { setUser } = useAuthStore.getState();
      setUser(currentUser);
    }

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter an institute name');
      return;
    }

    if (!formData.city) {
      alert('Please select a city');
      return;
    }

    if (!formData.address || !formData.address.trim()) {
      alert('Please enter a street address');
      return;
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      alert('Please enter a pincode');
      return;
    }

    if (!formData.nearby_landmark || !formData.nearby_landmark.trim()) {
      alert('Please enter a nearby landmark');
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    try {
      setSubmitting(true);
      
      // Build full address with pincode and landmark (state and country stored separately)
      let fullAddress = formData.address || '';
      if (formData.nearby_landmark) {
        fullAddress = fullAddress ? `${fullAddress}, ${formData.nearby_landmark}` : formData.nearby_landmark;
      }
      if (formData.pincode) {
        fullAddress = fullAddress ? `${fullAddress} - ${formData.pincode}` : formData.pincode;
      }

      // Determine category - use first subcategory if available, otherwise main category
      const finalCategory = formData.subcategory && Array.isArray(formData.subcategory) && formData.subcategory.length > 0
        ? formData.subcategory[0] 
        : formData.category;

      console.log('Creating coach with data:', {
        owner_id: currentUser.id,
        name: formData.name,
        city: formData.city,
        category: finalCategory,
      });

      // Validate Google Maps link before submission
      if (!formData.google_maps_link || !formData.google_maps_link.trim()) {
        alert('Please validate the Google Maps link before submitting');
        return;
      }

      // Upload image to storage only if file is selected (before creating the listing)
      let imageUrl = null;
      if (selectedImageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToStorage(currentUser.id);
        } catch (error) {
          alert('Failed to upload image. Please try again.');
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Create coach
      const coach = await coachService.createCoach({
        owner_id: currentUser.id,
        name: formData.name.trim(),
        city: formData.city,
        state: formData.state || null,
        country: formData.country || null,
        category: finalCategory,
        subcategories: formData.subcategory && formData.subcategory.length > 0 ? formData.subcategory : null,
        description: formData.description || null,
        timing: formData.timing || null,
        fees: formData.fees ? parseFloat(formData.fees) : null,
        address: fullAddress || null,
        pincode: formData.pincode || null,
        nearby_landmark: formData.nearby_landmark || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        images: imageUrl ? [imageUrl] : null,
        number_of_employees: formData.number_of_employees && formData.number_of_employees !== 'none' ? formData.number_of_employees : null,
        google_maps_link: formData.google_maps_link.trim(),
      });

      console.log('Coach created:', coach);

      // Create batches if any
      if (batches.length > 0) {
        const validBatches = batches.filter(b => b.name && b.cost);
        if (validBatches.length > 0) {
          console.log('Creating batches:', validBatches);
          await Promise.all(
            validBatches.map(batch =>
              batchService.createBatch({
                coach_id: coach.id,
                name: batch.name,
                description: batch.description || null,
                cost: parseFloat(batch.cost),
              })
            )
          );
        }
      }

      // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to create listing: ${errorMessage}. Please check the console for details.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#970747] mx-auto mb-4"></div>
          <p className="text-[#970747] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #fef7f5 0%, #fff5f8 25%, #ffffff 50%, #fef7f5 75%, #fff5f8 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#970747]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#970747]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#970747]/3 rounded-full blur-3xl"></div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative max-w-5xl mx-auto p-4 lg:p-6">
        {/* Compact Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="mb-4 text-[#970747] hover:text-white hover:bg-[#970747] rounded-lg h-9 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#970747] via-[#970747]/90 to-[#970747]/80 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#970747] to-[#970747]/80 bg-clip-text text-transparent">
                Add New Institute Listing
              </h1>
              <p className="text-sm text-gray-600 mt-1.5 font-medium">
                Create a comprehensive listing to attract learners
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-[#970747]/10 p-6 lg:p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#970747]/10">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#970747]/10 to-[#970747]/5 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#970747]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Provide the basic details about your institute. Once approved, you will be notified.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {/* Institute Name */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#970747]" />
                  Institute Name <span className="text-[#970747]">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your institute name"
                  className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200 text-gray-900"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)',
                    caretColor: '#970747'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.caretColor = '#970747';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.caretColor = '#970747';
                  }}
                />
              </div>

              {/* Location Section */}
              <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-[#970747]/5 to-white"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-[#970747]" />
                  <label className="text-sm font-semibold text-gray-700">
                    Location <span className="text-[#970747]">*</span>
                  </label>
                </div>
                
                <div className="space-y-4">
                  {/* Country */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Country <span className="text-[#970747]">*</span>
                    </label>
                    <div className="relative">
                      <Combobox
                        options={countries.map(c => ({ value: c.code, label: c.name }))}
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData({ ...formData, country: value, state: '', city: '' })
                        }
                        placeholder="Search and select country..."
                        className="w-full"
                        emptyMessage="No countries found"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      State/Province
                    </label>
                    <div className="relative">
                      <Combobox
                        options={states.map(s => ({ value: s, label: s }))}
                        value={formData.state}
                        onValueChange={(value) =>
                          setFormData({ ...formData, state: value, city: '' })
                        }
                        placeholder={!formData.country ? "Select country first" : states.length === 0 ? "No states available" : "Search and select state..."}
                        className="w-full"
                        disabled={!formData.country}
                        emptyMessage="No states found"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      City <span className="text-[#970747]">*</span>
                    </label>
                    <div className="relative">
                      <Combobox
                        options={cities.map(city => ({ value: city, label: city }))}
                        value={formData.city}
                        onValueChange={(value) =>
                          setFormData({ ...formData, city: value })
                        }
                        placeholder={
                          !formData.country 
                            ? "Select country first" 
                            : states.length > 0 && !formData.state 
                              ? "Select state first" 
                              : cities.length === 0 
                                ? "No cities available" 
                                : "Search and select city..."
                        }
                        className="w-full"
                        disabled={!formData.country || (states.length > 0 && !formData.state)}
                        emptyMessage="No cities found"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Street Address <span className="text-[#970747]">*</span>
                    </label>
                    <Input
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Full street address"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Pincode <span className="text-[#970747]">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        if (value.length <= 10) {
                          setFormData({ ...formData, pincode: value });
                        }
                      }}
                      placeholder="e.g., 403001"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  {/* Nearby Landmark */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Nearby Landmark <span className="text-[#970747]">*</span>
                    </label>
                    <Input
                      value={formData.nearby_landmark}
                      onChange={(e) =>
                        setFormData({ ...formData, nearby_landmark: e.target.value })
                      }
                      placeholder="e.g., Near City Mall, Opposite Park"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  {/* Google Maps Link Section */}
                  <div className="col-span-full">
                    <label className="text-xs font-medium mb-2 block text-gray-700">
                      Google Maps Link <span className="text-[#970747]">*</span>
                    </label>
                    
                    {!showLinkForValidation && !linkValidated ? (
                      <div>
                        <button
                          type="button"
                          onClick={generateAndShowMapsLink}
                          disabled={!allAddressFieldsFilled}
                          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                            allAddressFieldsFilled
                              ? 'bg-[#970747] text-white hover:bg-[#970747]/90 shadow-md hover:shadow-lg'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>Generate Google Maps Link</span>
                          </div>
                        </button>
                        {!allAddressFieldsFilled && (
                          <p className="mt-2 text-xs text-gray-500">Please enter the above details</p>
                        )}
                      </div>
                    ) : showLinkForValidation && !linkValidated ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-700 mb-3">Please verify the below link:</p>
                        <a
                          href={generatedMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={testMapsLink}
                          className="text-[#970747] hover:underline text-sm font-medium inline-flex items-center gap-1"
                        >
                          <MapPin className="h-4 w-4" />
                          Google Maps Link
                        </a>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                          <button
                            type="button"
                            onClick={confirmLocationIsCorrect}
                            className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm Location
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowManualLinkInput(true);
                              setShowLinkForValidation(false);
                            }}
                            className="py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Enter Manually
                          </button>
                        </div>
                      </div>
                    ) : showManualLinkInput ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <input
                          type="text"
                          value={formData.google_maps_link}
                          onChange={(e) => {
                            setFormData({ ...formData, google_maps_link: e.target.value });
                            setLinkValidated(false);
                          }}
                          placeholder="https://www.google.com/maps/search/?api=1&query=..."
                          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent"
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={confirmLocationIsCorrect}
                            className="flex-1 py-2.5 px-4 bg-[#970747] hover:bg-[#970747]/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Validate Link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowManualLinkInput(false);
                              setFormData({ ...formData, google_maps_link: '' });
                              setLinkValidated(false);
                              setShowLinkForValidation(false);
                            }}
                            className="py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Use Generated
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">Google Maps link validated</p>
                          <p className="text-xs text-green-600 mt-0.5">Location confirmed</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLinkValidated(false);
                            setShowLinkForValidation(false);
                            setFormData({ ...formData, google_maps_link: '' });
                          }}
                          className="py-1.5 px-3 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-white transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#970747]" />
                  Images
                </label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  {!selectedImagePreview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={uploadingImage}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          uploadingImage
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-[#970747] bg-white hover:bg-[#970747]/5'
                        }`}
                      >
                        <Upload className={`h-5 w-5 ${uploadingImage ? 'text-gray-400' : 'text-[#970747]'}`} />
                        <span className={`text-sm font-medium ${uploadingImage ? 'text-gray-400' : 'text-[#970747]'}`}>
                          {uploadingImage ? 'Uploading...' : 'Select Image'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1.5">Select one image (Max 5MB). Image will be saved when you create the listing.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 font-medium">Preview (as it will appear to learners):</p>
                      <div className="max-w-sm">
                        <Card className="h-full overflow-hidden border-2 transition-all duration-300 bg-white rounded-none"
                          style={{
                            borderColor: 'rgba(151, 7, 71, 0.15)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          <div className="relative h-56 overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={selectedImagePreview}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain transition-transform duration-300"
                              style={{
                                objectFit: 'contain',
                                objectPosition: 'center'
                              }}
                            />
                            {formData.category && (
                              <div className="absolute top-3 right-3">
                                <span className="px-3 py-1 rounded-none text-xs font-bold bg-[#970747] text-white"
                                  style={{
                                    boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
                                  }}
                                >
                                  {formData.category}
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 left-2 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                              {formData.name || 'Institute Name'}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4 text-[#970747]" />
                              <span className="font-medium line-clamp-1">
                                {formData.address || formData.city || 'Address'}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
                              {formData.description || 'No description available'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#970747]" />
                  Category <span className="text-[#970747]">*</span>
                </label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value, subcategory: [] })
                  }
                >
                  <SelectTrigger className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 transition-all duration-200"
                    style={{
                      borderColor: 'rgba(151, 7, 71, 0.2)',
                      boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#970747';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                      e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    }}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-xl"
                    style={{
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(151, 7, 71, 0.1)'
                    }}
                  >
                    {MAIN_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-gray-900">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              {formData.category && getSubcategories(formData.category) && getSubcategories(formData.category).length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#970747]" />
                    Subcategories (Select multiple)
                  </label>
                  <div className="rounded-xl border-2 bg-white/90 backdrop-blur-sm p-4 transition-all duration-200 min-h-[120px] max-h-[200px] overflow-y-auto"
                    style={{
                      borderColor: 'rgba(151, 7, 71, 0.2)',
                      boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#970747';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                      e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    }}
                    tabIndex={0}
                  >
                    {getSubcategories(formData.category).length === 0 ? (
                      <p className="text-sm text-gray-500">No subcategories available</p>
                    ) : (
                      <div className="space-y-2">
                        {getSubcategories(formData.category).map((subcat) => {
                          const isSelected = formData.subcategory.includes(subcat);
                          return (
                            <label
                              key={subcat}
                              className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#970747]/5 transition-colors"
                            >
                              <div className="relative">
                                {isSelected ? (
                                  <CheckSquare className="h-5 w-5 text-[#970747]" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <span className="text-sm text-gray-700 flex-1">{subcat}</span>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      subcategory: [...formData.subcategory, subcat]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      subcategory: formData.subcategory.filter(s => s !== subcat)
                                    });
                                  }
                                }}
                                className="sr-only"
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {formData.subcategory.length > 0 && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}>
                        <p className="text-xs text-gray-600">
                          Selected: <span className="font-semibold text-[#970747]">{formData.subcategory.join(', ')}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#970747]" />
                  Description
                </label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border-2 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none resize-y"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your institute, courses offered, teaching methodology, and what makes it special..."
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 3px 0 rgba(151, 7, 71, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>

              {/* Timing */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#970747]" />
                  Timing
                </label>
                <Input
                  value={formData.timing}
                  onChange={(e) =>
                    setFormData({ ...formData, timing: e.target.value })
                  }
                  placeholder="e.g., Mon-Fri 6-8 PM"
                  className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200 text-gray-900"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)',
                    caretColor: '#970747'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#970747';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.caretColor = '#970747';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                    e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.caretColor = '#970747';
                  }}
                />
              </div>

              {/* Contact Information Section */}
              <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-[#970747]/5 to-white"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-5 w-5 text-[#970747]" />
                  <label className="text-sm font-semibold text-gray-700">
                    Contact Information
                  </label>
                </div>
                
                <div className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d+\-() ]/g, ''); // Allow digits, +, -, (, ), and spaces
                        setFormData({ ...formData, phone: value });
                      }}
                      placeholder="e.g., +91 98765 43210"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g., contact@institute.com"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-gray-600">
                      Website (Optional)
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="e.g., https://www.institute.com"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 pl-4 transition-all duration-200"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Number of Employees */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#970747]" />
                  Number of Employees
                </label>
                <Select
                  value={formData.number_of_employees || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, number_of_employees: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-2 bg-white/90 backdrop-blur-sm h-11 transition-all duration-200"
                    style={{
                      borderColor: 'rgba(151, 7, 71, 0.2)',
                      boxShadow: '0 2px 4px 0 rgba(151, 7, 71, 0.08)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#970747';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.12), 0 4px 12px 0 rgba(151, 7, 71, 0.15)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                      e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(151, 7, 71, 0.08)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    }}
                  >
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-xl"
                    style={{
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(151, 7, 71, 0.1)'
                    }}
                  >
                    <SelectItem value="none" className="text-gray-500">Not specified</SelectItem>
                    <SelectItem value="1-5" className="text-gray-900">1-5 employees</SelectItem>
                    <SelectItem value="6-10" className="text-gray-900">6-10 employees</SelectItem>
                    <SelectItem value="11-20" className="text-gray-900">11-20 employees</SelectItem>
                    <SelectItem value="21-50" className="text-gray-900">21-50 employees</SelectItem>
                    <SelectItem value="51-100" className="text-gray-900">51-100 employees</SelectItem>
                    <SelectItem value="101-200" className="text-gray-900">101-200 employees</SelectItem>
                    <SelectItem value="201-500" className="text-gray-900">201-500 employees</SelectItem>
                    <SelectItem value="500+" className="text-gray-900">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Batches Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-[#970747]/10 p-6 lg:p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-[#970747]/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#970747]/10 to-[#970747]/5 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#970747]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Batches & Pricing</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add different batches with their pricing (optional)
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={addBatch}
                className="bg-gradient-to-r from-[#970747] to-[#970747]/90 hover:from-[#970747]/90 hover:to-[#970747] text-white rounded-xl h-11 px-6 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </Button>
            </div>
            <div className="space-y-4">
              {batches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#970747]/10 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-[#970747]" />
                  </div>
                  <p className="text-gray-700 font-medium text-sm mb-1">No batches added yet</p>
                  <p className="text-xs text-gray-500">Click "Add Batch" or use the single fee field below</p>
                </div>
              ) : (
                batches.map((batch, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl transition-all hover:shadow-lg border border-[#970747]/10 bg-gradient-to-br from-[#970747]/5 to-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[#970747] flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold text-gray-900">Batch {index + 1}</h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBatch(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold mb-1.5 block text-gray-700">
                          Batch Name <span className="text-[#970747]">*</span>
                        </label>
                        <Input
                          required
                          value={batch.name}
                          onChange={(e) => updateBatch(index, 'name', e.target.value)}
                          placeholder="e.g., Regular Batch, Weekend Batch"
                          className="rounded-lg border-2 bg-white h-10 pl-3 text-sm"
                          style={{
                            borderColor: 'rgba(151, 7, 71, 0.2)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#970747';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 3px 0 rgba(151, 7, 71, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1.5 block text-gray-700">Description</label>
                        <textarea
                          value={batch.description}
                          onChange={(e) => updateBatch(index, 'description', e.target.value)}
                          placeholder="Brief description of this batch"
                          className="flex min-h-[70px] w-full rounded-lg border-2 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none resize-y"
                          style={{
                            borderColor: 'rgba(151, 7, 71, 0.2)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#970747';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 3px 0 rgba(151, 7, 71, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1.5 block text-gray-700">
                          Cost (₹/month) <span className="text-[#970747]">*</span>
                        </label>
                        <Input
                          required
                          type="number"
                          value={batch.cost}
                          onChange={(e) => updateBatch(index, 'cost', e.target.value)}
                          placeholder="5000"
                          className="rounded-lg border-2 bg-white h-10 pl-3 text-sm"
                          style={{
                            borderColor: 'rgba(151, 7, 71, 0.2)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#970747';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 3px 0 rgba(151, 7, 71, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {batches.length === 0 && (
                <div className="p-5 rounded-xl border border-[#970747]/10 bg-gradient-to-br from-[#970747]/5 to-white">
                  <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#970747]" />
                    Single Fee (₹/month)
                  </label>
                  <p className="text-xs text-gray-600 mb-3">Use this if you have only one pricing option</p>
                  <Input
                    type="number"
                    value={formData.fees}
                    onChange={(e) =>
                      setFormData({ ...formData, fees: e.target.value })
                    }
                    placeholder="5000"
                    className="rounded-lg border-2 bg-white h-11 pl-4"
                    style={{
                      borderColor: 'rgba(151, 7, 71, 0.2)',
                      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#970747';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(151, 7, 71, 0.1), 0 2px 4px 0 rgba(151, 7, 71, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                      e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Link href="/dashboard/manage">
              <Button 
                type="button" 
                variant="outline"
                className="rounded-xl border-2 h-12 px-8 font-semibold text-[#970747] hover:text-white hover:bg-[#970747] transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.3)'
                }}
              >
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-gradient-to-r from-[#970747] to-[#970747]/90 hover:from-[#970747]/90 hover:to-[#970747] text-white rounded-xl px-10 h-12 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating...
                </span>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl border-[#970747]/20">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-[#970747]/10 to-[#970747]/5 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-[#970747]" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Listing Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Your institute listing has been submitted for review.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#970747]/5 to-[#970747]/10 border border-[#970747]/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[#970747]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClockIcon className="h-5 w-5 text-[#970747]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Awaiting Approval</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your listing is currently under review. Once approved by our admin team, it will be visible to learners on the platform. You will be notified once the review is complete.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard/manage');
                }}
                className="flex-1 bg-gradient-to-r from-[#970747] to-[#970747]/90 hover:from-[#970747]/90 hover:to-[#970747] text-white rounded-xl h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                View My Listings
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard');
                }}
                variant="outline"
                className="flex-1 rounded-xl h-11 font-semibold border-2 border-[#970747]/30 text-[#970747] hover:bg-[#970747]/10 transition-all duration-200"
              >
                Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

