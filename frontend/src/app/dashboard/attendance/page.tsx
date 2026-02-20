"use client";
import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody, Avatar, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CheckCircle, Cancel, AccessTime } from "@mui/icons-material";

const ATTENDANCE_DATA = [
    { name: "Aiden Martinez", grade: "10A", mon: "P", tue: "P", wed: "A", thu: "P", fri: "P", rate: 92 },
    { name: "Sofia Chen", grade: "11B", mon: "P", tue: "P", wed: "P", thu: "L", fri: "P", rate: 96 },
    { name: "Marcus Thompson", grade: "9C", mon: "A", tue: "P", wed: "P", thu: "P", fri: "P", rate: 88 },
    { name: "Emma Wilson", grade: "12A", mon: "P", tue: "P", wed: "P", thu: "P", fri: "P", rate: 100 },
    { name: "Liam Patel", grade: "10B", mon: "P", tue: "A", wed: "P", thu: "P", fri: "A", rate: 80 },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    P: { label: "Present", color: "#00E676", icon: <CheckCircle sx={{ fontSize: 16 }} /> },
    A: { label: "Absent", color: "#FF5252", icon: <Cancel sx={{ fontSize: 16 }} /> },
    L: { label: "Late", color: "#FFB74D", icon: <AccessTime sx={{ fontSize: 16 }} /> },
};

export default function AttendancePage() {
    const [view, setView] = useState("week");
    const overallRate = Math.round(ATTENDANCE_DATA.reduce((s, d) => s + d.rate, 0) / ATTENDANCE_DATA.length);

    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Attendance</Typography>
                    <Typography color="text.secondary" mt={0.5}>Track student presence and absences</Typography>
                </Box>
                <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
                    <ToggleButton value="week" id="week-view">Week</ToggleButton>
                    <ToggleButton value="month" id="month-view">Month</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                    { label: "Overall Rate", value: `${overallRate}%`, color: "#7C4DFF" },
                    { label: "Present Today", value: "89%", color: "#00E676" },
                    { label: "Absent Today", value: "11%", color: "#FF5252" },
                    { label: "Late Today", value: "4%", color: "#FFB74D" },
                ].map((s, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <Typography variant="h6" fontWeight={700}>Weekly Attendance — Grade 9-12</Typography>
                    </Box>
                    <Box sx={{ overflowX: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["Student", "Grade", "Mon", "Tue", "Wed", "Thu", "Fri", "Rate"].map((h) => (
                                        <TableCell key={h} sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ATTENDANCE_DATA.map((row, i) => (
                                    <TableRow key={i} sx={{ "& td": { borderBottom: "1px solid rgba(255,255,255,0.03)" } }}>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, fontSize: 12, background: "linear-gradient(135deg, #7C4DFF, #00E5FF)" }}>{row.name.charAt(0)}</Avatar>
                                                <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Chip label={row.grade} size="small" sx={{ fontSize: 11 }} /></TableCell>
                                        {[row.mon, row.tue, row.wed, row.thu, row.fri].map((status, j) => (
                                            <TableCell key={j}>
                                                <Box sx={{ color: STATUS_MAP[status]?.color, display: "flex", alignItems: "center" }}>
                                                    {STATUS_MAP[status]?.icon}
                                                </Box>
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Box sx={{ minWidth: 80 }}>
                                                <Typography variant="caption" fontWeight={600} sx={{ color: row.rate >= 90 ? "#00E676" : row.rate >= 75 ? "#FFB74D" : "#FF5252" }}>{row.rate}%</Typography>
                                                <LinearProgress variant="determinate" value={row.rate} sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { background: row.rate >= 90 ? "#00E676" : row.rate >= 75 ? "#FFB74D" : "#FF5252" } }} />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
