// import { useEffect, useState } from 'react';

// interface User {
//     id: string;
//     email: string;
//     name: string;
//     branchId: string;
//     role: string;
// }

// interface AuthContext {
//     user: User | null;
//     token: string | null;
//     isLoading: boolean;
//     isAuthenticated: boolean;
//     logout: () => void;
// }

// export function useAuth(): AuthContext {
//     const [user, setUser] = useState<User | null>(null);
//     const [token, setToken] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         // Initialize auth from localStorage
//         const storedToken = localStorage.getItem('authToken');
//         const storedUser = localStorage.getItem('user');

//         if (storedToken && storedUser) {
//             setToken(storedToken);
//             try {
//                 setUser(JSON.parse(storedUser));
//             } catch (error) {
//                 console.error('Failed to parse stored user:', error);
//                 localStorage.removeItem('user');
//             }
//         }

//         setIsLoading(false);
//     }, []);

//     const logout = () => {
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('user');
//         setToken(null);
//         setUser(null);
//     };

//     return {
//         user,
//         token,
//         isLoading,
//         isAuthenticated: !!token && !!user,
//         logout,
//     };
// }
"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
  branchId?: string;
  role?: string;
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
    const storedToken = sessionStorage.getItem("jwt");
    const storedUser =
      sessionStorage.getItem("user") || sessionStorage.getItem("login_response");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed?.user || parsed?.data?.user || parsed);
      } catch {
        setUser({ id: "logged-in-user" });
      }
    } else if (storedToken) {
      setUser({ id: "logged-in-user" });
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("login_response");
    sessionStorage.removeItem("user");

    document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax";

    setToken(null);
    setUser(null);

    window.location.href = "/login";
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token),
    logout,
  };
}