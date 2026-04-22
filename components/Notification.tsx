'use client';

import { CirclePlus, X, AlertCircle, Info } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export function Notification({ message, type }: NotificationProps) {
    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 border-green-400 text-white';
            case 'error':
                return 'bg-red-500 border-red-400 text-white';
            case 'warning':
                return 'bg-yellow-500 border-yellow-400 text-white';
            case 'info':
                return 'bg-blue-500 border-blue-400 text-white';
            default:
                return 'bg-slate-500 border-slate-400 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CirclePlus className="size-5" />;
            case 'error':
                return <X className="size-5" />;
            case 'warning':
                return <AlertCircle className="size-5" />;
            case 'info':
                return <Info className="size-5" />;
            default:
                return <Info className="size-5" />;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-9999 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`px-6 py-3 rounded-xl shadow-2xl border-2 flex items-center gap-3 ${getStyles()}`}>
                <div className="bg-white/20 p-1 rounded-full">
                    {getIcon()}
                </div>
                <p className="font-bold text-lg">{message}</p>
            </div>
        </div>
    );
}
