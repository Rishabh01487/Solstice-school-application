"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, Grid, TextField, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Select, MenuItem, FormControl, InputLabel, Badge, Tooltip, Snackbar, LinearProgress } from "@mui/material";
import { Add, Delete, CurrencyRupee, Upload, CheckCircle, Cancel, People, School, Assignment, Notifications, QrCode, Settings, Logout } from "@mui/icons-material";
import { Teacher, Student, FeeRecord, Notice, Admission, CLASSES, MONTHS, RED, LS, SCHOOL } from "./types";

const uid = () => Math.random().toString(36).slice(2);
const today = () => new Date().toLocaleDateString("en-IN");
const year = new Date().getFullYear();

export default function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
    const [tab, setTab] = useState(0);
    const [teachers, setTeachers] = useState<Teacher[]>(() => LS.get("teachers", []));
    const [students, setStudents] = useState<Student[]>(() => LS.get("students", []));
    const [fees, setFees] = useState<FeeRecord[]>(() => LS.get("fees", []));
    const [notices, setNotices] = useState<Notice[]>(() => LS.get("notices", []));
    const [admissions, setAdmissions] = useState<Admission[]>(() => LS.get("admissions", []));
    const [qrCode, setQrCode] = useState<string>(() => LS.get("qrCode", ""));
    const [upiId, setUpiId] = useState<string>(() => LS.get("upiId", ""));
    const [snack, setSnack] = useState("");

    const save = (key: string, val: unknown) => { LS.set(key, val); setSnack("Saved!"); };

    // Teacher dialog
    const [tDlg, setTDlg] = useState(false);
    const [tForm, setTForm] = useState({ name: "", email: "", phone: "", subject: "", classes: [] as string[] });
    const addTeacher = () => {
        if (!tForm.name || !tForm.email) return;
        const t = [...teachers, { id: uid(), ...tForm }];
        setTeachers(t); save("teachers", t); setTDlg(false);
        setTForm({ name: "", email: "", phone: "", subject: "", classes: [] });
    };

    // Student dialog
    const [sDlg, setSDlg] = useState(false);
    const [sForm, setSForm] = useState({ name: "", rollNo: "", class: "", dob: "", parentName: "", parentPhone: "", parentEmail: "", address: "", teacherId: "" });
    const addStudent = () => {
        if (!sForm.name || !sForm.class) return;
        const s = [...students, { id: uid(), ...sForm }];
        setStudents(s); save("students", s); setSDlg(false);
        setSForm({ name: "", rollNo: "", class: "", dob: "", parentName: "", parentPhone: "", parentEmail: "", address: "", teacherId: "" });
    };

    // Fee dialog
    const [fDlg, setFDlg] = useState(false);
    const [fForm, setFForm] = useState({ studentId: "", month: MONTHS[new Date().getMonth()], year, amount: 0 });
    const collectFee = () => {
        if (!fForm.studentId || !fForm.amount) return;
        const f = [...fees, { id: uid(), ...fForm, paid: true, paidDate: today() }];
        setFees(f); save("fees", f); setFDlg(false);
    };

    // Notice dialog
    const [nDlg, setNDlg] = useState(false);
    const [nForm, setNForm] = useState({ title: "", content: "", type: "notice" as Notice["type"], imageUrl: "" });
    const addNotice = () => {
        if (!nForm.title || !nForm.content) return;
        const n = [...notices, { id: uid(), ...nForm, date: today(), postedBy: email }];
        setNotices(n); save("notices", n); setNDlg(false);
        setNForm({ title: "", content: "", type: "notice", imageUrl: "" });
    };

    const handleQR = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { const url = ev.target?.result as string; setQrCode(url); LS.set("qrCode", url); setSnack("QR uploaded!"); };
        reader.readAsDataURL(file);
    };

    const pendingAdmissions = admissions.filter(a => a.status === "pending").length;

    const statCards = [
        { label: "Students", value: students.length, icon: <People />, color: "#7C4DFF" },
        { label: "Teachers", value: teachers.length, icon: <School />, color: RED },
        { label: "Fees Collected", value: `₹${fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0).toLocaleString("en-IN")}`, icon: <CurrencyRupee />, color: "#16A34A" },
        { label: "Pending Admissions", value: pendingAdmissions, icon: <Assignment />, color: "#D97706" },
    ];

    return (
        <Box sx={{ minHeight: "100vh", background: "#F9FAFB" }}>
            {/* Top Bar */}
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB", px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: RED }}>{SCHOOL.name} — Admin</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Badge badgeContent={pendingAdmissions} color="error">
                        <Chip label={email} size="small" />
                    </Badge>
                    <IconButton onClick={onLogout} size="small"><Logout /></IconButton>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Overview" />
                    <Tab label="Teachers" />
                    <Tab label="Students" />
                    <Tab label="Fees" />
                    <Tab label={<Badge badgeContent={pendingAdmissions} color="error">Admissions</Badge>} />
                    <Tab label="Notices" />
                    <Tab label="Settings" />
                </Tabs>
            </Box>

            <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
                {/* ── OVERVIEW ── */}
                {tab === 0 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Welcome, Admin 👋</Typography>
                        <Grid container spacing={3} mb={3}>
                            {statCards.map((s, i) => (
                                <Grid item xs={6} sm={3} key={i}>
                                    <Card>
                                        <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                                            <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                                            <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                                            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={2}>School Information</Typography>
                                <Typography variant="body2"><b>Director:</b> {SCHOOL.director}</Typography>
                                <Typography variant="body2"><b>Address:</b> {SCHOOL.address}</Typography>
                                <Typography variant="body2"><b>Classes:</b> {CLASSES.join(" · ")}</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* ── TEACHERS ── */}
                {tab === 1 && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h5" fontWeight={700}>Teachers ({teachers.length})</Typography>
                            <Button variant="contained" startIcon={<Add />} onClick={() => setTDlg(true)}>Add Teacher</Button>
                        </Box>
                        {teachers.length === 0 && <Alert severity="info">No teachers added yet. Click "Add Teacher" to begin.</Alert>}
                        <Grid container spacing={2}>
                            {teachers.map(t => (
                                <Grid item xs={12} sm={6} md={4} key={t.id}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography fontWeight={700}>{t.name}</Typography>
                                                <IconButton size="small" color="error" onClick={() => { const arr = teachers.filter(x => x.id !== t.id); setTeachers(arr); save("teachers", arr); }}><Delete fontSize="small" /></IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">{t.email}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t.subject}</Typography>
                                            <Typography variant="body2" color="text.secondary">Classes: {t.classes.join(", ") || "—"}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* ── STUDENTS ── */}
                {tab === 2 && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h5" fontWeight={700}>Students ({students.length})</Typography>
                            <Button variant="contained" startIcon={<Add />} onClick={() => setSDlg(true)}>Add Student</Button>
                        </Box>
                        {students.length === 0 && <Alert severity="info">No students added yet.</Alert>}
                        <Card>
                            <Table>
                                <TableHead><TableRow sx={{ background: "#FEF2F2" }}>
                                    {["Name", "Roll No", "Class", "Parent", "Phone", "Actions"].map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
                                </TableRow></TableHead>
                                <TableBody>
                                    {students.map(s => (
                                        <TableRow key={s.id} hover>
                                            <TableCell>{s.name}</TableCell>
                                            <TableCell>{s.rollNo}</TableCell>
                                            <TableCell><Chip label={s.class} size="small" sx={{ background: "#FEF2F2", color: RED }} /></TableCell>
                                            <TableCell>{s.parentName}</TableCell>
                                            <TableCell>{s.parentPhone}</TableCell>
                                            <TableCell><IconButton size="small" color="error" onClick={() => { const arr = students.filter(x => x.id !== s.id); setStudents(arr); save("students", arr); }}><Delete fontSize="small" /></IconButton></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}

                {/* ── FEES ── */}
                {tab === 3 && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h5" fontWeight={700}>Fee Collection</Typography>
                            <Button variant="contained" startIcon={<CurrencyRupee />} onClick={() => setFDlg(true)}>Collect Fee</Button>
                        </Box>
                        {fees.length === 0 && <Alert severity="info">No fee records yet.</Alert>}
                        <Card>
                            <Table>
                                <TableHead><TableRow sx={{ background: "#FEF2F2" }}>
                                    {["Student", "Month", "Year", "Amount", "Status", "Date"].map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
                                </TableRow></TableHead>
                                <TableBody>
                                    {fees.map(f => {
                                        const st = students.find(s => s.id === f.studentId);
                                        return (
                                            <TableRow key={f.id} hover>
                                                <TableCell>{st?.name || "Unknown"}</TableCell>
                                                <TableCell>{f.month}</TableCell>
                                                <TableCell>{f.year}</TableCell>
                                                <TableCell>₹{f.amount.toLocaleString("en-IN")}</TableCell>
                                                <TableCell><Chip label={f.paid ? "Paid" : "Pending"} size="small" color={f.paid ? "success" : "error"} /></TableCell>
                                                <TableCell>{f.paidDate || "—"}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}

                {/* ── ADMISSIONS ── */}
                {tab === 4 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>Admission Requests ({admissions.length})</Typography>
                        {admissions.length === 0 && <Alert severity="info">No admission requests yet.</Alert>}
                        <Grid container spacing={2}>
                            {admissions.map(a => (
                                <Grid item xs={12} sm={6} key={a.id}>
                                    <Card sx={{ borderLeft: `4px solid ${a.status === "approved" ? "#16A34A" : a.status === "rejected" ? RED : "#D97706"}` }}>
                                        <CardContent>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                <Typography fontWeight={700}>{a.studentName}</Typography>
                                                <Chip label={a.status} size="small" color={a.status === "approved" ? "success" : a.status === "rejected" ? "error" : "warning"} />
                                            </Box>
                                            <Typography variant="body2">Class: {a.class} · DOB: {a.dob}</Typography>
                                            <Typography variant="body2">Parent: {a.parentName} · {a.phone}</Typography>
                                            <Typography variant="body2" color="text.secondary">{a.email}</Typography>
                                            {a.status === "pending" && (
                                                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                                                    <Button size="small" color="success" variant="outlined" startIcon={<CheckCircle />}
                                                        onClick={() => { const arr = admissions.map(x => x.id === a.id ? { ...x, status: "approved" as const } : x); setAdmissions(arr); save("admissions", arr); }}>Approve</Button>
                                                    <Button size="small" color="error" variant="outlined" startIcon={<Cancel />}
                                                        onClick={() => { const arr = admissions.map(x => x.id === a.id ? { ...x, status: "rejected" as const } : x); setAdmissions(arr); save("admissions", arr); }}>Reject</Button>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* ── NOTICES ── */}
                {tab === 5 && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h5" fontWeight={700}>Notices & Events</Typography>
                            <Button variant="contained" startIcon={<Add />} onClick={() => setNDlg(true)}>Post Notice</Button>
                        </Box>
                        {notices.length === 0 && <Alert severity="info">No notices posted.</Alert>}
                        {notices.map(n => (
                            <Card key={n.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography fontWeight={700}>{n.title}</Typography>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                            <Chip label={n.type} size="small" color="primary" />
                                            <IconButton size="small" color="error" onClick={() => { const arr = notices.filter(x => x.id !== n.id); setNotices(arr); save("notices", arr); }}><Delete fontSize="small" /></IconButton>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" mt={0.5}>{n.content}</Typography>
                                    {n.imageUrl && <Box component="img" src={n.imageUrl} sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 1, mt: 1 }} />}
                                    <Typography variant="caption" color="text.secondary">Posted: {n.date}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {/* ── SETTINGS ── */}
                {tab === 6 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Settings — Payment</Typography>
                        <Card sx={{ mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={2}>Payment QR Code</Typography>
                                <Button variant="outlined" component="label" startIcon={<Upload />} sx={{ mb: 2 }}>
                                    Upload QR Code <input type="file" hidden accept="image/*" onChange={handleQR} />
                                </Button>
                                {qrCode && <Box><Box component="img" src={qrCode} sx={{ width: 180, height: 180, objectFit: "contain", display: "block", mb: 1, borderRadius: 2 }} /><Button color="error" size="small" onClick={() => { setQrCode(""); LS.set("qrCode", ""); }}>Remove QR</Button></Box>}
                                <Box sx={{ mt: 2 }}>
                                    <TextField fullWidth label="UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} sx={{ mb: 1 }} placeholder="yourname@upi" />
                                    <Button variant="contained" onClick={() => { LS.set("upiId", upiId); setSnack("UPI ID saved!"); }}>Save UPI ID</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            {/* Add Teacher */}
            <Dialog open={tDlg} onClose={() => setTDlg(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Teacher</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField label="Full Name *" value={tForm.name} onChange={e => setTForm(f => ({ ...f, name: e.target.value }))} />
                        <TextField label="Email *" value={tForm.email} onChange={e => setTForm(f => ({ ...f, email: e.target.value }))} />
                        <TextField label="Phone" value={tForm.phone} onChange={e => setTForm(f => ({ ...f, phone: e.target.value }))} />
                        <TextField label="Subject" value={tForm.subject} onChange={e => setTForm(f => ({ ...f, subject: e.target.value }))} />
                        <FormControl fullWidth>
                            <InputLabel>Classes Assigned</InputLabel>
                            <Select multiple value={tForm.classes} label="Classes Assigned" onChange={e => setTForm(f => ({ ...f, classes: e.target.value as string[] }))}>
                                {CLASSES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setTDlg(false)}>Cancel</Button><Button variant="contained" onClick={addTeacher}>Add</Button></DialogActions>
            </Dialog>

            {/* Add Student */}
            <Dialog open={sDlg} onClose={() => setSDlg(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Student</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField label="Student Name *" value={sForm.name} onChange={e => setSForm(f => ({ ...f, name: e.target.value }))} />
                        <TextField label="Roll No" value={sForm.rollNo} onChange={e => setSForm(f => ({ ...f, rollNo: e.target.value }))} />
                        <TextField select label="Class *" value={sForm.class} onChange={e => setSForm(f => ({ ...f, class: e.target.value }))} SelectProps={{ native: true }}>
                            <option value=""></option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </TextField>
                        <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={sForm.dob} onChange={e => setSForm(f => ({ ...f, dob: e.target.value }))} />
                        <TextField label="Parent Name" value={sForm.parentName} onChange={e => setSForm(f => ({ ...f, parentName: e.target.value }))} />
                        <TextField label="Parent Phone" value={sForm.parentPhone} onChange={e => setSForm(f => ({ ...f, parentPhone: e.target.value }))} />
                        <TextField label="Parent Email" value={sForm.parentEmail} onChange={e => setSForm(f => ({ ...f, parentEmail: e.target.value }))} />
                        <TextField label="Address" value={sForm.address} onChange={e => setSForm(f => ({ ...f, address: e.target.value }))} />
                        <FormControl fullWidth>
                            <InputLabel>Assign Teacher</InputLabel>
                            <Select value={sForm.teacherId} label="Assign Teacher" onChange={e => setSForm(f => ({ ...f, teacherId: e.target.value }))}>
                                <MenuItem value="">None</MenuItem>
                                {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setSDlg(false)}>Cancel</Button><Button variant="contained" onClick={addStudent}>Add</Button></DialogActions>
            </Dialog>

            {/* Collect Fee */}
            <Dialog open={fDlg} onClose={() => setFDlg(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Collect Fee</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Student *</InputLabel>
                            <Select value={fForm.studentId} label="Student *" onChange={e => setFForm(f => ({ ...f, studentId: e.target.value }))}>
                                {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name} — {s.class}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select value={fForm.month} label="Month" onChange={e => setFForm(f => ({ ...f, month: e.target.value }))}>
                                {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Amount (₹) *" type="number" value={fForm.amount || ""} onChange={e => setFForm(f => ({ ...f, amount: Number(e.target.value) }))} />
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setFDlg(false)}>Cancel</Button><Button variant="contained" onClick={collectFee}>Collect</Button></DialogActions>
            </Dialog>

            {/* Post Notice */}
            <Dialog open={nDlg} onClose={() => setNDlg(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Post Notice / Event</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField label="Title *" value={nForm.title} onChange={e => setNForm(f => ({ ...f, title: e.target.value }))} />
                        <TextField label="Content *" multiline rows={3} value={nForm.content} onChange={e => setNForm(f => ({ ...f, content: e.target.value }))} />
                        <TextField select label="Type" value={nForm.type} onChange={e => setNForm(f => ({ ...f, type: e.target.value as Notice["type"] }))} SelectProps={{ native: true }}>
                            {["notice", "holiday", "event", "exam"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </TextField>
                        <Button variant="outlined" component="label" startIcon={<Upload />}>
                            Attach Image (optional)
                            <input type="file" hidden accept="image/*" onChange={e => {
                                const f = e.target.files?.[0]; if (!f) return;
                                const r = new FileReader(); r.onload = ev => setNForm(prev => ({ ...prev, imageUrl: ev.target?.result as string })); r.readAsDataURL(f);
                            }} />
                        </Button>
                        {nForm.imageUrl && <Box component="img" src={nForm.imageUrl} sx={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 1 }} />}
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setNDlg(false)}>Cancel</Button><Button variant="contained" onClick={addNotice}>Post</Button></DialogActions>
            </Dialog>

            <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
        </Box>
    );
}
