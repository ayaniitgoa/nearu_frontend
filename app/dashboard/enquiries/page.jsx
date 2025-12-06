'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { enquiryService } from '@/services/enquiryService';
import { coachService } from '@/services/coachService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function EnquiriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enquiries, setEnquiries] = useState([]);
  const [coaches, setCoaches] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?type=institution');
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [enquiriesData, coachesData] = await Promise.all([
        enquiryService.getEnquiriesByOwner(user.id),
        coachService.getCoachesByOwner(user.id),
      ]);

      setEnquiries(enquiriesData);
      
      // Create a map of coach IDs to coach objects
      const coachMap = {};
      coachesData.forEach((coach) => {
        coachMap[coach.id] = coach;
      });
      setCoaches(coachMap);
    } catch (error) {
      console.error('Error loading enquiries:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Enquiries</h1>
          <p className="text-gray-600">View all enquiries for your listings</p>
        </div>

        {enquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No enquiries yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enquiry) => (
              <Card key={enquiry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{enquiry.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4" />
                        {enquiry.phone}
                      </CardDescription>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {coaches[enquiry.coach_id] && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        For: <span className="font-semibold">{coaches[enquiry.coach_id].name}</span>
                      </p>
                    </div>
                  )}
                  {enquiry.message && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-700">{enquiry.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

