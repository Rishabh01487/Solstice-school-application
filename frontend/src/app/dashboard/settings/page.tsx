"use client";
import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Grid, TextField, Switch, FormControlLabel, Button, Avatar, Divider, Alert } from "@mui/material";
import { Save, Person, Notifications, Security, Palette } from "@mui/icons-material";
import { useAuthStore } from "@/stores/authStore";

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [saved, setSaved] = useState(false);

    const [notifs, setNotifs] = useState({ email: true, push: false, fee: true, attendance: true });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const section = (icon: React.ReactNode, title: string, children: React.ReactNode) => (
        <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, background: "rgba(124,77,255,0.12)", color: "#7C4DFF" }}>{icon}</Box>
                    <Typography variant="h6" fontWeight={700}>{title}</Typography>
                </Box>
                {children}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ animation: "fadeIn 0.4s ease", maxWidth: 720 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Settings</Typography>
                <Typography color="text.secondary" mt={0.5}>Manage your account and preferences</Typography>
            </Box>

            {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Settings saved successfully!</Alert>}

            {section(<Person />, "Profile Information", (
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Avatar src={user?.avatar_url} sx={{ width: 64, height: 64, background: "linear-gradient(135deg, #7C4DFF, #00E5FF)", fontSize: 24, fontWeight: 700 }}>{user?.full_name?.charAt(0)}</Avatar>
                        <Box><Typography variant="body1" fontWeight={600}>{user?.full_name}</Typography><Typography variant="caption" color="text.secondary">{user?.email}</Typography></Box>
                    </Grid>
                    <Grid item xs={12} sm={6}><TextField id="settings-name" fullWidth label="Full Name" defaultValue={user?.full_name} size="small" /></Grid>
                    <Grid item xs={12} sm={6}><TextField id="settings-email" fullWidth label="Email" defaultValue={user?.email} size="small" disabled /></Grid>
                </Grid>
            ))}

            {section(<Notifications />, "Notifications", (
                <Grid container spacing={1}>
                    {[
                        { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                        { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                        { key: "fee", label: "Fee Reminders", desc: "Payment due date alerts" },
                        { key: "attendance", label: "Attendance Alerts", desc: "Absence and late notifications" },
                    ].map((item) => (
                        <Grid item xs={12} key={item.key}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                                </Box>
                                <Switch id={`notif-${item.key}`} checked={notifs[item.key as keyof typeof notifs]} onChange={(e) => setNotifs((n) => ({ ...n, [item.key]: e.target.checked }))} color="primary" />
                            </Box>
                            <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                        </Grid>
                    ))}
                </Grid>
            ))}

            {section(<Security />, "Security", (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField id="settings-current-pw" fullWidth label="Current Password" type="password" size="small" /></Grid>
                    <Grid item xs={12} sm={6}><TextField id="settings-new-pw" fullWidth label="New Password" type="password" size="small" /></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Password must be at least 8 characters with a mix of letters and numbers.</Typography></Grid>
                </Grid>
            ))}

            <Button id="save-settings-btn" variant="contained" startIcon={<Save />} onClick={handleSave} size="large">
                Save Changes
            </Button>
        </Box>
    );
}
