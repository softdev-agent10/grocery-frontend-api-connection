import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onInput: (val: string) => void;
  onDelete: () => void;
  onClear: () => void;
  valueLength: number;
};

export default function PinKeypad({ onInput, onDelete, onClear, valueLength }: Props) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
      {keys.map((key) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          className={cn(
            "h-14 text-xl font-bold rounded-2xl border-2 transition-all active:scale-95 shadow-sm",
            key === "C" ? "text-red-500 hover:bg-red-50 border-red-100" :
            key === "⌫" ? "text-amber-500 hover:bg-amber-50 border-amber-100" :
            "hover:bg-blue-50 hover:border-blue-200 text-gray-700"
          )}
          onClick={() => {
            if (key === "C") onClear();
            else if (key === "⌫") onDelete();
            else if (valueLength < 6) onInput(key);
          }}
        >
          {key}
        </Button>
      ))}
    </div>
  );
}

