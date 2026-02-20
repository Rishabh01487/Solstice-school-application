"use client";

import React, { useState, useEffect } from "react";
import {
    Box, Card, CardContent, Typography, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Avatar,
    Chip, TextField, InputAdornment, Button, IconButton,
    Skeleton, Tooltip, Grid,
} from "@mui/material";
import {
    Search, Add, FilterList, Download, Visibility,
    Edit, DeleteOutline, School,
} from "@mui/icons-material";
import { studentsApi } from "@/lib/api";

interface Student {
    id: string;
    full_name: string;
    email: string;
    grade: string;
    status: string;
    admission_date: string;
    guardian_name?: string;
}

const DEMO_STUDENTS: Student[] = [
    { id: "1", full_name: "Aiden Martinez", email: "aiden@student.edunexus.school", grade: "Grade 10", status: "active", admission_date: "2023-09-01", guardian_name: "Robert Martinez" },
    { id: "2", full_name: "Sofia Chen", email: "sofia@student.edunexus.school", grade: "Grade 11", status: "active", admission_date: "2022-09-01", guardian_name: "Li Chen" },
    { id: "3", full_name: "Marcus Thompson", email: "marcus@student.edunexus.school", grade: "Grade 9", status: "active", admission_date: "2024-09-01", guardian_name: "John Thompson" },
    { id: "4", full_name: "Emma Wilson", email: "emma@student.edunexus.school", grade: "Grade 12", status: "graduated", admission_date: "2021-09-01", guardian_name: "Sarah Wilson" },
    { id: "5", full_name: "Liam Patel", email: "liam@student.edunexus.school", grade: "Grade 10", status: "active", admission_date: "2023-09-01", guardian_name: "Raj Patel" },
    { id: "6", full_name: "Zoe Anderson", email: "zoe@student.edunexus.school", grade: "Grade 11", status: "suspended", admission_date: "2022-09-01", guardian_name: "Mike Anderson" },
];

const STATUS_COLORS: Record<string, "success" | "error" | "warning" | "default"> = {
    active: "success", graduated: "default", suspended: "error", inactive: "warning",
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filtered, setFiltered] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await studentsApi.list({ limit: 50 });
                setStudents(res.data.items || DEMO_STUDENTS);
            } catch {
                setStudents(DEMO_STUDENTS);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!search) { setFiltered(students); return; }
        const q = search.toLowerCase();
        setFiltered(students.filter((s) =>
            s.full_name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.grade?.toLowerCase().includes(q)
        ));
    }, [search, students]);

    const stats = {
        total: students.length,
        active: students.filter((s) => s.status === "active").length,
        graduated: students.filter((s) => s.status === "graduated").length,
    };

    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Students</Typography>
                    <Typography color="text.secondary" mt={0.5}>Manage student records and enrollment</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Button id="export-students-btn" variant="outlined" startIcon={<Download />} size="small"
                        sx={{ borderColor: "rgba(255,255,255,0.1)", color: "text.secondary" }}>
                        Export
                    </Button>
                    <Button id="add-student-btn" variant="contained" startIcon={<Add />} size="small">
                        Add Student
                    </Button>
                </Box>
            </Box>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: "Total", value: stats.total, color: "#7C4DFF" },
                    { label: "Active", value: stats.active, color: "#00E676" },
                    { label: "Graduated", value: stats.graduated, color: "#00E5FF" },
                ].map((s, i) => (
                    <Grid item xs={4} sm="auto" key={i}>
                        <Box sx={{ px: 3, py: 2, borderRadius: 2, background: `${s.color}10`, border: `1px solid ${s.color}25`, textAlign: "center", minWidth: 100 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Table */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {/* Search bar */}
                    <Box sx={{ p: 3, display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <TextField
                            id="student-search"
                            placeholder="Search by name, email or grade..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            sx={{ flex: 1, maxWidth: 400 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ fontSize: 18, color: "text.secondary" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Tooltip title="Filter">
                            <IconButton id="filter-btn" sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                                <FilterList />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["Student", "Grade", "Status", "Admission", "Guardian", "Actions"].map((h) => (
                                        <TableCell key={h} sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((__, j) => (
                                                <TableCell key={j}><Skeleton sx={{ bgcolor: "rgba(255,255,255,0.04)" }} /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                    : filtered.map((student) => (
                                        <TableRow key={student.id} sx={{
                                            "&:hover": { background: "rgba(124,77,255,0.04)" },
                                            transition: "background 0.15s ease",
                                            "& td": { borderBottom: "1px solid rgba(255,255,255,0.03)" },
                                        }}>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 36, height: 36, fontSize: 13, fontWeight: 700,
                                                        background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
                                                    }}>
                                                        {student.full_name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{student.full_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <School sx={{ fontSize: 14, color: "text.secondary" }} />
                                                    <Typography variant="body2">{student.grade}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={student.status}
                                                    size="small"
                                                    color={STATUS_COLORS[student.status] || "default"}
                                                    sx={{ textTransform: "capitalize", fontSize: 11 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(student.admission_date).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">{student.guardian_name || "—"}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                                    <Tooltip title="View"><IconButton id={`view-${student.id}`} size="small"><Visibility sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                    <Tooltip title="Edit"><IconButton id={`edit-${student.id}`} size="small"><Edit sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                    <Tooltip title="Delete"><IconButton id={`delete-${student.id}`} size="small" sx={{ "&:hover": { color: "#FF5252" } }}><DeleteOutline sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {!loading && filtered.length === 0 && (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <School sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.3 }} />
                            <Typography color="text.secondary">No students found</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
