import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PinKeypad from "./pin-keypad";
import UserQuickSelect, { QuickSelectItem } from "./user-quick-select";
import { cn } from "@/lib/utils";

type Props = {
  employees: QuickSelectItem[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  pinLength: number;
  error: string;
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
  onInput,
  onDelete,
  onClear,
}: Props) {
  const selected = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );
  return (
    <div className="grid grid-cols-1 md:[grid-template-columns:200px_1fr] gap-4">
      <div className="md:pr-1 flex flex-col">
        <UserQuickSelect
          label="Select Staff"
          items={employees}
          selectedValue={selectedEmployeeId}
          onSelect={onSelectEmployee}
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-6 md:pl-1">
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
      </div>
    </div>
  );
}
