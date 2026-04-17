"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  RotateCw,
  Maximize,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ProfileDropdown } from "./ProfileDropdown";

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Update time every second
  useEffect(() => {
    const update = () => setCurrentTime(new Date());

    update(); // set immediately
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    }
  };

  if (!currentTime) return null;

  const handleRefresh = () => window.location.reload();

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Navbar */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-100 border-b border-gray-200 px-4 md:px-6 h-20 flex items-center justify-between shrink-0 sticky top-0 z-30"
        >
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-gray-600" />
            </motion.button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-50 px-4 py-2 rounded-lg w-full max-w-sm group border border-gray-100 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <Search size={16} className="text-gray-400 group-focus-within:text-blue-500 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none ml-3 text-sm w-full placeholder:text-gray-400"
              />
            </div>

            {/* Time Display */}
            <div className="hidden sm:flex flex-col items-end px-3 border-r border-gray-100 mr-2">
              <span className="text-[clamp(16px,2vw,20px)] font-bold text-gray-700 tabular-nums leading-none">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-[clamp(7px,0.9vw,9px)] text-blue-500 font-bold uppercase tracking-widest mt-1 text-right">
                {currentTime.toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Refresh"
            >
              <RotateCw size={20} />
            </motion.button>

            {/* Fullscreen Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullScreen}
              className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Toggle fullscreen"
            >
              <Maximize size={20} />
            </motion.button>

            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
                />
              </motion.button>
            </div>

            {/* Profile Dropdown */}
            <div className="pl-3 border-l border-gray-100">
              <ProfileDropdown
                isOpen={isProfileOpen}
                onToggle={() => setIsProfileOpen(!isProfileOpen)}
              />
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 overflow-y-auto bg-white p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};
