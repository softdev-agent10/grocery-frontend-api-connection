"use client";

import React, { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval } from "date-fns";
import { Calendar as CalendarIcon, Clock, TrendingUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock data for working hours
const MOCK_SESSIONS = [
    { date: new Date(), hours: 8.5, startTime: "08:30 AM", endTime: "05:00 PM", breakTime: "30 min" },
    { date: new Date(Date.now() - 86400000), hours: 7.2, startTime: "09:00 AM", endTime: "04:12 PM", breakTime: "45 min" },
    { date: new Date(Date.now() - 172800000), hours: 9.0, startTime: "08:00 AM", endTime: "05:00 PM", breakTime: "1 hour" },
    { date: new Date(Date.now() - 604800000), hours: 6.5, startTime: "10:00 AM", endTime: "04:30 PM", breakTime: "30 min" }, // Last week
];

export default function WorkingHourReport({ onClose }: { onClose: () => void }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [view, setView] = useState<"day" | "week" | "month">("day");
    const [selectedSession, setSelectedSession] = useState<typeof MOCK_SESSIONS[0] | null>(null);

    const getStats = () => {
        if (!date) return { totalHours: 0, sessionCount: 0, filtered: [] };

        let start: Date, end: Date;

        if (view === "day") {
            start = date;
            end = date;
        } else if (view === "week") {
            start = startOfWeek(date);
            end = endOfWeek(date);
        } else {
            start = startOfMonth(date);
            end = endOfMonth(date);
        }

        const filtered = MOCK_SESSIONS.filter(s => {
            if (view === "day") return isSameDay(s.date, date);
            return isWithinInterval(s.date, { start, end });
        });

        const totalHours = filtered.reduce((sum, s) => sum + s.hours, 0);
        return { totalHours, sessionCount: filtered.length, filtered };
    };

    const { totalHours, sessionCount, filtered } = getStats();

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden">
            {/* Custom Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Clock className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Working History</h2>
                        <p className="text-blue-100 text-xs font-medium">Track your performance and hours</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="size-6" />
                </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center justify-between">
                <div className="flex bg-white border rounded-xl p-1 shadow-sm">
                    {(["day", "week", "month"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => {
                                setView(v);
                                setSelectedSession(null);
                            }}
                            className={cn(
                                "px-6 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                                view === v ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 font-bold rounded-xl border-gray-200 hover:bg-white gap-2 shadow-sm bg-white">
                            <CalendarIcon className="size-4 text-blue-600" />
                            {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="p-3"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Session List */}
                <div className={`w-full xl:w-[350px] flex flex-col min-h-0 border-r ${selectedSession ? 'hidden xl:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                        {filtered.length > 0 ? (
                            filtered.map((session, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedSession(session)}
                                    className={`p-4 border-b cursor-pointer transition-all hover:bg-blue-50/50 ${selectedSession === session ? 'bg-blue-50 border-l-4 border-l-blue-600 pl-3' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800">Sales Session</span>
                                        <span className="font-black text-blue-600">{session.hours}h</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="size-3" />
                                            <span className="font-medium">{format(session.date, "MMM d, yyyy")}</span>
                                        </div>
                                        <span className="font-bold text-gray-400">{format(session.date, "EEEE")}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                    <Clock className="size-8 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">No activity found for this {view}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details & Stats */}
                <div className={`flex-1 flex flex-col min-h-0 bg-gray-50/50 ${selectedSession ? 'flex' : 'hidden xl:flex items-center justify-center'}`}>
                    <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 custom-scrollbar">
                        {/* Period Stats */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Period Summary</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-blue-600 rounded-xl">
                                        <Clock className="size-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1 leading-none">Total Hours</p>
                                        <p className="text-3xl font-black text-gray-900 leading-none">{totalHours.toFixed(1)}h</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-emerald-600 rounded-xl">
                                        <TrendingUp className="size-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1 leading-none">Sessions</p>
                                        <p className="text-3xl font-black text-gray-900 leading-none">{sessionCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedSession ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-1">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="xl:hidden p-0 h-auto" 
                                        onClick={() => setSelectedSession(null)}
                                    >
                                        <ChevronLeft className="size-5" />
                                    </Button>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Session Details</h3>
                                </div>
                                
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 space-y-6">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Role</p>
                                                <p className="text-xl font-black text-gray-800 uppercase">Cashier</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Duration</p>
                                                <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-lg font-black">
                                                    {selectedSession.hours}h
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Date</p>
                                                <div className="flex items-center gap-2 text-gray-700 font-bold">
                                                    <CalendarIcon className="size-4 text-blue-500" />
                                                    {format(selectedSession.date, "MMMM d, yyyy")}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Day</p>
                                                <div className="flex items-center gap-2 text-gray-700 font-bold">
                                                    <Clock className="size-4 text-emerald-500" />
                                                    {format(selectedSession.date, "EEEE")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-dashed">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Start Time</p>
                                                <p className="text-sm font-bold text-gray-700">{selectedSession.startTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">End Time</p>
                                                <p className="text-sm font-bold text-gray-700">{selectedSession.endTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Break</p>
                                                <p className="text-sm font-bold text-blue-600">{selectedSession.breakTime}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Note</p>
                                            <p className="text-sm text-gray-500 italic">No additional notes provided for this session.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-300">
                                <div className="p-8 bg-white border-2 border-dashed border-gray-100 rounded-full mb-6">
                                    <Clock className="size-16 opacity-10" />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Select a Session</h4>
                                <p className="text-sm font-medium max-w-xs">Click on any session from the list to view detailed information and notes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
