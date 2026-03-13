import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PinKeypad from "./pin-keypad";
import UserQuickSelect, { QuickSelectItem } from "./user-quick-select";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

type Props = {
  employees: QuickSelectItem[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  pinLength: number;
  error: string;
  isSuccess?: boolean;
  onInput: (val: string) => void;
  onDelete: () => void;
  onClear: () => void;
};

export default function EmployeePane({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  pinLength,
  error,
  isSuccess,
  onInput,
  onDelete,
  onClear,
}: Props) {
  const selected = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );
  return (
    <div className="grid grid-cols-1 lg:[grid-template-columns:220px_1fr] gap-6">
      <div className="lg:pr-4 flex flex-col">
        <UserQuickSelect
          label="Select Staff"
          items={employees}
          selectedValue={selectedEmployeeId}
          onSelect={onSelectEmployee}
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-6 lg:pl-1 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-4 text-center py-10"
            >
              <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="size-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Login Successful</h3>
              <p className="text-gray-500 font-medium max-w-[240px]">
                Your session has been authenticated. You can now proceed with your duties.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 w-full"
            >
              <div className="flex justify-center gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "size-5 rounded-full transition-all duration-300",
                      pinLength > i ? "bg-blue-600 scale-125 shadow-xl shadow-blue-200" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full text-center text-red-500 text-xs font-black bg-red-50/80 py-4 rounded-[1.5rem] border border-red-100"
                >
                  {error}
                </motion.div>
              )}
              <div className="relative">
                <PinKeypad
                  onInput={onInput}
                  onDelete={onDelete}
                  onClear={onClear}
                  valueLength={pinLength}
                />
                {!selected && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-[2rem] z-10 border-2 border-dashed border-gray-100" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
