// components/bulk-upload/ImportModal.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useState, useRef } from 'react';

export function ImportModal({ isOpen, onClose, onUpload, isUploading }: any) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<'insert' | 'skip' | 'update'>('insert');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.csv')) setSelectedFile(file);
        else alert('Please select a CSV file');
    };

    const handleUpload = () => {
        if (selectedFile) onUpload(selectedFile, uploadMode);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold mb-4">Import Products</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Upload Mode</label>
                            <select value={uploadMode} onChange={(e) => setUploadMode(e.target.value as any)}
                                className="w-full border rounded-lg p-2">
                                <option value="insert">Insert only (skip duplicates)</option>
                                <option value="skip">Skip duplicates</option>
                                <option value="update">Update existing</option>
                            </select>
                        </div>
                        <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.name.endsWith('.csv')) setSelectedFile(file);
                            }}>
                            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                            <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                            <p>{selectedFile ? selectedFile.name : 'Click or drag CSV file'}</p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                            <button onClick={handleUpload} disabled={!selectedFile || isUploading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}