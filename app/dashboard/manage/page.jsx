'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { coachService } from '@/services/coachService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function ManageListingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadCoaches();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?type=institution');
    }
  };

  const loadCoaches = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await coachService.getCoachesByOwner(user.id);
      setCoaches(data);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await coachService.deleteCoach(id);
      setCoaches(coaches.filter((c) => c.id !== id));
      alert('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
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
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Manage Listings</h1>
          <p className="text-gray-600">View and manage your coaching listings</p>
        </div>

        {coaches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No listings yet</p>
              <Link href="/dashboard/add">
                <Button>Create Your First Listing</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <Card key={coach.id}>
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {coach.images && coach.images.length > 0 ? (
                    <img
                      src={coach.images[0]}
                      alt={coach.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {coach.is_approved ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{coach.name}</CardTitle>
                  <CardDescription>
                    {coach.category} • {coach.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {coach.description || 'No description'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        alert('Edit functionality coming soon');
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(coach.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

