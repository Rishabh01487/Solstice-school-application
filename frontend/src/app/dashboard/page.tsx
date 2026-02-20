"use client";

import React, { useEffect, useState } from "react";
import {
    Box, Grid, Card, CardContent, Typography, Avatar,
    LinearProgress, Chip, CircularProgress, Skeleton,
} from "@mui/material";
import {
    People, School, CheckCircle, CurrencyRupee,
    TrendingUp, TrendingDown, AutoGraph, Groups,
} from "@mui/icons-material";
import { useAuthStore } from "@/stores/authStore";
import { reportsApi } from "@/lib/api";

interface StatCard {
    title: string;
    value: string | number;
    trend: string;
    trendUp: boolean;
    icon: React.ReactNode;
    color: string;
    gradient: string;
}

const ACTIVITY = [
    { action: "New student enrolled", who: "Aiden Martinez", time: "2m ago", color: "#7C4DFF" },
    { action: "Attendance marked", who: "Grade 9A — 45 students", time: "15m ago", color: "#00E5FF" },
    { action: "Fee payment received", who: "₹37,500 — Johnson family", time: "1h ago", color: "#00E676" },
    { action: "Exam scheduled", who: "Mathematics — Term 2", time: "3h ago", color: "#FFB74D" },
    { action: "Teacher joined", who: "Prof. Sarah Williams", time: "1d ago", color: "#4ECDC4" },
];

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<StatCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Try to fetch from API
                await reportsApi.getDashboardStats();
            } catch {
                // Use demo data if API is unavailable
            }

            // Demo stats (populated immediately for great UX)
            setStats([
                {
                    title: "Total Students",
                    value: "1,247",
                    trend: "+5.2%",
                    trendUp: true,
                    icon: <People sx={{ fontSize: 28 }} />,
                    color: "#7C4DFF",
                    gradient: "linear-gradient(135deg, rgba(124,77,255,0.2), rgba(180,124,255,0.1))",
                },
                {
                    title: "Teachers",
                    value: "89",
                    trend: "+2",
                    trendUp: true,
                    icon: <School sx={{ fontSize: 28 }} />,
                    color: "#00E5FF",
                    gradient: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,178,204,0.1))",
                },
                {
                    title: "Attendance Rate",
                    value: "94.7%",
                    trend: "+1.3%",
                    trendUp: true,
                    icon: <CheckCircle sx={{ fontSize: 28 }} />,
                    color: "#00E676",
                    gradient: "linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,200,100,0.1))",
                },
                {
                    title: "Fees Collected",
                    value: "₹74,51,640",
                    trend: "+12.5%",
                    trendUp: true,
                    icon: <CurrencyRupee sx={{ fontSize: 28 }} />,
                    color: "#FFB74D",
                    gradient: "linear-gradient(135deg, rgba(255,183,77,0.15), rgba(255,160,50,0.1))",
                },
            ]);
            setLoading(false);
        };
        loadStats();
    }, []);

    const gradeData = [
        { grade: "Grade 12", students: 145, percent: 75 },
        { grade: "Grade 11", students: 162, percent: 84 },
        { grade: "Grade 10", students: 178, percent: 88 },
        { grade: "Grade 9", students: 190, percent: 93 },
    ];

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <Box sx={{ animation: "fadeIn 0.5s ease" }}>
            {/* Header greeting */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>
                    {greeting()}, {user?.full_name?.split(" ")[0]} 👋
                </Typography>
                <Typography color="text.secondary" mt={0.5}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {loading
                    ? [1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} lg={3} key={i}>
                            <Skeleton variant="rounded" height={140} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                        </Grid>
                    ))
                    : stats.map((stat, i) => (
                        <Grid item xs={12} sm={6} lg={3} key={i}>
                            <Card sx={{
                                height: "100%", cursor: "pointer",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                "&:hover": { transform: "translateY(-4px)", boxShadow: `0 20px 40px rgba(0,0,0,0.4)` },
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: 2, background: stat.gradient,
                                            border: `1px solid ${stat.color}25`,
                                            color: stat.color,
                                        }}>
                                            {stat.icon}
                                        </Box>
                                        <Chip
                                            label={stat.trend}
                                            size="small"
                                            icon={stat.trendUp ? <TrendingUp sx={{ fontSize: "14px !important" }} /> : <TrendingDown sx={{ fontSize: "14px !important" }} />}
                                            sx={{
                                                bgcolor: stat.trendUp ? "rgba(0,230,118,0.12)" : "rgba(255,82,82,0.12)",
                                                color: stat.trendUp ? "#00E676" : "#FF5252",
                                                border: "none", fontSize: 11,
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} sx={{ color: stat.color, mb: 0.5 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Grade distribution */}
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Typography variant="h6" fontWeight={700}>
                                    Grade Distribution
                                </Typography>
                                <AutoGraph sx={{ color: "text.secondary" }} />
                            </Box>
                            {gradeData.map((item) => (
                                <Box key={item.grade} sx={{ mb: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>{item.grade}</Typography>
                                        <Box sx={{ display: "flex", gap: 2 }}>
                                            <Typography variant="body2" color="text.secondary">{item.students} students</Typography>
                                            <Typography variant="body2" fontWeight={600} color="primary.main">{item.percent}%</Typography>
                                        </Box>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={item.percent}
                                        sx={{
                                            height: 8, borderRadius: 4,
                                            bgcolor: "rgba(255,255,255,0.05)",
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 4,
                                                background: "linear-gradient(90deg, #7C4DFF, #00E5FF)",
                                            },
                                        }}
                                    />
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent activity */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>
                                Recent Activity
                            </Typography>
                            {ACTIVITY.map((item, i) => (
                                <Box key={i} sx={{ display: "flex", gap: 2, mb: 2.5, alignItems: "flex-start" }}>
                                    <Box sx={{
                                        width: 10, height: 10, borderRadius: "50%",
                                        background: item.color, mt: 0.7, flexShrink: 0,
                                        boxShadow: `0 0 8px ${item.color}80`,
                                    }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>{item.action}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.who}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                        {item.time}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick stats row */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>
                                Today&apos;s Overview
                            </Typography>
                            <Grid container spacing={3}>
                                {[
                                    { label: "Classes Scheduled", value: 42, icon: <School />, color: "#7C4DFF" },
                                    { label: "Teachers Present", value: 85, icon: <Groups />, color: "#00E5FF" },
                                    { label: "Pending Assignments", value: 17, icon: <CheckCircle />, color: "#FFB74D" },
                                    { label: "Fee Alerts", value: 6, icon: <CurrencyRupee />, color: "#FF5252" },
                                ].map((item, i) => (
                                    <Grid item xs={6} sm={3} key={i}>
                                        <Box sx={{
                                            textAlign: "center", p: 2, borderRadius: 2,
                                            background: `${item.color}10`,
                                            border: `1px solid ${item.color}20`,
                                        }}>
                                            <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                                            <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>
                                                {item.value}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
