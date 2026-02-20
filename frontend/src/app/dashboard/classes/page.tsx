"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, Avatar, LinearProgress } from "@mui/material";
import { Class, People, AccessTime } from "@mui/icons-material";

const CLASSES = [
    { name: "Mathematics 10A", teacher: "Sarah Johnson", students: 30, room: "B-201", time: "Mon/Wed 8:00-9:30", grade: "Grade 10", progress: 65 },
    { name: "Science 11B", teacher: "Michael Davis", students: 28, room: "Lab-1", time: "Tue/Thu 10:00-11:30", grade: "Grade 11", progress: 72 },
    { name: "English 9C", teacher: "Emily Chen", students: 32, room: "A-105", time: "Mon/Wed/Fri 9:00-10:00", grade: "Grade 9", progress: 58 },
    { name: "Computer Science 12", teacher: "Alex Thompson", students: 25, room: "Lab-3", time: "Tue/Thu 1:00-2:30", grade: "Grade 12", progress: 80 },
    { name: "History 10B", teacher: "James Wilson", students: 31, room: "C-302", time: "Wed/Fri 11:00-12:30", grade: "Grade 10", progress: 61 },
    { name: "Physics 11A", teacher: "Maria Rodriguez", students: 22, room: "Lab-2", time: "Mon/Thu 2:00-3:30", grade: "Grade 11", progress: 74 },
];

const COLORS = ["#7C4DFF", "#00E5FF", "#00E676", "#FFB74D", "#FF6B6B", "#4ECDC4"];

export default function ClassesPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Classes</Typography>
                <Typography color="text.secondary" mt={0.5}>Active class sections and schedules</Typography>
            </Box>
            <Grid container spacing={3}>
                {CLASSES.map((cls, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <Card sx={{ cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, background: `${COLORS[i]}18`, border: `1px solid ${COLORS[i]}30`, color: COLORS[i] }}>
                                        <Class />
                                    </Box>
                                    <Chip label={cls.grade} size="small" sx={{ bgcolor: `${COLORS[i]}15`, color: COLORS[i], border: "none", fontSize: 11 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700} mb={0.5}>{cls.name}</Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>{cls.teacher}</Typography>
                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <People sx={{ fontSize: 14, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">{cls.students} students</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <AccessTime sx={{ fontSize: 14, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">{cls.room}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary" mb={1} display="block">{cls.time}</Typography>
                                <Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Term Progress</Typography>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: COLORS[i] }}>{cls.progress}%</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={cls.progress} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { borderRadius: 3, background: COLORS[i] } }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
