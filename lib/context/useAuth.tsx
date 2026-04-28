import { useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    branchId: string;
    role: string;
}

interface AuthContext {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
}

export function useAuth(): AuthContext {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize auth from localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }

        setIsLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        logout,
    };
}