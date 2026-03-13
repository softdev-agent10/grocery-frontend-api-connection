"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { LogOut, UserCircle, User } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onToggle,
}) => {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.15 },
    }),
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-3 pl-3 border-l border-gray-100 cursor-pointer group
          transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        `}
        aria-label="Toggle profile menu"
        aria-expanded={isOpen}
      >
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[clamp(11px,1.2vw,13px)] font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
            Imran Nazir
          </span>
          <span className="text-[clamp(9px,1vw,10px)] text-green-500 font-medium flex items-center gap-1">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-green-500 rounded-full"
            />
            Online
          </span>
        </div>
        <motion.div
          animate={{
            backgroundColor: isOpen ? "rgb(37, 99, 235)" : "rgb(219, 234, 254)",
            color: isOpen ? "white" : "rgb(37, 99, 235)",
          }}
          transition={{ duration: 0.2 }}
          className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all"
        >
          <User size={18} className="shrink-0" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right"
          >
            {/* Header */}
            <motion.div
              custom={0}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="px-4 py-3 border-b border-gray-50 mb-1 text-left"
            >
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Super Admin
              </p>
              <p className="text-sm font-bold text-gray-800">imran@gmail.com</p>
            </motion.div>

            {/* Menu Items */}
            <div className="px-2 space-y-1">
              <motion.button
                custom={1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group"
              >
                <UserCircle size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
                <span>My Profile</span>
              </motion.button>

              <motion.button
                custom={2}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onToggle();
                  setLogoutConfirmOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 text-left focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 group mt-1"
              >
                <LogOut size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        variant="destructive"
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to sign in again to access the dashboard."
        confirmText="Logout"
        onConfirm={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
      />
    </div>
  );
};
