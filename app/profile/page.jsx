'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, ArrowLeft, Save, Phone, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    userType: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?type=learner');
        return;
      }
      setUser(session.user);
      const userType = session.user.user_metadata?.user_type || 'learner';
      setFormData({
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
        phone: session.user.user_metadata?.phone || '',
        userType: userType,
      });
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login?type=learner');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
      };
      
      // Only include phone if user is an institution
      if (formData.userType === 'institution') {
        updateData.phone = formData.phone || null;
      }
      
      const { error } = await supabase.auth.updateUser({
        data: updateData
      });
      if (error) throw error;
      
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) setUser(updatedUser);
      
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(`Failed to update profile: ${error.message}`, 'error', 5000);
    } finally {
      setSaving(false);
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
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href={user?.user_metadata?.user_type === 'institution' ? '/dashboard' : '/home'}>
            <Button variant="ghost" className="mb-6 text-[#970747] hover:text-[#970747]/80 hover:bg-[#970747]/10 rounded-none">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {user?.user_metadata?.user_type === 'institution' ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white rounded-none border-2"
              style={{
                borderColor: 'rgba(151, 7, 71, 0.15)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-6 w-6 text-[#970747]" />
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="rounded-none border-2 bg-gray-50"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {formData.userType === 'institution' ? 'Institution Name' : 'Full Name'}
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={formData.userType === 'institution' ? 'ABC Training Center' : 'John Doe'}
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

                  {formData.userType === 'institution' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
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
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-2">
                      {formData.userType === 'institution' ? (
                        <Building2 className="h-4 w-4 text-gray-500" />
                      ) : (
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                      )}
                      Account Type
                    </label>
                    <Input
                      type="text"
                      value={formData.userType === 'institution' ? 'Institution' : 'Learner'}
                      disabled
                      className="rounded-none border-2 bg-gray-50 capitalize"
                      style={{
                        borderColor: 'rgba(151, 7, 71, 0.2)',
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Account type cannot be changed</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#970747] hover:bg-[#970747]/90 text-white rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}

