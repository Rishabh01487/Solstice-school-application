"use client";

import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Divider,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Chip,
} from "@mui/material";
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Google,
    AutoAwesome,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const DEMO_CREDENTIALS = [
    { role: "Admin", email: "admin@edunexus.school", password: "admin123", color: "#FF6B6B" },
    { role: "Teacher", email: "sarah.johnson@edunexus.school", password: "teacher123", color: "#4ECDC4" },
    { role: "Student", email: "aiden.martinez@student.edunexus.school", password: "student123", color: "#45B7D1" },
    { role: "Parent", email: "robert.martinez.parent@edunexus.school", password: "parent123", color: "#96CEB4" },
];

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { signInWithEmail, signInWithGoogle } = useAuth();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    if (isAuthenticated) {
        router.push("/dashboard");
        return null;
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            await signInWithEmail(email, password);
        } catch {
            setError("Invalid credentials. Please check your email and password.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
        } catch {
            setError("Google sign-in failed. Please try again.");
        } finally {
            setGoogleLoading(false);
        }
    };

    const fillDemo = (cred: (typeof DEMO_CREDENTIALS)[0]) => {
        setEmail(cred.email);
        setPassword(cred.password);
        setError("");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(ellipse at 30% 50%, rgba(27,77,62,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(255,215,0,0.06) 0%, transparent 50%), #0A0E1A",
                p: 2,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Floating orbs */}
            <Box sx={{
                position: "absolute", top: "10%", left: "5%", width: 300, height: 300,
                borderRadius: "50%", background: "rgba(27,77,62,0.08)",
                filter: "blur(60px)", animation: "float 6s ease-in-out infinite",
                "@keyframes float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-20px)" } }
            }} />
            <Box sx={{
                position: "absolute", bottom: "10%", right: "5%", width: 250, height: 250,
                borderRadius: "50%", background: "rgba(255,215,0,0.04)",
                filter: "blur(60px)", animation: "float 8s ease-in-out infinite 2s",
            }} />

            <Box sx={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
                {/* Logo */}
                <Box sx={{ textAlign: "center", mb: 4, animation: "fadeIn 0.6s ease" }}>
                    <Box sx={{
                        display: "inline-flex", p: 1.5, borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(27,77,62,0.3), rgba(15,45,74,0.3))",
                        border: "1px solid rgba(255,215,0,0.3)", mb: 2,
                        boxShadow: "0 0 40px rgba(255,215,0,0.2), 0 0 80px rgba(46,204,113,0.1)",
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/ridgewood-logo.svg" alt="Ridgewood Educations" width={64} height={64} />
                    </Box>
                    <Typography variant="h4" fontWeight={800} sx={{
                        background: "linear-gradient(135deg, #FFD700, #2ECC71)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Ridgewood Educations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Student Information System
                    </Typography>
                </Box>

                <Card sx={{
                    background: "rgba(17,24,39,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(124,77,255,0.2)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Welcome back 👋
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Sign in to your account to continue
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Google Sign-In */}
                        <Button
                            id="google-signin-btn"
                            fullWidth
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || isLoading}
                            sx={{
                                py: 1.5, borderRadius: 2.5, mb: 3,
                                background: "#FFFFFF",
                                color: "#3C4043",
                                border: "1px solid #DADCE0",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                textTransform: "none",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                "&:hover": {
                                    background: "#F8F9FA",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                                    border: "1px solid #4285F4",
                                },
                                "&:disabled": {
                                    background: "rgba(255,255,255,0.7)",
                                    color: "rgba(60,64,67,0.6)",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            {googleLoading ? (
                                <CircularProgress size={18} sx={{ color: "#4285F4" }} />
                            ) : (
                                <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20, flexShrink: 0 }}>
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </Box>
                            )}
                            {googleLoading ? "Signing in..." : "Continue with Google"}
                        </Button>

                        <Divider sx={{ mb: 3, "&::before, &::after": { borderColor: "rgba(255,255,255,0.1)" } }}>
                            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                                OR
                            </Typography>
                        </Divider>

                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailLogin}>
                            <TextField
                                id="email-input"
                                fullWidth
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: "text.secondary", fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                                disabled={isLoading}
                            />
                            <TextField
                                id="password-input"
                                fullWidth
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: "text.secondary", fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                                disabled={isLoading}
                            />
                            <Button
                                id="login-btn"
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading || googleLoading}
                                sx={{
                                    py: 1.5, borderRadius: 2.5,
                                    background: "linear-gradient(135deg, #7C4DFF, #b47cff)",
                                    "&:hover": { background: "linear-gradient(135deg, #6B3EEE, #a06cef)" },
                                }}
                            >
                                {isLoading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <AutoAwesome sx={{ fontSize: 14, color: "#FFB74D" }} />
                                <Typography variant="caption" color="text.secondary">
                                    Quick access — demo credentials
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {DEMO_CREDENTIALS.map((cred) => (
                                    <Chip
                                        key={cred.role}
                                        id={`demo-${cred.role.toLowerCase()}`}
                                        label={cred.role}
                                        size="small"
                                        clickable
                                        onClick={() => fillDemo(cred)}
                                        sx={{
                                            borderColor: cred.color,
                                            color: cred.color,
                                            "&:hover": { background: `${cred.color}20` },
                                        }}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", mt: 3 }}
                >
                    © 2025 Ridgewood Educations. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
}
