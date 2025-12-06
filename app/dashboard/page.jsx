'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { coachService } from '@/services/coachService';
import { enquiryService } from '@/services/enquiryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Plus, List, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalEnquiries: 0,
    approvedListings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?type=institution');
      return;
    }
    setUser(session.user);
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [coaches, enquiries] = await Promise.all([
        coachService.getCoachesByOwner(user.id),
        enquiryService.getEnquiriesByOwner(user.id),
      ]);

      setStats({
        totalListings: coaches.length,
        totalEnquiries: enquiries.length,
        approvedListings: coaches.filter(c => c.is_approved).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login?type=institution');
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your entity listings</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/profile"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <User className="h-5 w-5 text-[#970747]" />
              <span className="text-sm text-gray-700 hover:text-[#970747] transition-colors">{user?.email}</span>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.2)',
                color: '#970747'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#970747';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#970747';
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-none border-2"
            style={{
              borderColor: 'rgba(151, 7, 71, 0.15)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#970747]">{stats.totalListings}</div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.approvedListings} approved
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-none border-2"
            style={{
              borderColor: 'rgba(151, 7, 71, 0.15)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Total Enquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#970747]">{stats.totalEnquiries}</div>
              <p className="text-sm text-gray-600 mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-none border-2"
            style={{
              borderColor: 'rgba(151, 7, 71, 0.15)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Approved Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#970747]">{stats.approvedListings}</div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.totalListings - stats.approvedListings} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/add">
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-white rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.15)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.4)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(151, 7, 71, 0.2), 0 4px 6px -2px rgba(151, 7, 71, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.15)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Plus className="h-5 w-5 text-[#970747]" />
                  Add New Listing
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Create a new entity listing
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dashboard/manage">
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-white rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.15)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.4)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(151, 7, 71, 0.2), 0 4px 6px -2px rgba(151, 7, 71, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.15)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <List className="h-5 w-5 text-[#970747]" />
                  Manage Listings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  View and edit your listings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dashboard/enquiries">
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-white rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.15)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.4)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(151, 7, 71, 0.2), 0 4px 6px -2px rgba(151, 7, 71, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.15)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <MessageSquare className="h-5 w-5 text-[#970747]" />
                  View Enquiries
                </CardTitle>
                <CardDescription className="text-gray-600">
                  See all enquiries for your listings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

