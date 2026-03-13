'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Settings as SettingsIcon,
  Shield,
  Lock,
  Monitor,
  Mail,
  Gift,
  MessageSquare,
  ChevronRight,
  Info,
  User,
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const settingSections: SettingSection[] = [
  {
    id: 'account',
    title: 'Account Manager',
    description: 'User accounts & permissions',
    icon: <Shield className="w-6 h-6" />,
    href: '/dashboard/settings/account',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'permissions',
    title: 'Permission Manager',
    description: 'Manage user access levels',
    icon: <Lock className="w-6 h-6" />,
    href: '/dashboard/settings/permissions',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    id: 'workstations',
    title: 'Workstations',
    description: 'Terminals & devices',
    icon: <Monitor className="w-6 h-6" />,
    href: '/dashboard/settings/workstations',
    color: 'bg-slate-50 text-slate-600',
  },
  {
    id: 'email',
    title: 'Email System',
    description: 'Triggers & templates',
    icon: <Mail className="w-6 h-6" />,
    href: '/dashboard/settings/email',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'rewards',
    title: 'Reward Manager',
    description: 'Rewards & incentives',
    icon: <Gift className="w-6 h-6" />,
    href: '/dashboard/settings/rewards',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    id: 'suggestions',
    title: 'Suggestion Page',
    description: 'Report issues & suggestions',
    icon: <MessageSquare className="w-6 h-6" />,
    href: '/dashboard/settings/suggestions',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'about',
    title: 'About',
    description: 'Account & system information',
    icon: <Info className="w-6 h-6" />,
    href: '/dashboard/settings/about',
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full flex-col overflow-hidden bg-linear-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2 md:p-3">
            <SettingsIcon className="h-5 w-5 text-indigo-600 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Settings</h1>
            <p className="text-xs text-gray-500 md:text-sm">System configuration & preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="mx-auto ">
          {/* Profile Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">ACCOUNT</h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
            >
              <Link href="/dashboard/settings/profile">
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md md:p-5 cursor-pointer">
                  <div className="flex shrink-0 items-center justify-center rounded-lg p-3 bg-emerald-50 text-emerald-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">Profile</h3>
                    <p className="text-xs text-gray-500 md:text-sm">View & manage your profile information</p>
                  </div>
                  <div className="shrink-0 text-gray-400 transition-colors">
                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* General Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">GENERAL</h2>
            <div className="grid gap-3 md:gap-4">
              {settingSections.slice(0, 3).map((section, idx) => (
                <SettingCard key={section.id} section={section} index={idx} />
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">FEATURES</h2>
            <div className="grid gap-3 md:gap-4">
              {settingSections.slice(3).map((section, idx) => (
                <SettingCard key={section.id} section={section} index={idx + 3} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


function SettingCard({
  section,
  index,
}: {
  section: SettingSection;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={section.href}>
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md md:p-5">
          {/* Icon */}
          <div className={`flex shrink-0 items-center justify-center rounded-lg p-3 ${section.color}`}>
            {section.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">
              {section.title}
            </h3>
            <p className="text-xs text-gray-500 md:text-sm">{section.description}</p>
          </div>

          {/* Arrow */}
          <div className="shrink-0 text-gray-400 transition-colors group-hover:text-indigo-600">
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
