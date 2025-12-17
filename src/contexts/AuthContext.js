import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { secureApi } from '../lib/secureApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // En production, on validerait le token via API
                // Pour l'instant on suppose qu'il est valide s'il existe
                // Ou on peut appeler /api/auth/me si ça existe
                setUser({ token });
            }
        } catch (error) {
            console.error("Auth check error", error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            // Stub for actual login logic depending on backend
            // Might need to update this based on actual auth API
            // const response = await secureApi.post('/auth/local', { identifier: email, password });
            // if (response.jwt) { ... }

            // For now, redirect to admin login if no direct method
            router.push('/admin');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
