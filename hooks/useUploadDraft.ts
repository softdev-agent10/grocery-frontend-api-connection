import { useCallback, useEffect, useState } from 'react';

export interface UploadDraft {
    id: string;
    csvData: any[];
    failedRows: Record<number, { error_code: string; error_message: string; failed_fields: string[] }>;
    uploadSummary: any;
    originalCsvData: any[];
    uploadMode: "insert" | "skip" | "update";
    timestamp: number;
    branchId: string;
}

const DB_NAME = 'GroceryFrontendDB';
const STORE_NAME = 'uploadDrafts';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Save draft to IndexedDB
const saveDraft = async (draft: UploadDraft): Promise<void> => {
    try {
        const database = await initDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise((resolve, reject) => {
            const request = store.put(draft);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(undefined);
        });
    } catch (error) {
        console.error('Failed to save draft to IndexedDB:', error);
        throw error;
    }
};

// Get draft from IndexedDB
const getDraft = async (branchId: string): Promise<UploadDraft | null> => {
    try {
        const database = await initDB();
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get(branchId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    } catch (error) {
        console.error('Failed to get draft from IndexedDB:', error);
        return null;
    }
};

// Get all drafts
const getAllDrafts = async (): Promise<UploadDraft[]> => {
    try {
        const database = await initDB();
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || []);
        });
    } catch (error) {
        console.error('Failed to get all drafts from IndexedDB:', error);
        return [];
    }
};

// Delete draft from IndexedDB
const deleteDraft = async (branchId: string): Promise<void> => {
    try {
        const database = await initDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise((resolve, reject) => {
            const request = store.delete(branchId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(undefined);
        });
    } catch (error) {
        console.error('Failed to delete draft from IndexedDB:', error);
        throw error;
    }
};

// Clear all drafts
const clearAllDrafts = async (): Promise<void> => {
    try {
        const database = await initDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise((resolve, reject) => {
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(undefined);
        });
    } catch (error) {
        console.error('Failed to clear all drafts from IndexedDB:', error);
        throw error;
    }
};

// Custom hook for managing upload drafts
export const useUploadDraft = (branchId: string) => {
    const [savedDraft, setSavedDraft] = useState<UploadDraft | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load draft on mount
    useEffect(() => {
        const loadDraft = async () => {
            setIsLoading(true);
            try {
                const draft = await getDraft(branchId);
                setSavedDraft(draft);
            } catch (error) {
                console.error('Error loading draft:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDraft();
    }, [branchId]);

    const save = useCallback(
        async (draft: Omit<UploadDraft, 'id' | 'timestamp' | 'branchId'>) => {
            try {
                const completeDraft: UploadDraft = {
                    ...draft,
                    id: branchId,
                    branchId: branchId,
                    timestamp: Date.now(),
                };
                await saveDraft(completeDraft);
                setSavedDraft(completeDraft);
                return completeDraft;
            } catch (error) {
                console.error('Error saving draft:', error);
                throw error;
            }
        },
        [branchId]
    );

    const removeDraft = useCallback(async () => {
        try {
            await deleteDraft(branchId);
            setSavedDraft(null);
        } catch (error) {
            console.error('Error removing draft:', error);
            throw error;
        }
    }, [branchId]);

    const clear = useCallback(async () => {
        try {
            await clearAllDrafts();
            setSavedDraft(null);
        } catch (error) {
            console.error('Error clearing drafts:', error);
            throw error;
        }
    }, []);

    return {
        savedDraft,
        isLoading,
        save,
        removeDraft,
        clear,
    };
};

export default useUploadDraft;
