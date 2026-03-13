/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  UserCircle, 
  Briefcase, 
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminManagerPane from "@/components/login/admin-manager-pane";
import EmployeePane from "@/components/login/employee-pane";
import type { QuickSelectItem } from "@/components/login/user-quick-select";

const ADMINS = [
  { id: "a1", name: "Super Admin", email: "admin@onebalance.com", avatar: "" },
  { id: "a2", name: "System Controller", email: "system@onebalance.com", avatar: "" },
];

const MANAGERS = [
  { id: "m1", name: "Store Manager", email: "manager@onebalance.com", avatar: "" },
  { id: "m2", name: "Shift Lead", email: "shift@onebalance.com", avatar: "" },
];

const CASHIERS = [
  { id: "c1", name: "John Cashier", role: "Cashier", avatar: "" },
  { id: "c2", name: "Jane Smith", role: "Cashier", avatar: "" },
];

const EMPLOYEES = [
  { id: "e1", name: "Sarah Stocker", role: "Inventory", avatar: "" },
  { id: "e2", name: "Leo Messi", role: "Inventory", avatar: "" },
  { id: "e3", name: "Cristiano", role: "Inventory", avatar: "" },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "manager" | "cashier" | "employee">("cashier");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Password, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Handle Tab Change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setOtp("");
    setPin("");
    setStep(1);
    setError("");
    setIsSuccess(false);
    setSelectedEmployeeId(null);
  };

  // Admin/Manager Select
  const handleUserSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setError("");
  };

  // Handle PIN input
  const handlePinInput = (val: string) => {
    if (!selectedEmployeeId) {
      setError("Please select an employee");
      return;
    }
    if (pin.length < 6) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 6) {
        handleEmployeeLogin(newPin);
      }
    }
  };

  // Mock Logins
  const handleAdminManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Mock delay
    await new Promise(r => setTimeout(r, 1000));
    
    if (step === 1) {
      if (password === "password") {
        setStep(2);
      } else {
        setError("Invalid credentials");
      }
    } else {
      if (otp === "123456") {
        window.location.href = "/dashboard";
      } else {
        setError("Invalid OTP code");
      }
    }
    setIsLoading(false);
  };

  const handleEmployeeLogin = async (employeePin: string) => {
    setIsLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    
    if (employeePin === "123456") {
      if (activeTab === "cashier") {
        window.location.href = "/sales";
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPin("");
          setSelectedEmployeeId(null);
        }, 3000);
      }
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="inline-flex items-center justify-center mb-4">
          <Image 
            src="/assets/logo-light.svg" 
            alt="OneBalance Logo" 
            width={280} 
            height={80} 
            priority
            className="h-24 w-auto"
          />
        </div>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[800px] bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border border-gray-100 relative z-10 overflow-hidden"
      >
        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex p-2 bg-gray-50/80 border-b gap-1">
          {[
            { id: "admin", label: "Admin", icon: ShieldCheck },
            { id: "manager", label: "Manager", icon: Briefcase },
            { id: "cashier", label: "Cashier", icon: UserCircle },
            { id: "employee", label: "Employee", icon: UserCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all relative overflow-hidden sm:flex-1",
                  isActive ? "text-white shadow-lg" : "text-gray-500 hover:bg-gray-200/50"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" 
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("size-4 relative z-10", isActive ? "text-white" : "text-gray-400")} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {(activeTab === "admin" || activeTab === "manager") ? (
              <motion.div key={`${activeTab}-pane`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <AdminManagerPane
                  quickSelectItems={((activeTab === "admin" ? ADMINS : MANAGERS) as any).map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    value: u.email,
                    avatar: u.avatar,
                  })) as QuickSelectItem[]}
                  selectedEmail={email}
                  onSelectEmail={handleUserSelect}
                  step={step}
                  email={email}
                  password={password}
                  otp={otp}
                  isLoading={isLoading}
                  error={error}
                  onChangeEmail={setEmail}
                  onChangePassword={setPassword}
                  onChangeOtp={setOtp}
                  onSubmit={handleAdminManagerLogin}
                  onBackToCredentials={() => setStep(1)}
                />
              </motion.div>
            ) : (
              <motion.div key={`${activeTab}-pane`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <EmployeePane
                  employees={((activeTab === "cashier" ? CASHIERS : EMPLOYEES) as any).map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    value: e.id,
                    avatar: e.avatar,
                    subtitle: e.role,
                  })) as QuickSelectItem[]}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={setSelectedEmployeeId}
                  pinLength={pin.length}
                  error={error}
                  isSuccess={isSuccess}
                  onInput={handlePinInput}
                  onDelete={() => setPin(prev => prev.slice(0, -1))}
                  onClear={() => setPin("")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer Info */}
        <div className="px-8 py-4 bg-gray-50/50 border-t flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Version 2.4.0</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-green-500" />
            <span>Secure Terminal</span>
          </div>
        </div>
      </motion.div>
      
      {/* Footer Branding */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-gray-400 text-sm font-medium"
      >
        © 2026 OneBalance POS. All rights reserved.
      </motion.p>
    </div>
  );
}
