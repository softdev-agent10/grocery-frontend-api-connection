import React from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type QuickSelectItem = {
  id: string;
  name: string;
  value: string;
  avatar?: string;
  subtitle?: string;
};

type Props = {
  label: string;
  items: QuickSelectItem[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
};

export default function UserQuickSelect({ label, items, selectedValue, onSelect }: Props) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 px-1">{label}</Label>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 max-h-100">
        {items.map((u) => {
          const isSelected = selectedValue === u.value || selectedValue === u.id;
          return (
            <button
              key={u.id}
              onClick={() => onSelect(u.value)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 group",
                isSelected 
                  ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100/50 -translate-y-0.5" 
                  : "border-gray-50 bg-gray-50/30 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              <Avatar className={cn(
                "size-10 border-2 transition-all duration-300", 
                isSelected ? "border-blue-200 scale-110 shadow-sm" : "border-white"
              )}>
                <AvatarImage src={u.avatar} />
                <AvatarFallback className={cn(
                  "font-black text-xs", 
                  isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  {u.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0 flex-1">
                <div className={cn(
                  "text-[13px] font-black truncate leading-tight tracking-tight", 
                  isSelected ? "text-blue-900" : "text-gray-900"
                )}>
                  {u.name}
                </div>
                {u.subtitle && (
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate", 
                    isSelected ? "text-blue-600" : "text-gray-400"
                  )}>
                    {u.subtitle}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

