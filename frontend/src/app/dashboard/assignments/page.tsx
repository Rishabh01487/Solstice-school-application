"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress } from "@mui/material";
import { Assignment, AccessTime, CheckCircle, Warning } from "@mui/icons-material";

const ASSIGNMENTS = [
    { title: "Algebra Chapter 5 — Problem Set", subject: "Mathematics", teacher: "Sarah Johnson", due: "2025-02-22", submissions: 28, total: 30, status: "active" },
    { title: "Cell Biology Lab Report", subject: "Science", teacher: "Michael Davis", due: "2025-02-24", submissions: 15, total: 28, status: "active" },
    { title: "Shakespeare Essay Analysis", subject: "English", teacher: "Emily Chen", due: "2025-02-19", submissions: 32, total: 32, status: "completed" },
    { title: "World War II Research Paper", subject: "History", teacher: "James Wilson", due: "2025-02-20", submissions: 20, total: 31, status: "overdue" },
    { title: "Python Programming Project", subject: "Computer Science", teacher: "Alex Thompson", due: "2025-03-01", submissions: 5, total: 25, status: "active" },
];

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode }> = {
    active: { color: "#00E5FF", icon: <AccessTime sx={{ fontSize: 14 }} /> },
    completed: { color: "#00E676", icon: <CheckCircle sx={{ fontSize: 14 }} /> },
    overdue: { color: "#FF5252", icon: <Warning sx={{ fontSize: 14 }} /> },
};

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "#7C4DFF", Science: "#00E5FF", English: "#FFB74D",
    History: "#FF6B6B", "Computer Science": "#00E676",
};

export default function AssignmentsPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Assignments</Typography>
                <Typography color="text.secondary" mt={0.5}>Track and manage all class assignments</Typography>
            </Box>
            {ASSIGNMENTS.map((asgn, i) => (
                <Card key={i} sx={{ mb: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "translateX(4px)", borderColor: `${SUBJECT_COLORS[asgn.subject] || "#7C4DFF"}40` } }}>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: 1.5, background: `${SUBJECT_COLORS[asgn.subject] || "#7C4DFF"}18`, color: SUBJECT_COLORS[asgn.subject] || "#7C4DFF" }}>
                                        <Assignment sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>{asgn.title}</Typography>
                                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                                            <Chip label={asgn.subject} size="small" sx={{ fontSize: 11, bgcolor: `${SUBJECT_COLORS[asgn.subject]}18`, color: SUBJECT_COLORS[asgn.subject], border: "none" }} />
                                            <Typography variant="caption" color="text.secondary">by {asgn.teacher}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <Typography variant="caption" color="text.secondary">Due</Typography>
                                <Typography variant="body2" fontWeight={600}>{new Date(asgn.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">Submissions</Typography>
                                    <Typography variant="caption" fontWeight={700}>{asgn.submissions}/{asgn.total}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={(asgn.submissions / asgn.total) * 100} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { borderRadius: 3, background: SUBJECT_COLORS[asgn.subject] } }} />
                            </Grid>
                            <Grid item xs={12} sm={1} sx={{ textAlign: "right" }}>
                                <Chip label={asgn.status} size="small" icon={STATUS_MAP[asgn.status]?.icon as React.ReactElement} sx={{ textTransform: "capitalize", bgcolor: `${STATUS_MAP[asgn.status]?.color}15`, color: STATUS_MAP[asgn.status]?.color, border: "none", fontWeight: 600, fontSize: 11 }} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
