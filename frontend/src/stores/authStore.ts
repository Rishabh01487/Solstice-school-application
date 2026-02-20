import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    is_active: boolean;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setUser: (user: User) => void;
    setTokens: (access: string, refresh: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: true }),
            setTokens: (access, refresh) =>
                set({ accessToken: access, refreshToken: refresh }),
            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),
            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: "solstice-auth",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
