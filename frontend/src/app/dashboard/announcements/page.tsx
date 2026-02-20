"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Chip, Avatar } from "@mui/material";
import { Announcement, School, Campaign, InfoOutlined } from "@mui/icons-material";

const ANNOUNCEMENTS = [
    { title: "Mid-Term Examinations Schedule", body: "Mid-term examinations for all grades will commence on March 10th. Please ensure students are prepared. Timetables have been distributed.", author: "Admin Office", date: "2025-02-18", type: "exam", pinned: true },
    { title: "Annual Sports Day", body: "Annual Sports Day is scheduled for March 5th. All students are encouraged to participate in at least one event. Registration closes Feb 28th.", author: "Sports Department", date: "2025-02-17", type: "event", pinned: false },
    { title: "Parent-Teacher Meeting", body: "A parent-teacher conference is scheduled for February 25th from 9:00 AM to 4:00 PM. Please book your slot through the parent portal.", author: "Principal", date: "2025-02-15", type: "meeting", pinned: true },
    { title: "Library Books Return Reminder", body: "All library books borrowed for the winter term are due by February 22nd. Late returns will incur a fee.", author: "Library", date: "2025-02-14", type: "info", pinned: false },
];

const TYPE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    exam: { color: "#FF6B6B", icon: <School sx={{ fontSize: 18 }} /> },
    event: { color: "#7C4DFF", icon: <Campaign sx={{ fontSize: 18 }} /> },
    meeting: { color: "#00E5FF", icon: <Announcement sx={{ fontSize: 18 }} /> },
    info: { color: "#FFB74D", icon: <InfoOutlined sx={{ fontSize: 18 }} /> },
};

export default function AnnouncementsPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Announcements</Typography>
                <Typography color="text.secondary" mt={0.5}>School-wide notices and communications</Typography>
            </Box>
            {ANNOUNCEMENTS.map((ann, i) => (
                <Card key={i} sx={{ mb: 2, borderLeft: `4px solid ${TYPE_CONFIG[ann.type].color}`, cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "translateX(4px)" } }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ color: TYPE_CONFIG[ann.type].color }}>{TYPE_CONFIG[ann.type].icon}</Box>
                                <Typography variant="h6" fontWeight={700}>{ann.title}</Typography>
                                {ann.pinned && <Chip label="Pinned" size="small" sx={{ bgcolor: "rgba(124,77,255,0.15)", color: "#7C4DFF", border: "none", fontSize: 10 }} />}
                            </Box>
                            <Typography variant="caption" color="text.secondary">{new Date(ann.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>{ann.body}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, background: TYPE_CONFIG[ann.type].color, fontSize: 10 }}>{ann.author.charAt(0)}</Avatar>
                            <Typography variant="caption" color="text.secondary">{ann.author}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
