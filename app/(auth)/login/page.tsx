/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  UserCircle,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminManagerPane from "@/components/login/admin-manager-pane";
import EmployeePane from "@/components/login/employee-pane";
import type { QuickSelectItem } from "@/components/login/user-quick-select";
import { getUsers } from "@/app/services/settings/users/service.users";
import { loginUser } from "@/app/services/settings/login/service.login";
import { useAuth } from "@/lib/context/useAuth";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<
    "admin" | "manager" | "cashier" | "employee"
  >("cashier");

  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const { user } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await getUsers();

        // console.log("FULL USERS API RESPONSE:", res);

        const apiUsers =
          res.data?.data?.items ||
          res.data?.items ||
          res.data?.data ||
          [];

        // console.log("FINAL USERS:", apiUsers);
        // console.log(
        //   " USER ROLES:",
        //   apiUsers.map((u: any) => u.role)
        // );

        setUsers(apiUsers);
      } catch (err) {
        console.error(" Failed to load users:", err);
      }
    };

    loadUsers();
  }, []);

  const adminUsers = users.filter((u) => u.role === "admin");
  const managerUsers = users.filter(
    (u) => u.role === "sub-admin" || u.role === "manager"
  );
  const cashierUsers = users.filter((u) => u.role === "cashier");
  const employeeUsers = users.filter((u) => u.role === "employee");


  const getAvatar = (name?: string) =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

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

  const handleUserSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setError("");
  };

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

  const handleAdminManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 1000));

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

    try {
      const selectedUser = users.find(
        (u: any) => String(u.id) === String(selectedEmployeeId)
      );

      if (!selectedUser) {
        setError("Please select an employee");
        setPin("");
        return;
      }

      const loginPayload = {
        user_name:
          selectedUser.username ||
          selectedUser.user_name ||
          selectedUser.email,
        password: employeePin,
      };

      // console.log("SELECTED EMPLOYEE:", selectedUser);
      // console.log("EMPLOYEE LOGIN PAYLOAD:", loginPayload);

      const res = await loginUser(loginPayload);

      // console.log("EMPLOYEE LOGIN SUCCESS:", res);

      if (typeof window !== "undefined") {
        localStorage.setItem("login_user", JSON.stringify(selectedUser));
        localStorage.setItem("login_response", JSON.stringify(res));
      }

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
    } catch (err: any) {
      console.error("Employee login failed:", err);
      setError(err.message || "Incorrect PIN. Please try again.");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[800px] bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border border-gray-100 relative z-10 overflow-hidden"
      >
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
                  isActive
                    ? "text-white shadow-lg"
                    : "text-gray-500 hover:bg-gray-200/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}

                <Icon
                  className={cn(
                    "size-4 relative z-10",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "admin" || activeTab === "manager" ? (
              <motion.div
                key={`${activeTab}-pane`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AdminManagerPane
                  quickSelectItems={(
                    activeTab === "admin" ? adminUsers : managerUsers
                  ).map((u: any) => ({
                    id: String(u.id),
                    name: u.full_name || u.username || "Unknown User",
                    value: u.email,
                    avatar: getAvatar(u.full_name || u.username),
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
              <motion.div
                key={`${activeTab}-pane`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <EmployeePane
                  employees={(
                    activeTab === "cashier" ? cashierUsers : employeeUsers
                  ).map((u: any) => ({
                    id: String(u.id),
                    name: u.full_name || u.username || "Unknown User",
                    value: String(u.id),
                    avatar: getAvatar(u.full_name || u.username),
                    subtitle:
                      u.role === "sub-admin"
                        ? "Manager"
                        : u.role
                          ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
                          : "User",
                  })) as QuickSelectItem[]}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={setSelectedEmployeeId}
                  pinLength={pin.length}
                  error={error}
                  isSuccess={isSuccess}
                  onInput={handlePinInput}
                  onDelete={() => setPin((prev) => prev.slice(0, -1))}
                  onClear={() => setPin("")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 py-4 bg-gray-50/50 border-t flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Version 2.4.0</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-green-500" />
            <span>Secure Terminal</span>
          </div>
        </div>
      </motion.div>

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