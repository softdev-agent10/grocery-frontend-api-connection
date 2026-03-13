'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User,
  Mail,
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit3,
  Save,
} from 'lucide-react';
import { useState } from 'react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  joinDate: string;
}

const mockUserProfile: UserProfile = {
  id: 1,
  name: 'Admin Manager',
  email: 'admin@grocery.com',
  role: 'System Administrator',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  joinDate: 'January 15, 2024',
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockUserProfile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-linear-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/dashboard/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">View & manage your account information</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              isEditing
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="h-5 w-5" /> Save
              </>
            ) : (
              <>
                <Edit3 className="h-5 w-5" /> Edit
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
          >
            {/* Banner */}
            <div className="h-32 bg-linear-to-r from-emerald-400 to-emerald-600" />

            {/* Profile Info */}
            <div className="px-6 md:px-8 py-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-8 -mt-16 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-600 text-white border-4 border-white shadow-lg"
                >
                  <User className="h-16 w-16" />
                </motion.div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                  )}
                  <p className="text-gray-600 font-medium text-lg mt-1">{profile.role}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-blue-50 rounded-xl border border-blue-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                  )}
                </motion.div>

                {/* Phone */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-purple-50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{profile.phone}</p>
                  )}
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-pink-50 rounded-xl border border-pink-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-pink-600 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-white border border-pink-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{profile.location}</p>
                  )}
                </motion.div>

                {/* Join Date */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Member Since</label>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{profile.joinDate}</p>
                </motion.div>

                {/* Role */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{profile.role}</p>
                  )}
                </motion.div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 flex gap-3"
                >
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
