"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, Avatar, Chip } from "@mui/material";

const TEACHERS = [
    { name: "Sarah Johnson", subject: "Mathematics", grade: "Grade 9-12", students: 120, email: "sarah.johnson@edunexus.school", status: "active" },
    { name: "Michael Davis", subject: "Science", grade: "Grade 10-11", students: 95, email: "michael.davis@edunexus.school", status: "active" },
    { name: "Emily Chen", subject: "English Literature", grade: "Grade 9-12", students: 110, email: "emily.chen@edunexus.school", status: "active" },
    { name: "James Wilson", subject: "History", grade: "Grade 10-12", students: 88, email: "james.wilson@edunexus.school", status: "on-leave" },
    { name: "Maria Rodriguez", subject: "Physics", grade: "Grade 11-12", students: 72, email: "maria.rodriguez@edunexus.school", status: "active" },
    { name: "Alex Thompson", subject: "Computer Science", grade: "Grade 9-12", students: 105, email: "alex.thompson@edunexus.school", status: "active" },
];

const COLORS = ["#7C4DFF", "#00E5FF", "#00E676", "#FFB74D", "#FF6B6B", "#4ECDC4"];

export default function TeachersPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Teachers</Typography>
                <Typography color="text.secondary" mt={0.5}>{TEACHERS.length} faculty members</Typography>
            </Box>
            <Grid container spacing={3}>
                {TEACHERS.map((t, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <Card sx={{ cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                            <CardContent sx={{ p: 3, textAlign: "center" }}>
                                <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2, background: `${COLORS[i % COLORS.length]}30`, color: COLORS[i % COLORS.length], fontSize: 24, fontWeight: 700, border: `2px solid ${COLORS[i % COLORS.length]}40` }}>
                                    {t.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h6" fontWeight={700}>{t.name}</Typography>
                                <Typography variant="body2" color="text.secondary" mb={1}>{t.subject}</Typography>
                                <Chip label={t.status === "active" ? "Active" : "On Leave"} size="small" color={t.status === "active" ? "success" : "warning"} sx={{ mb: 2 }} />
                                <Box sx={{ display: "flex", justifyContent: "space-around", pt: 2, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <Box sx={{ textAlign: "center" }}>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: COLORS[i % COLORS.length] }}>{t.students}</Typography>
                                        <Typography variant="caption" color="text.secondary">Students</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "center" }}>
                                        <Typography variant="body2" fontWeight={600}>{t.grade}</Typography>
                                        <Typography variant="caption" color="text.secondary">Grades</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
