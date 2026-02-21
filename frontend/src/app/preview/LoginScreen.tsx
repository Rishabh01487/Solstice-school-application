"use client";
import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Button, TextField, InputAdornment, IconButton, Alert, Divider, Chip, Avatar, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff, School as SchoolIcon } from "@mui/icons-material";
import { SCHOOL, RED, Role } from "./types";

const GoogleSVG = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

interface Props { onLogin: (role: Role, email: string) => void; }

export default function LoginScreen({ onLogin }: Props) {
    const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
    const [showP, setShowP] = useState(false); const [err, setErr] = useState("");
    const [googlePick, setGooglePick] = useState(false); const [gLoading, setGLoading] = useState(false);

    const login = () => {
        if (email === "ankurarchi@gmail.com" && pass === "ankurarchi") return onLogin("admin", email);
        if (email === "teacher.ankurarchi@gmail.com" && pass === "ankurarchi") return onLogin("teacher", email);
        if (email === "parent.ankurarchi@gmail.com" && pass === "ankurarchi") return onLogin("parent", email);
        setErr("Invalid credentials. Check demo accounts below.");
    };

    const handleGoogle = async () => {
        setGLoading(true);
        try {
            const { signInWithGoogle, isConfigured } = await import("@/lib/firebase") as any;
            if (!isConfigured) { setGooglePick(true); setGLoading(false); return; }
            const r = await signInWithGoogle?.();
            if (r?.success) setGooglePick(true); else setErr("Google sign-in failed");
        } catch { setGooglePick(true); }
        setGLoading(false);
    };

    const googleRole = (role: Role) => {
        const emails: Record<string, string> = { admin: "ankurarchi@gmail.com", teacher: "teacher.ankurarchi@gmail.com", parent: "parent.ankurarchi@gmail.com" };
        onLogin(role, emails[role!] || "");
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fff 0%,#FEF2F2 50%,#fff 100%)" }}>
            <Card sx={{ maxWidth: 420, width: "100%", mx: 2, boxShadow: "0 8px 40px rgba(220,38,38,0.1)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Box sx={{ width: 64, height: 64, mx: "auto", mb: 1.5, borderRadius: "18px", background: `linear-gradient(135deg,${RED},#EF4444)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(220,38,38,0.3)" }}>
                            <SchoolIcon sx={{ fontSize: 32, color: "#fff" }} />
                        </Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color: RED }}>{SCHOOL.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Student Information System</Typography>
                        <Typography variant="caption" sx={{ display: "block", color: "#9CA3AF", fontSize: "0.7rem" }}>
                            Director: {SCHOOL.director} · {SCHOOL.address}
                        </Typography>
                    </Box>

                    {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr("")}>{err}</Alert>}

                    <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: "#9CA3AF" }} /></InputAdornment> }} />
                    <TextField fullWidth label="Password" type={showP ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: "#9CA3AF" }} /></InputAdornment>,
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowP(!showP)} size="small">{showP ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment>
                        }} />

                    <Button fullWidth variant="contained" size="large" onClick={login} sx={{ mb: 2, py: 1.3 }}>Sign In</Button>

                    <Button fullWidth onClick={handleGoogle} disabled={gLoading} sx={{ mb: 2, py: 1.3, background: "#fff", color: "#3C4043", border: "1px solid #DADCE0", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", display: "flex", gap: 1.5, "&:hover": { background: "#F8F9FA", borderColor: "#4285F4", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" } }}>
                        <GoogleSVG />{gLoading ? "Connecting…" : "Sign in with Google"}
                    </Button>

                    <Divider sx={{ mb: 2 }}><Chip label="Demo Accounts" size="small" /></Divider>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: "#FEF2F2", fontSize: "0.72rem", lineHeight: 2.2, color: "#6B7280" }}>
                        <b style={{ color: RED }}>Admin:</b> ankurarchi@gmail.com / ankurarchi<br />
                        <b style={{ color: RED }}>Teacher:</b> teacher.ankurarchi@gmail.com / ankurarchi<br />
                        <b style={{ color: RED }}>Parent:</b> parent.ankurarchi@gmail.com / ankurarchi
                    </Box>
                </CardContent>
            </Card>

            <Dialog open={googlePick} onClose={() => setGooglePick(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>Sign in with Google — Select Role</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                        {([["admin", "Admin", "Full school management", "#DC2626"], ["teacher", "Teacher", "Mark attendance & manage class", "#2563EB"], ["parent", "Parent", "View your child's details", "#16A34A"]] as [Role, string, string, string][]).map(([role, label, desc, color]) => (
                            <Button key={role} variant="outlined" size="large" onClick={() => { setGooglePick(false); googleRole(role); }}
                                startIcon={<Avatar sx={{ width: 28, height: 28, background: color, fontSize: "0.7rem" }}>{label[0]}</Avatar>}
                                sx={{ py: 1.5, justifyContent: "flex-start", gap: 1 }}>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                                </Box>
                            </Button>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
