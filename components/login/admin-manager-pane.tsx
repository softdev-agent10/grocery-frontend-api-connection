import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Fingerprint, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import UserQuickSelect, { QuickSelectItem } from "./user-quick-select";

type Props = {
  quickSelectItems: QuickSelectItem[];
  selectedEmail: string;
  onSelectEmail: (email: string) => void;
  step: 1 | 2;
  email: string;
  password: string;
  otp: string;
  isLoading: boolean;
  error: string;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onChangeOtp: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToCredentials: () => void;
};

export default function AdminManagerPane({
  quickSelectItems,
  selectedEmail,
  onSelectEmail,
  step,
  email,
  password,
  otp,
  isLoading,
  error,
  onChangeEmail,
  onChangePassword,
  onChangeOtp,
  onSubmit,
  onBackToCredentials,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:[grid-template-columns:200px_1fr] gap-4">
      <div className="md:pr-1">
        <UserQuickSelect
          label="Select Account"
          items={quickSelectItems}
          selectedValue={selectedEmail || null}
          onSelect={onSelectEmail}
        />
      </div>
      <form onSubmit={onSubmit} className="space-y-4 md:pl-1">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    value={email}
                    onChange={(e) => onChangeEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-14 pl-12 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all bg-gray-50/30"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => onChangePassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 pl-12 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all bg-gray-50/30"
                    required
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-center"
            >
              <div className="size-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Fingerprint className="size-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Verification Required</h3>
                <p className="text-sm text-gray-500">We've sent a 6-digit OTP to your email.</p>
              </div>
              <div className="space-y-2">
                <Input
                  value={otp}
                  onChange={(e) => onChangeOtp(e.target.value)}
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50/30"
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-blue-600 font-bold hover:text-blue-700"
                onClick={onBackToCredentials}
              >
                Change Credentials
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100"
          >
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{step === 1 ? "Continue" : "Login to Dashboard"}</span>
              <ArrowRight className="size-5" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
