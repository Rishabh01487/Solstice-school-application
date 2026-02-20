"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Chip } from "@mui/material";
import { BarChart, TrendingUp, People, School } from "@mui/icons-material";

const SUBJECT_PERF = [
    { subject: "Mathematics", avg: 83, passRate: 91, enrolled: 245 },
    { subject: "Science", avg: 79, passRate: 87, enrolled: 230 },
    { subject: "English", avg: 86, passRate: 94, enrolled: 250 },
    { subject: "History", avg: 81, passRate: 89, enrolled: 220 },
    { subject: "Computer Science", avg: 91, passRate: 97, enrolled: 180 },
];

const GRADE_PERF = [
    { grade: "Grade 9", avg: 82, total: 190, topStudents: 12 },
    { grade: "Grade 10", avg: 84, total: 185, topStudents: 15 },
    { grade: "Grade 11", avg: 87, total: 165, topStudents: 18 },
    { grade: "Grade 12", avg: 89, total: 145, topStudents: 22 },
];

export default function ReportsPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Reports & Analytics</Typography>
                <Typography color="text.secondary" mt={0.5}>School-wide performance insights</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                    { label: "School Average", value: "84.5%", icon: <BarChart />, color: "#7C4DFF" },
                    { label: "Pass Rate", value: "91.8%", icon: <TrendingUp />, color: "#00E676" },
                    { label: "Total Enrolled", value: "1,247", icon: <People />, color: "#00E5FF" },
                    { label: "Active Classes", value: "42", icon: <School />, color: "#FFB74D" },
                ].map((s, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card><CardContent sx={{ p: 3 }}>
                            <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </CardContent></Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>Subject Performance</Typography>
                            {SUBJECT_PERF.map((subj, i) => (
                                <Box key={i} sx={{ mb: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>{subj.subject}</Typography>
                                        <Box sx={{ display: "flex", gap: 2 }}>
                                            <Typography variant="caption" color="text.secondary">{subj.enrolled} students</Typography>
                                            <Typography variant="caption" fontWeight={700} color="primary.main">{subj.avg}%</Typography>
                                        </Box>
                                    </Box>
                                    <LinearProgress variant="determinate" value={subj.avg} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { borderRadius: 4, background: "linear-gradient(90deg, #7C4DFF, #00E5FF)" } }} />
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Pass rate: {subj.passRate}%</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>Grade Performance</Typography>
                            {GRADE_PERF.map((row, i) => (
                                <Box key={i} sx={{ mb: 2.5, p: 2, borderRadius: 2, background: "rgba(124,77,255,0.06)", border: "1px solid rgba(124,77,255,0.1)" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" fontWeight={700}>{row.grade}</Typography>
                                        <Chip label={`${row.avg}% avg`} size="small" sx={{ bgcolor: "rgba(0,229,255,0.1)", color: "#00E5FF", border: "none", fontWeight: 700 }} />
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 3 }}>
                                        <Box><Typography variant="caption" color="text.secondary">Total</Typography><Typography variant="body2" fontWeight={600}>{row.total}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Top Students</Typography><Typography variant="body2" fontWeight={600} sx={{ color: "#00E676" }}>{row.topStudents}</Typography></Box>
                                    </Box>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
