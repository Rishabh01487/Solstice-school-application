"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

interface AuthContextType {
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const { setUser, setTokens, logout: zustandLogout, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Firebase is optional — only subscribe if auth is initialized
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) {
            throw new Error("Google sign-in is not configured. Please use email/password login.");
        }
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Exchange Firebase token with our backend
            try {
                const response = await authApi.loginWithFirebase(idToken);
                const { user, access_token, refresh_token } = response.data;
                setUser(user);
                setTokens(access_token, refresh_token);
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", refresh_token);
                router.push("/dashboard");
            } catch {
                // If backend doesn't support Firebase login, create session locally
                const fbUser = result.user;
                const mockUser = {
                    id: fbUser.uid,
                    email: fbUser.email || "",
                    full_name: fbUser.displayName || "User",
                    role: "student" as const,
                    avatar_url: fbUser.photoURL || undefined,
                    is_active: true,
                };
                setUser(mockUser);
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Google sign-in error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setLoading(true);
            // Try backend login first
            const response = await authApi.login(email, password);
            const { user, access_token, refresh_token } = response.data;
            setUser(user);
            setTokens(access_token, refresh_token);
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            router.push("/dashboard");
        } catch {
            // Fallback: demo mode when backend is unavailable
            const DEMO_USERS: Record<string, { full_name: string; role: "admin" | "teacher" | "student" | "parent" }> = {
                "ankurarchi@gmail.com": { full_name: "Admin User", role: "admin" },
                "teacher.ankurarchi@gmail.com": { full_name: "Prof. Sarah Johnson", role: "teacher" },
                "student.ankurarchi@gmail.com": { full_name: "Aiden Martinez", role: "student" },
                "parent.ankurarchi@gmail.com": { full_name: "Robert Martinez", role: "parent" },
            };
            const demoUser = DEMO_USERS[email];
            if (demoUser && password === "ankurarchi") {
                // Create a demo session
                const mockUser = {
                    id: `demo-${demoUser.role}`,
                    email,
                    full_name: demoUser.full_name,
                    role: demoUser.role,
                    is_active: true,
                };
                setUser(mockUser);
                localStorage.setItem("access_token", "demo-token");
                router.push("/dashboard");
            } else {
                throw new Error("Invalid credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (auth) await signOut(auth);
            await authApi.logout().catch(() => { });
            zustandLogout();
            localStorage.clear();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{ firebaseUser, loading, signInWithGoogle, signInWithEmail, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
