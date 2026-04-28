'use client';

import { useState, useEffect } from 'react';
import { getWorkstations, WorkstationData } from '@/app/services/workstation/service.workstation';
import { Search, Monitor, Store, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';


interface WorkstationModalProps {
    open: boolean;
    onSelect: (deviceId: string, workstation_id: number) => void;
    onSkip: () => void;
}

export function WorkstationModal({ open, onSelect, onSkip }: WorkstationModalProps) {
    const [workstations, setWorkstations] = useState<WorkstationData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Block Escape key when modal is open
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    // Fetch workstations when modal opens
    useEffect(() => {
        if (open && workstations.length === 0 && !loading) {
            setLoading(true);
            getWorkstations()
                .then((response) => {
                    setWorkstations(response.data.items || []);
                    setError(null);
                    // console.log('Fetched workstations:', response.data.items);
                })
                .catch((err) => {
                    console.error('Fetch workstations error:', err);
                    setError('Failed to load workstations. Please try again.');
                })
                .finally(() => setLoading(false));
        }
    }, []);

    // Filter workstations based on search
    const filteredWorkstations = workstations.filter(ws =>
        ws.register_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.device_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Monitor className="size-6 text-blue-600" />
                        Select Workstation
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Choose the workstation you are currently using
                    </p>
                </div>

                {/* Search input */}
                <div className="px-6 py-3 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by register name, merchant, or device ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-3">Loading workstations...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => {
                                    setLoading(false);
                                    setWorkstations([]);
                                    // trigger refetch
                                    setLoading(true);
                                    getWorkstations()
                                        .then((response) => {
                                            setWorkstations(response.data.items || []);
                                            setError(null);
                                        })
                                        .catch((err) => setError('Failed to load workstations. Please try again.'))
                                        .finally(() => setLoading(false));
                                }}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredWorkstations.length === 0 && (
                        <div className="text-center py-12">
                            <Store className="size-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {searchTerm ? 'No workstations match your search.' : 'No workstations found.'}
                            </p>
                        </div>
                    )}

                    {!loading && !error && filteredWorkstations.length > 0 && (
                        <ul className="space-y-3">
                            {filteredWorkstations.map((ws) => (
                                <li key={ws.device_id}>
                                    <button
                                        onClick={() => onSelect(ws.device_id, ws.id)}
                                        className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-800 text-lg">
                                                        {ws.register_name}
                                                    </h3>
                                                    {ws.is_active && !ws.is_blocked && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <CheckCircle className="size-3" />
                                                            Active
                                                        </span>
                                                    )}
                                                    {!ws.is_active && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            <XCircle className="size-3" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                    {ws.is_blocked && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <ShieldAlert className="size-3" />
                                                            Blocked
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                    <Store className="size-3" />
                                                    {ws.merchant_name}
                                                </p>
                                                <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                                                    {ws.merchant_city && ws.merchant_country && (
                                                        <p>{ws.merchant_city}, {ws.merchant_country}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CheckCircle className="size-5" />
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer with Skip button */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onSkip}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
}