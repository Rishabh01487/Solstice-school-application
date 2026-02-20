"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Chip, Table, TableHead, TableRow, TableCell, TableBody, Avatar } from "@mui/material";

const GRADES_DATA = [
    { student: "Aiden Martinez", math: 88, science: 91, english: 75, history: 82, cs: 95, avg: 86, grade: "B+" },
    { student: "Sofia Chen", math: 96, science: 94, english: 92, history: 90, cs: 88, avg: 92, grade: "A" },
    { student: "Marcus Thompson", math: 72, science: 68, english: 80, history: 76, cs: 85, avg: 76, grade: "B" },
    { student: "Emma Wilson", math: 99, science: 97, english: 95, history: 98, cs: 100, avg: 98, grade: "A+" },
    { student: "Liam Patel", math: 80, science: 85, english: 78, history: 83, cs: 90, avg: 83, grade: "B+" },
];

const gradeColor = (score: number) => score >= 90 ? "#00E676" : score >= 75 ? "#FFB74D" : "#FF5252";

export default function GradebookPage() {
    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Gradebook</Typography>
                <Typography color="text.secondary" mt={0.5}>Academic performance across all subjects</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: "Class Average", value: "87.0", color: "#7C4DFF" },
                    { label: "Highest Score", value: "98.0", color: "#00E676" },
                    { label: "Lowest Score", value: "76.0", color: "#FF5252" },
                    { label: "A Grade Students", value: "2", color: "#00E5FF" },
                ].map((s, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card><CardContent sx={{ p: 2.5 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </CardContent></Card>
                    </Grid>
                ))}
            </Grid>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <Typography variant="h6" fontWeight={700}>Term 2 — Grade Report</Typography>
                    </Box>
                    <Box sx={{ overflowX: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["Student", "Math", "Science", "English", "History", "CS", "Average", "Grade"].map((h) => (
                                        <TableCell key={h} sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {GRADES_DATA.map((row, i) => (
                                    <TableRow key={i} sx={{ "& td": { borderBottom: "1px solid rgba(255,255,255,0.03)" } }}>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 30, height: 30, fontSize: 12, background: "linear-gradient(135deg, #7C4DFF, #00E5FF)" }}>{row.student.charAt(0)}</Avatar>
                                                <Typography variant="body2" fontWeight={500}>{row.student}</Typography>
                                            </Box>
                                        </TableCell>
                                        {[row.math, row.science, row.english, row.history, row.cs].map((score, j) => (
                                            <TableCell key={j}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ color: gradeColor(score) }}>{score}</Typography>
                                                    <LinearProgress variant="determinate" value={score} sx={{ mt: 0.5, height: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.04)", "& .MuiLinearProgress-bar": { background: gradeColor(score) } }} />
                                                </Box>
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: gradeColor(row.avg) }}>{row.avg}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={row.grade} size="small" sx={{ fontWeight: 700, bgcolor: `${gradeColor(row.avg)}20`, color: gradeColor(row.avg), border: "none" }} />
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
