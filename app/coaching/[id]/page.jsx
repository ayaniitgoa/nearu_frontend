'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { coachService } from '@/services/coachService';
import { reviewService } from '@/services/reviewService';
import { enquiryService } from '@/services/enquiryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MapPin, Clock, DollarSign, ArrowLeft, Phone, Mail, Share2, Coins, Users } from 'lucide-react';
import { getMockDistance } from '@/lib/constants';
import { ReviewForm } from '@/components/ReviewForm';
import { useCityStore } from '@/store/cityStore';
import Link from 'next/link';
import Image from 'next/image';

export default function CoachingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = params.id;
  const cityStore = useCityStore();
  
  const [coach, setCoach] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [coachId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coachData, reviewsData, avgRating] = await Promise.all([
        coachService.getCoachById(coachId),
        reviewService.getReviewsByCoach(coachId),
        reviewService.getAverageRating(coachId),
      ]);
      
      setCoach(coachData);
      setReviews(reviewsData);
      setAverageRating(avgRating);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!coach) return;

    try {
      setSubmitting(true);
      await enquiryService.createEnquiry({
        coach_id: coach.id,
        name: enquiryForm.name,
        phone: enquiryForm.phone,
        message: enquiryForm.message || null,
      });
      
      alert('Enquiry submitted successfully!');
      setEnquiryOpen(false);
      setEnquiryForm({ name: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const renderStars = (rating, size = 'md') => {
    const sizeClass = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    }[size];

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-96 bg-[#970747]/10"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 bg-[#970747]/10 w-1/3 mb-4"></div>
            <div className="h-32 bg-[#970747]/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Coaching not found</h1>
          <Link href="/home">
            <Button className="bg-[#970747] hover:bg-[#970747]/90 text-white rounded-none">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button - Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/60"
        style={{
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/home">
            <Button variant="ghost" className="text-[#970747] hover:text-[#970747]/80 hover:bg-[#970747]/10 rounded-none">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Section with Image */}
      <div className="bg-white border-b border-gray-200/60"
        style={{
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Section - Fixed Aspect Ratio */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-none border-2"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {coach.images && coach.images.length > 0 ? (
                  <img
                    src={coach.images[0]}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement?.querySelector('.image-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#970747]/20 to-[#970747]/5 flex items-center justify-center">
                    <span className="text-6xl">✨</span>
                  </div>
                )}
                <div className="image-fallback hidden absolute inset-0 w-full h-full bg-gradient-to-br from-[#970747]/20 to-[#970747]/5 items-center justify-center">
                  <span className="text-6xl">✨</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-[#970747] text-white px-4 py-1.5 text-sm font-semibold rounded-none"
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
                    }}
                  >
                    {coach.category}
                  </span>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(averageRating, 'md')}
                      <span className="text-base font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {coach.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildGoogleMapsAddress(coach))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#970747] transition-colors cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-[#970747]" />
                    <span className="text-sm md:text-base">{coach.address || coach.city}</span>
                  </a>
                  <span className="text-sm md:text-base">•</span>
                  <span className="text-sm md:text-base">{getMockDistance()} away</span>
                </div>
                {coach.batches && coach.batches.length > 0 && (
                  <div className="pt-2">
                    {coach.batches.length === 1 ? (
                      <span className="text-xl font-bold text-[#970747]">₹{coach.batches[0].cost}/month</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Starting from</span>
                        <span className="text-xl font-bold text-[#970747]">
                          ₹{Math.min(...coach.batches.map(b => b.cost))}/month
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {(!coach.batches || coach.batches.length === 0) && coach.fees && (
                  <div className="pt-2">
                    <span className="text-xl font-bold text-[#970747]">₹{coach.fees}/month</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coach.timing && (
                <Card className="bg-white rounded-none border-2"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.15)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-[#970747]/10 rounded-none"
                        style={{
                          border: '1px solid rgba(151, 7, 71, 0.2)'
                        }}
                      >
                        <Clock className="h-6 w-6 text-[#970747]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Timing</h3>
                        <p className="text-sm text-gray-600">{coach.timing}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Show batches if available, otherwise show fees */}
              {coach.batches && coach.batches.length > 0 ? (
                coach.batches.length === 1 ? (
                  <Card className="bg-white rounded-none border-2"
                    style={{
                      borderColor: 'rgba(151, 7, 71, 0.15)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 flex items-center justify-center bg-[#970747]/10 rounded-none"
                          style={{
                            border: '1px solid rgba(151, 7, 71, 0.2)'
                          }}
                        >
                          <Coins className="h-6 w-6 text-[#970747]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Fees</h3>
                          <p className="text-lg font-bold text-[#970747]">₹{coach.batches[0].cost}/month</p>
                          {coach.batches[0].name && (
                            <p className="text-sm text-gray-600 mt-1">{coach.batches[0].name}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              ) : coach.fees ? (
                <Card className="bg-white rounded-none border-2"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.15)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-[#970747]/10 rounded-none"
                        style={{
                          border: '1px solid rgba(151, 7, 71, 0.2)'
                        }}
                      >
                        <Coins className="h-6 w-6 text-[#970747]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Fees</h3>
                        <p className="text-lg font-bold text-[#970747]">₹{coach.fees}/month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              {coach.number_of_employees && (
                <Card className="bg-white rounded-none border-2"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.15)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-[#970747]/10 rounded-none"
                        style={{
                          border: '1px solid rgba(151, 7, 71, 0.2)'
                        }}
                      >
                        <Users className="h-6 w-6 text-[#970747]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Employees</h3>
                        <p className="text-lg font-bold text-[#970747]">{coach.number_of_employees}</p>
                        <p className="text-sm text-gray-600 mt-1">employees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Batches Section - Show if multiple batches */}
            {coach.batches && coach.batches.length > 1 && (
              <Card className="bg-white rounded-none border-2"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-gray-900">Available Batches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coach.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="p-4 border-2 rounded-none"
                        style={{
                          borderColor: 'rgba(151, 7, 71, 0.15)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{batch.name}</h4>
                            {batch.description && (
                              <p className="text-sm text-gray-600 mb-2">{batch.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#970747]">₹{batch.cost}/month</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="bg-white rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.15)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <CardHeader>
                <CardTitle className="text-gray-900">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{coach.description || 'No description available.'}</p>
              </CardContent>
            </Card>

            {/* Additional Images Gallery */}
            {coach.images && coach.images.length > 1 && (
              <Card className="bg-white rounded-none border-2"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-gray-900">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {coach.images.slice(1, 7).map((image, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="relative h-40 bg-gradient-to-br from-[#970747]/10 to-[#970747]/5 overflow-hidden rounded-none border border-gray-200 cursor-pointer"
                      >
                        <img
                          src={image}
                          alt={`${coach.name} ${index + 2}`}
                          className="w-full h-full object-cover object-center"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            width: '100%',
                            height: '100%',
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="bg-white rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.15)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Reviews ({reviews.length})</CardTitle>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(averageRating, 'lg')}
                      <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Write Review Form */}
                <div className="pb-6 border-b" style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Write a Review</h3>
                  <ReviewForm coachId={coachId} onSuccess={loadData} />
                </div>

                {/* All Reviews */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">All Reviews</h3>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pb-6 border-b last:border-0 last:pb-0"
                          style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 flex items-center justify-center bg-[#970747]/10 text-[#970747] font-bold text-lg rounded-none border border-[#970747]/20 flex-shrink-0">
                              {review.user_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900">
                                  {review.user_name || 'Anonymous'}
                                </span>
                                {renderStars(review.rating, 'sm')}
                              </div>
                              {review.text && (
                                <p className="text-gray-700 mb-2 leading-relaxed">{review.text}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="bg-white rounded-none border-2"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.15)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <CardContent className="p-6 space-y-4">
                  <Button 
                    onClick={() => setEnquiryOpen(true)} 
                    size="lg" 
                    className="w-full bg-[#970747] hover:bg-[#970747]/90 text-white rounded-none h-14 text-base font-semibold"
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
                    }}
                  >
                    Send Enquiry
                  </Button>
                  
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildGoogleMapsAddress(coach))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full rounded-none border-2 h-12"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                        color: '#970747'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#970747';
                        e.currentTarget.style.backgroundColor = 'rgba(151, 7, 71, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </Button>
                  </a>

                  {averageRating > 0 && (
                    <div className="pt-4 border-t" style={{ borderColor: 'rgba(151, 7, 71, 0.1)' }}>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {renderStars(averageRating, 'lg')}
                        </div>
                        <p className="text-sm text-gray-600">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
        <DialogContent className="bg-white rounded-none"
          style={{
            borderColor: 'rgba(151, 7, 71, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(151, 7, 71, 0.05)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Send Enquiry</DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in your details and we'll get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnquirySubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Name</label>
                <Input
                  required
                  value={enquiryForm.name}
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, name: e.target.value })
                  }
                  placeholder="Your name"
                  className="rounded-none border-2"
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
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Phone</label>
                <Input
                  required
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, phone: e.target.value })
                  }
                  placeholder="Your phone number"
                  className="rounded-none border-2"
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
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Message (Optional)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-none border-2 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none"
                  style={{
                    borderColor: 'rgba(151, 7, 71, 0.2)',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  value={enquiryForm.message}
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, message: e.target.value })
                  }
                  placeholder="Your message..."
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnquiryOpen(false)}
                className="rounded-none border-2"
                style={{
                  borderColor: 'rgba(151, 7, 71, 0.2)',
                  color: '#970747'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#970747';
                  e.currentTarget.style.backgroundColor = 'rgba(151, 7, 71, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-[#970747] hover:bg-[#970747]/90 text-white rounded-none"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Enquiry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
