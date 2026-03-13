"use client";

import React, { useState, useMemo } from "react";
import { X, Clock, User, CheckCircle2, Search, ArrowLeft, ArrowRight, LogIn, LogOut, Coffee, CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PinPad } from "./pin-pad";

interface Employee {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

const EMPLOYEES: Employee[] = [
    { id: "c1", name: "John Cashier", role: "Cashier" },
    { id: "c2", name: "Jane Smith", role: "Cashier" },
    { id: "e1", name: "Sarah Stocker", role: "Inventory" },
    { id: "e2", name: "Leo Messi", role: "Inventory" },
    { id: "e3", name: "Cristiano", role: "Inventory" },
];

type AttendanceType = "in" | "out" | "break" | "meal";

interface AttendanceModalProps {
    onClose: () => void;
    initialType?: AttendanceType;
}

export default function AttendanceModal({ onClose, initialType = "in" }: AttendanceModalProps) {
    const [activeTab, setActiveTab] = useState<AttendanceType>(initialType);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const filteredEmployees = useMemo(() => {
        return EMPLOYEES.filter(emp => 
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handlePinSuccess = () => {
        setIsSuccess(true);
        // In a real app, this would call an attendance API
    };

    const handleSelectEmployee = (emp: Employee) => {
        setSelectedEmployee(emp);
        setIsSuccess(false);
    };

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Clock className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Staff Attendance</h2>
                        <p className="text-blue-100 text-xs font-medium">Clock in or out for your shift</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="size-6" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-gray-50/50 p-1">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab("in");
                        setSelectedEmployee(null);
                        setIsSuccess(false);
                    }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl border-2",
                        activeTab === "in" 
                            ? "bg-white text-blue-600 shadow-sm border-blue-100" 
                            : "text-gray-400 hover:text-gray-600 border-transparent"
                    )}
                >
                    <LogIn className="size-4" />
                    Clock In
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab("out");
                        setSelectedEmployee(null);
                        setIsSuccess(false);
                    }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl border-2",
                        activeTab === "out" 
                            ? "bg-white text-blue-600 shadow-sm border-blue-100" 
                            : "text-gray-400 hover:text-gray-600 border-transparent"
                    )}
                >
                    <LogOut className="size-4" />
                    Clock Out
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab("break");
                        setSelectedEmployee(null);
                        setIsSuccess(false);
                    }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl border-2",
                        activeTab === "break" 
                            ? "bg-white text-blue-600 shadow-sm border-blue-100" 
                            : "text-gray-400 hover:text-gray-600 border-transparent"
                    )}
                >
                    <Coffee className="size-4" />
                    Break
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab("meal");
                        setSelectedEmployee(null);
                        setIsSuccess(false);
                    }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl border-2",
                        activeTab === "meal" 
                            ? "bg-white text-blue-600 shadow-sm border-blue-100" 
                            : "text-gray-400 hover:text-gray-600 border-transparent"
                    )}
                >
                    <CookingPot className="size-4" />
                    Meal
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Employee List */}
                <div className={cn(
                    "w-full xl:w-[350px] flex flex-col min-h-0 border-r transition-all",
                    selectedEmployee ? "hidden xl:flex" : "flex"
                )}>
                    <div className="p-4 bg-gray-50 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input 
                                placeholder="Search staff name or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 border-gray-200 focus:ring-blue-500 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                        {filteredEmployees.map((emp) => (
                            <div
                                key={emp.id}
                                onClick={() => handleSelectEmployee(emp)}
                                className={cn(
                                    "p-4 border-b cursor-pointer transition-all hover:bg-blue-50/50 flex items-center justify-between",
                                    selectedEmployee?.id === emp.id ? "bg-blue-50 border-l-4 border-l-blue-600 pl-3" : ""
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User className="size-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{emp.name}</p>
                                        <p className="text-xs text-gray-400 font-medium">{emp.role}</p>
                                    </div>
                                </div>
                                <ChevronRight className="size-4 text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: PIN Pad or Success */}
                <div className={cn(
                    "flex-1 flex flex-col min-h-0 bg-gray-50/50 items-center justify-center p-4 overflow-y-auto custom-scrollbar",
                    selectedEmployee ? "flex" : "hidden xl:flex"
                )}>
                    {selectedEmployee ? (
                        <div className="w-full max-w-md py-4">
                            {isSuccess ? (
                                <div className="flex flex-col items-center justify-center py-8 px-6 bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300 text-center">
                                    <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-50">
                                        <CheckCircle2 className="size-12 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1">
                                        {activeTab === "in" ? "Clocked In!" : 
                                         activeTab === "out" ? "Clocked Out!" :
                                         activeTab === "break" ? "Break Started!" : "Meal Started!"}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium mb-6">
                                        {activeTab === "in" 
                                            ? `Shift started at ${new Date().toLocaleTimeString()}. Have a great shift, ${selectedEmployee.name.split(' ')[0]}!` 
                                            : activeTab === "out"
                                            ? `Shift ended at ${new Date().toLocaleTimeString()}. Rest well, ${selectedEmployee.name.split(' ')[0]}!`
                                            : activeTab === "break"
                                            ? `Break started at ${new Date().toLocaleTimeString()}. See you in 15 mins, ${selectedEmployee.name.split(' ')[0]}!`
                                            : `Meal break started at ${new Date().toLocaleTimeString()}. Enjoy your meal, ${selectedEmployee.name.split(' ')[0]}!`}
                                    </p>
                                    <Button 
                                        onClick={() => {
                                            setSelectedEmployee(null);
                                            setIsSuccess(false);
                                        }}
                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95"
                                    >
                                        Done
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Button 
                                        variant="ghost" 
                                        className="xl:hidden flex items-center gap-2 text-gray-500 hover:text-gray-800 p-0 h-auto"
                                        onClick={() => setSelectedEmployee(null)}
                                    >
                                        <ArrowLeft className="size-4" />
                                        Back to Staff List
                                    </Button>
                                    
                                    <PinPad 
                                        correctPin="123456" 
                                        onSuccess={handlePinSuccess}
                                        onCancel={() => setSelectedEmployee(null)}
                                        title={`Verify Identity`}
                                        description={`Enter your 6-digit PIN to ${
                                            activeTab === "in" ? "clock in" : 
                                            activeTab === "out" ? "clock out" : 
                                            activeTab === "break" ? "start break" : "start meal"
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-10 max-w-sm opacity-50">
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 inline-block mb-6">
                                <User className="size-16 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tight mb-2">Select Staff</h3>
                            <p className="text-gray-400 text-sm font-medium">Please select an employee from the list to proceed with clocking in/out.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );
}
