'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-y-auto">
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#970747]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#970747]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-5xl relative z-10">
          {/* Hero Text with Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center justify-center gap-4 mb-5"
            >
              <div className="relative h-20 w-20 md:h-24 md:w-24 flex items-center justify-center">
                <img 
                  src="/images/logo.svg" 
                  alt="NearU Logo" 
                  className="h-20 w-20 md:h-24 md:w-24 object-contain"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(151, 7, 71, 0.2))'
                  }}
                />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">NearU</h1>
            </motion.div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">
              Discover local tutors, coaches, and activities — <span className="text-[#970747]">all in one place.</span>
            </h2>
          </motion.div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Learner Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/register?type=learner" className="block h-full">
                <div className="bg-white shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-[#970747]/30"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=80" 
                      alt="Learners learning" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#970747]/40 to-transparent"></div>
                    <div className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 bg-[#970747] rounded-lg">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Learner</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                      Discover and enroll in training programs near you
                    </p>
                    <div className="flex items-center text-[#970747] font-medium text-sm">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Institution Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/register?type=institution" className="block h-full">
                <div className="bg-white shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-[#970747]/30"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop&q=80" 
                      alt="Training center" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#970747]/40 to-transparent"></div>
                    <div className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 bg-[#970747] rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Institution</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                      Manage your center and connect with learners
                    </p>
                    <div className="flex items-center text-[#970747] font-medium text-sm">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#970747] hover:text-[#970747]/80 font-medium underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
