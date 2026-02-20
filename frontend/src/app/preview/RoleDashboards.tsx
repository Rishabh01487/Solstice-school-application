"use client";
import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Alert, Checkbox, Button, Snackbar, Tab, Tabs } from "@mui/material";
import { Logout, CheckCircle, Cancel } from "@mui/icons-material";
import { Teacher, Student, Notice, AttendanceRecord, LS, SCHOOL, RED } from "./types";

export function TeacherDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
    const [tab, setTab] = useState(0);
    const teachers: Teacher[] = LS.get("teachers", []);
    const teacher = teachers.find(t => t.email === email);
    const allStudents: Student[] = LS.get("students", []);
    const myStudents = teacher ? allStudents.filter(s => teacher.classes.includes(s.class)) : [];
    const notices: Notice[] = LS.get("notices", []);
    const today = new Date().toLocaleDateString("en-IN");
    const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
        const saved: AttendanceRecord[] = LS.get("attendance", []);
        const todayRecs = saved.filter(a => a.date === today);
        return Object.fromEntries(todayRecs.map(a => [a.studentId, a.present]));
    });
    const [saved, setSaved] = useState(false);
    const [snack, setSnack] = useState("");

    const saveAttendance = () => {
        const existing: AttendanceRecord[] = LS.get("attendance", []).filter((a: AttendanceRecord) => a.date !== today);
        const newRecs = myStudents.map(s => ({ date: today, studentId: s.id, present: attendance[s.id] ?? false }));
        LS.set("attendance", [...existing, ...newRecs]);
        setSaved(true); setSnack("Attendance saved!");
    };

    return (
        <Box sx={{ minHeight: "100vh", background: "#F9FAFB" }}>
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB", px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: RED }}>{SCHOOL.name} — Teacher Portal</Typography>
                <Box sx={{ display: "flex", gap: 1 }}><Chip label={teacher?.name || email} size="small" /><IconButton size="small" onClick={onLogout}><Logout /></IconButton></Box>
            </Box>
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Mark Attendance" /><Tab label="My Students" /><Tab label="Notices" />
                </Tabs>
            </Box>
            <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
                {tab === 0 && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h5" fontWeight={700}>Attendance — {today}</Typography>
                            <Button variant="contained" onClick={saveAttendance}>Save Attendance</Button>
                        </Box>
                        {myStudents.length === 0 && <Alert severity="info">No students in your assigned classes. Ask admin to assign classes.</Alert>}
                        <Card>
                            <Table>
                                <TableHead><TableRow sx={{ background: "#FEF2F2" }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Present</TableCell>
                                </TableRow></TableHead>
                                <TableBody>
                                    {myStudents.map(s => (
                                        <TableRow key={s.id} hover>
                                            <TableCell>{s.name}</TableCell>
                                            <TableCell><Chip label={s.class} size="small" sx={{ background: "#FEF2F2", color: RED }} /></TableCell>
                                            <TableCell>{s.rollNo || "—"}</TableCell>
                                            <TableCell>
                                                <Checkbox checked={attendance[s.id] ?? false} onChange={e => setAttendance(a => ({ ...a, [s.id]: e.target.checked }))}
                                                    icon={<Cancel color="error" />} checkedIcon={<CheckCircle color="success" />} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}
                {tab === 1 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>My Students ({myStudents.length})</Typography>
                        {myStudents.length === 0 && <Alert severity="info">No students assigned.</Alert>}
                        <Grid container spacing={2}>
                            {myStudents.map(s => (
                                <Grid item xs={12} sm={6} key={s.id}>
                                    <Card><CardContent>
                                        <Typography fontWeight={700}>{s.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">Class: {s.class} · Roll: {s.rollNo || "—"}</Typography>
                                        <Typography variant="body2" color="text.secondary">Parent: {s.parentName} · {s.parentPhone}</Typography>
                                    </CardContent></Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
                {tab === 2 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>Notices & Events</Typography>
                        {notices.length === 0 && <Alert severity="info">No notices yet.</Alert>}
                        {notices.map(n => (
                            <Card key={n.id} sx={{ mb: 2, borderLeft: `4px solid ${RED}` }}>
                                <CardContent>
                                    <Typography fontWeight={700}>{n.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{n.content}</Typography>
                                    {n.imageUrl && <Box component="img" src={n.imageUrl} sx={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 1, mt: 1 }} />}
                                    <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
            <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
        </Box>
    );
}

export function ParentDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
    const [tab, setTab] = useState(0);
    const students: Student[] = LS.get("students", []);
    const child = students.find(s => s.parentEmail === email);
    const fees: any[] = LS.get("fees", []).filter((f: any) => f.studentId === child?.id);
    const notices: Notice[] = LS.get("notices", []);
    const attendance: AttendanceRecord[] = LS.get("attendance", []).filter((a: AttendanceRecord) => a.studentId === child?.id);
    const presentDays = attendance.filter(a => a.present).length;
    const qrCode: string = LS.get("qrCode", "");
    const upiId: string = LS.get("upiId", "");

    return (
        <Box sx={{ minHeight: "100vh", background: "#F9FAFB" }}>
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB", px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: RED }}>{SCHOOL.name} — Parent Portal</Typography>
                <Box sx={{ display: "flex", gap: 1 }}><Chip label={email} size="small" /><IconButton size="small" onClick={onLogout}><Logout /></IconButton></Box>
            </Box>
            <Box sx={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="My Child" /><Tab label="Attendance" /><Tab label="Fees" /><Tab label="Notices" />
                </Tabs>
            </Box>
            <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
                {!child && <Alert severity="warning" sx={{ mb: 2 }}>No student linked to this email ({email}). Ask admin to add your child with this email as parent email.</Alert>}

                {tab === 0 && child && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>My Child</Typography>
                        <Card><CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: RED, mb: 1 }}>{child.name}</Typography>
                            <Grid container spacing={2}>
                                {[["Class", child.class], ["Roll No", child.rollNo || "—"], ["Date of Birth", child.dob || "—"], ["Address", child.address || "—"]].map(([k, v]) => (
                                    <Grid item xs={6} key={k}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography variant="body2" fontWeight={600}>{v}</Typography></Grid>
                                ))}
                            </Grid>
                            <Box sx={{ mt: 2, p: 2, background: "#FEF2F2", borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight={700} sx={{ color: RED }}>Attendance Summary</Typography>
                                <Typography variant="body2">{presentDays} present out of {attendance.length} recorded days</Typography>
                            </Box>
                        </CardContent></Card>
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>Attendance Record</Typography>
                        {attendance.length === 0 && <Alert severity="info">No attendance records yet.</Alert>}
                        <Card>
                            <Table>
                                <TableHead><TableRow sx={{ background: "#FEF2F2" }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                </TableRow></TableHead>
                                <TableBody>
                                    {attendance.slice(-30).reverse().map((a, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell>{a.date}</TableCell>
                                            <TableCell><Chip label={a.present ? "Present" : "Absent"} color={a.present ? "success" : "error"} size="small" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}

                {tab === 2 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>Fee Details</Typography>
                        {fees.length === 0 && <Alert severity="info">No fee records yet.</Alert>}
                        {fees.filter((f: any) => !f.paid).length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>⚠️ You have {fees.filter((f: any) => !f.paid).length} pending fee(s). Please pay soon to avoid late charges.</Alert>
                        )}
                        <Card sx={{ mb: 3 }}>
                            <Table>
                                <TableHead><TableRow sx={{ background: "#FEF2F2" }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Month</TableCell><TableCell sx={{ fontWeight: 700 }}>Amount</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                </TableRow></TableHead>
                                <TableBody>
                                    {fees.map((f: any, i: number) => (
                                        <TableRow key={i} hover>
                                            <TableCell>{f.month} {f.year}</TableCell>
                                            <TableCell>₹{f.amount?.toLocaleString("en-IN")}</TableCell>
                                            <TableCell><Chip label={f.paid ? "Paid" : "Pending"} color={f.paid ? "success" : "error"} size="small" /></TableCell>
                                            <TableCell>{f.paidDate || "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                        {qrCode && (
                            <Card><CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={2}>Pay Online</Typography>
                                <Box component="img" src={qrCode} sx={{ width: 200, height: 200, objectFit: "contain", borderRadius: 2, mb: 1 }} />
                                {upiId && <Typography fontWeight={700} sx={{ color: RED }}>UPI ID: {upiId}</Typography>}
                                <Typography variant="caption" color="text.secondary" display="block" mt={1}>After payment, share receipt screenshot with school admin</Typography>
                            </CardContent></Card>
                        )}
                    </Box>
                )}

                {tab === 3 && (
                    <Box>
                        <Typography variant="h5" fontWeight={700} mb={2}>School Notices</Typography>
                        {notices.length === 0 && <Alert severity="info">No notices yet.</Alert>}
                        {notices.map(n => (
                            <Card key={n.id} sx={{ mb: 2, borderLeft: `4px solid ${RED}` }}>
                                <CardContent>
                                    <Typography fontWeight={700}>{n.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{n.content}</Typography>
                                    {n.imageUrl && <Box component="img" src={n.imageUrl} sx={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 1, mt: 1 }} />}
                                    <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
