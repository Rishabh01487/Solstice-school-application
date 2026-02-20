"use client";
import React, { useState, useEffect } from "react";
import { LS, Role, Notice } from "./types";
import LoginScreen from "./LoginScreen";
import PublicPage from "./PublicPage";
import AdminDashboard from "./AdminDashboard";
import { TeacherDashboard, ParentDashboard } from "./RoleDashboards";

export default function PreviewPage() {
    const [role, setRole] = useState<Role>(null);
    const [email, setEmail] = useState("");
    const [showPublic, setShowPublic] = useState(true);
    const [notices, setNotices] = useState<Notice[]>([]);

    useEffect(() => {
        // Restore session
        const savedRole = LS.get<Role>("role", null);
        const savedEmail = LS.get<string>("email", "");
        if (savedRole && savedEmail) { setRole(savedRole); setEmail(savedEmail); setShowPublic(false); }
        // Load notices for public page
        setNotices(LS.get<Notice[]>("notices", []));
    }, []);

    const handleLogin = (r: Role, e: string) => {
        setRole(r); setEmail(e); setShowPublic(false);
        LS.set("role", r); LS.set("email", e);
    };

    const handleLogout = () => {
        setRole(null); setEmail(""); setShowPublic(true);
        LS.set("role", null); LS.set("email", "");
    };

    // Public page (no login required)
    if (showPublic && !role) {
        return <PublicPage notices={notices} onLoginClick={() => setShowPublic(false)} />;
    }

    // Login screen
    if (!role) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // Role-based dashboards
    if (role === "admin") return <AdminDashboard email={email} onLogout={handleLogout} />;
    if (role === "teacher") return <TeacherDashboard email={email} onLogout={handleLogout} />;
    if (role === "parent") return <ParentDashboard email={email} onLogout={handleLogout} />;

    return null;
}
