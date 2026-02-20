"use client";
import React, { useState } from "react";
import { Box, Typography, Button, Card, CardContent, Grid, TextField, Chip, Alert, Divider, Tab, Tabs } from "@mui/material";
import { School as SchoolIcon, LocationOn, Phone, Email, Assignment } from "@mui/icons-material";
import { SCHOOL, CLASSES, RED, Notice, Admission, LS } from "./types";

function NoticesPanel({ notices }: { notices: Notice[] }) {
    const colors: Record<string, string> = { notice: "#2563EB", holiday: "#16A34A", event: "#D97706", exam: "#DC2626" };
    return (
        <Box>
            {notices.length === 0 && <Alert severity="info">No notices posted yet. Check back soon!</Alert>}
            {notices.map(n => (
                <Card key={n.id} sx={{ mb: 2, borderLeft: `4px solid ${colors[n.type] || RED}` }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, flexWrap: "wrap", gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700}>{n.title}</Typography>
                            <Chip label={n.type.toUpperCase()} size="small" sx={{ background: colors[n.type] + "20", color: colors[n.type], fontWeight: 600 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{n.content}</Typography>
                        {n.imageUrl && <Box component="img" src={n.imageUrl} alt="Event" sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 1, mb: 1 }} />}
                        <Typography variant="caption" color="text.secondary">Posted: {n.date} · By {n.postedBy}</Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

interface Props {
    notices: Notice[];
    onLoginClick: () => void;
}

export default function PublicPage({ notices, onLoginClick }: Props) {
    const [tab, setTab] = useState(0);
    const [form, setForm] = useState({ studentName: "", dob: "", class: "", parentName: "", phone: "", email: "", address: "" });
    const [submitted, setSubmitted] = useState(false);
    const qrCode: string = LS.get("qrCode", "");
    const upiId: string = LS.get("upiId", "");

    const submit = () => {
        if (!form.studentName || !form.parentName || !form.phone || !form.class) return alert("Fill all required fields");
        const admissions: Admission[] = LS.get("admissions", []);
        admissions.push({ id: Date.now().toString(), ...form, date: new Date().toLocaleDateString(), status: "pending" });
        LS.set("admissions", admissions);
        setSubmitted(true);
    };

    return (
        <Box sx={{ minHeight: "100vh", background: "#F9FAFB" }}>
            {/* Header */}
            <Box sx={{ background: `linear-gradient(135deg,${RED},#EF4444)`, color: "#fff", py: 4, px: 3, textAlign: "center" }}>
                <Box sx={{ width: 70, height: 70, mx: "auto", mb: 2, borderRadius: "18px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SchoolIcon sx={{ fontSize: 38, color: "#fff" }} />
                </Box>
                <Typography variant="h3" fontWeight={800}>{SCHOOL.name}</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 0.5 }}>Director: {SCHOOL.director}</Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: 0.9 }}><LocationOn fontSize="small" /><Typography variant="body2">{SCHOOL.address}</Typography></Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: 0.9 }}><Email fontSize="small" /><Typography variant="body2">{SCHOOL.email}</Typography></Box>
                </Box>
                <Button onClick={onLoginClick} variant="outlined" sx={{ mt: 2, borderColor: "#fff", color: "#fff", "&:hover": { background: "rgba(255,255,255,0.15)" } }}>
                    Staff / Parent Login →
                </Button>
            </Box>

            {/* Nav Tabs */}
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
                    <Tab label="Notices & Events" />
                    <Tab label="Admissions" />
                    <Tab label="Fee Payment" />
                </Tabs>
            </Box>

            <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 4 }}>
                {/* Notices Tab */}
                {tab === 0 && <NoticesPanel notices={notices} />}

                {/* Admissions Tab */}
                {tab === 1 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: RED }}>Admission Enquiry</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>Classes available: {CLASSES.join(", ")}</Typography>
                        {submitted ? (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                <b>Application submitted!</b> We will contact you within 2 working days. Director: {SCHOOL.director}
                            </Alert>
                        ) : (
                            <Card>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Student Name *" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Date of Birth *" type="date" InputLabelProps={{ shrink: true }} value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} /></Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth select label="Applying for Class *" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} SelectProps={{ native: true }}>
                                                <option value=""></option>
                                                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Parent/Guardian Name *" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Grid>
                                        <Grid item xs={12}><TextField fullWidth label="Address" multiline rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></Grid>
                                        <Grid item xs={12}><Button variant="contained" size="large" onClick={submit} startIcon={<Assignment />}>Submit Application</Button></Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}

                {/* Payment Tab */}
                {tab === 2 && (
                    <Box textAlign="center">
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: RED }}>Fee Payment</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>Scan QR or pay via UPI ID</Typography>
                        {qrCode ? (
                            <Card sx={{ display: "inline-block", p: 3 }}>
                                <Box component="img" src={qrCode} alt="Payment QR" sx={{ width: 220, height: 220, objectFit: "contain", borderRadius: 2, mb: 2 }} />
                                {upiId && <Typography variant="body1" fontWeight={700} sx={{ color: RED }}>UPI ID: {upiId}</Typography>}
                                <Typography variant="caption" color="text.secondary" display="block" mt={1}>After payment, share screenshot with school admin</Typography>
                            </Card>
                        ) : (
                            <Alert severity="info">Payment QR code not yet uploaded. Please contact school: {SCHOOL.address}</Alert>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
