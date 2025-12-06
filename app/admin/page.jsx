'use client';

import { useState, useEffect } from 'react';
import { coachService } from '@/services/coachService';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Check, X, RefreshCw, Eye, MapPin, Clock, DollarSign, FileText, Building2, Tag, GraduationCap, Users } from 'lucide-react';

export default function AdminPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState(null);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const data = await coachService.getAllCoaches();
      setCoaches(data);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (coachId) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      setOwnerEmail(null);
      
      // Fetch full details including batches using admin method
      const coach = await coachService.getCoachByIdAdmin(coachId);
      setSelectedCoach(coach);
      
      // Fetch owner email via API
      if (coach.owner_id) {
        try {
          const response = await fetch(`/api/admin/get-user-email?userId=${coach.owner_id}`);
          if (response.ok) {
            const data = await response.json();
            setOwnerEmail(data.email);
          }
        } catch (emailError) {
          console.error('Error fetching owner email:', emailError);
        }
      }
    } catch (error) {
      console.error('Error loading coach details:', error);
      // Fallback: get from the list and fetch batches separately
      const coach = coaches.find(c => c.id === coachId);
      if (coach) {
        try {
          const { data: batches } = await supabase
            .from('batches')
            .select('*')
            .eq('coach_id', coachId);
          setSelectedCoach({ ...coach, batches: batches || [] });
          
          // Try to get email for fallback coach
          if (coach.owner_id) {
            try {
              const response = await fetch(`/api/admin/get-user-email?userId=${coach.owner_id}`);
              if (response.ok) {
                const data = await response.json();
                setOwnerEmail(data.email);
              }
            } catch (e) {
              console.error('Error fetching email:', e);
            }
          }
        } catch (batchError) {
          setSelectedCoach({ ...coach, batches: [] });
        }
      } else {
        showToast('Failed to load listing details', 'error');
        setShowDetailsModal(false);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApproval = async (id, isApproved) => {
    try {
      // Use API route with service role key to bypass RLS
      const response = await fetch('/api/admin/update-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachId: id, isApproved }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update approval status');
      }

      const { data } = await response.json();
      
      // Update local state
      setCoaches(
        coaches.map((coach) =>
          coach.id === id ? { ...coach, is_approved: isApproved } : coach
        )
      );
      
      // Update selected coach if modal is open
      if (selectedCoach && selectedCoach.id === id) {
        setSelectedCoach({ ...selectedCoach, is_approved: isApproved });
      }
      
      showToast(
        `Listing ${isApproved ? 'approved' : 'disabled'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error updating approval:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      showToast(
        `Failed to update approval status: ${errorMessage}`,
        'error',
        6000
      );
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
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage all coaching listings</p>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Listings: {coaches.length} | Approved: {coaches.filter(c => c.is_approved).length} | Pending: {coaches.filter(c => !c.is_approved).length}
          </div>
          <Button variant="outline" onClick={loadCoaches}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {coaches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No listings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {coaches.map((coach) => (
              <Card key={coach.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{coach.name}</CardTitle>
                      <CardDescription>
                        {coach.category} • {coach.city} • Owner: {coach.owner_id.slice(0, 8)}...
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {coach.is_approved ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Approved
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <X className="h-4 w-4" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {coach.description || 'No description'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(coach.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    {!coach.is_approved && (
                      <Button
                        onClick={() => handleApproval(coach.id, true)}
                        className="flex items-center gap-2 bg-[#970747] hover:bg-[#970747]/90 text-white"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    {coach.is_approved && (
                      <Button
                        variant="destructive"
                        onClick={() => handleApproval(coach.id, false)}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Disable
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
            {loadingDetails ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#970747] mx-auto mb-4"></div>
                <p className="text-[#970747] font-medium">Loading details...</p>
              </div>
            ) : selectedCoach ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-[#970747]" />
                    {selectedCoach.name}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Complete listing information
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {selectedCoach.is_approved ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Tag className="h-5 w-5 text-[#970747] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="font-semibold text-gray-900">{selectedCoach.category || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <MapPin className="h-5 w-5 text-[#970747] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="font-semibold text-gray-900">{selectedCoach.city || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedCoach.timing && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <Clock className="h-5 w-5 text-[#970747] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Timing</p>
                          <p className="font-semibold text-gray-900">{selectedCoach.timing}</p>
                        </div>
                      </div>
                    )}
                    {selectedCoach.fees && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <DollarSign className="h-5 w-5 text-[#970747] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fees</p>
                          <p className="font-semibold text-gray-900">₹{selectedCoach.fees}/month</p>
                        </div>
                      </div>
                    )}
                    {selectedCoach.number_of_employees && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <Users className="h-5 w-5 text-[#970747] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Employees</p>
                          <p className="font-semibold text-gray-900">
                            {selectedCoach.number_of_employees.includes('-') || selectedCoach.number_of_employees.includes('+')
                              ? `${selectedCoach.number_of_employees} employees`
                              : `${selectedCoach.number_of_employees} ${selectedCoach.number_of_employees === '1' ? 'employee' : 'employees'}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {selectedCoach.address && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-[#970747] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm text-gray-900">{selectedCoach.address}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedCoach.description && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-[#970747] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Description</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCoach.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Batches */}
                  {selectedCoach.batches && selectedCoach.batches.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#970747]" />
                        Available Batches ({selectedCoach.batches.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedCoach.batches.map((batch, index) => (
                          <div key={batch.id || index} className="p-4 rounded-lg bg-gradient-to-br from-[#970747]/5 to-white border border-[#970747]/20">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{batch.name}</h4>
                              <span className="text-[#970747] font-bold">₹{batch.cost}/month</span>
                            </div>
                            {batch.description && (
                              <p className="text-sm text-gray-600 mt-2">{batch.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Owner Info */}
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Owner Email</p>
                        {ownerEmail ? (
                          <p className="text-sm text-gray-900 font-medium">{ownerEmail}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Loading...</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Owner ID</p>
                      <p className="text-sm font-mono text-gray-600 text-xs">{selectedCoach.owner_id}</p>
                    </div>
                  </div>

                  {/* Created Date */}
                  {selectedCoach.created_at && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Created At</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedCoach.created_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3 pt-4 border-t">
                  {!selectedCoach.is_approved && (
                    <Button
                      onClick={() => {
                        handleApproval(selectedCoach.id, true);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-[#970747] hover:bg-[#970747]/90 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Listing
                    </Button>
                  )}
                  {selectedCoach.is_approved && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleApproval(selectedCoach.id, false);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Disable Listing
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

