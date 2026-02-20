"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, Chip } from "@mui/material";

const EVENTS = [
    { date: "Feb 22", title: "Library Book Return", time: "All Day", type: "info", color: "#FFB74D" },
    { date: "Feb 25", title: "Parent-Teacher Conference", time: "9:00 AM - 4:00 PM", type: "meeting", color: "#00E5FF" },
    { date: "Feb 28", title: "Sports Day Registration Closes", time: "5:00 PM", type: "event", color: "#7C4DFF" },
    { date: "Mar 05", title: "Annual Sports Day", time: "8:00 AM - 5:00 PM", type: "event", color: "#7C4DFF" },
    { date: "Mar 10", title: "Mid-Term Examinations Begin", time: "8:30 AM", type: "exam", color: "#FF6B6B" },
    { date: "Mar 15", title: "Term 2 Fee Deadline", time: "5:00 PM", type: "info", color: "#FFB74D" },
    { date: "Mar 20", title: "Science Fair", time: "10:00 AM - 3:00 PM", type: "event", color: "#4ECDC4" },
    { date: "Mar 28", title: "Spring Break Begins", time: "All Day", type: "holiday", color: "#00E676" },
];

export default function CalendarPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Academic Calendar</Typography>
                <Typography color="text.secondary" mt={0.5}>Upcoming events and important dates</Typography>
            </Box>
            <Grid container spacing={2}>
                {EVENTS.map((evt, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <Card sx={{ cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "translateY(-3px)", borderColor: `${evt.color}40` } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                                    <Box sx={{ minWidth: 52, textAlign: "center", p: 1.5, borderRadius: 2, background: `${evt.color}15`, border: `1px solid ${evt.color}30` }}>
                                        <Typography variant="caption" sx={{ color: evt.color, fontWeight: 700, display: "block" }}>{evt.date.split(" ")[0].toUpperCase()}</Typography>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: evt.color, lineHeight: 1.2 }}>{evt.date.split(" ")[1]}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>{evt.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{evt.time}</Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Chip label={evt.type} size="small" sx={{ fontSize: 10, textTransform: "capitalize", bgcolor: `${evt.color}15`, color: evt.color, border: "none" }} />
                                        </Box>
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
