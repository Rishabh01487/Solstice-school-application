"use client";
import React from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress } from "@mui/material";
import { CurrencyRupee, CheckCircle, Warning, TrendingUp } from "@mui/icons-material";

const INVOICES = [
    { student: "Aiden Martinez", amount: 2500, paid: 2500, due: "2025-03-01", status: "paid" },
    { student: "Sofia Chen", amount: 2500, paid: 1250, due: "2025-03-01", status: "partial" },
    { student: "Marcus Thompson", amount: 2500, paid: 0, due: "2025-02-15", status: "overdue" },
    { student: "Emma Wilson", amount: 2500, paid: 2500, due: "2025-03-01", status: "paid" },
    { student: "Liam Patel", amount: 2500, paid: 2000, due: "2025-03-15", status: "partial" },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
    paid: <CheckCircle sx={{ fontSize: 16, color: "#00E676" }} />,
    partial: <TrendingUp sx={{ fontSize: 16, color: "#FFB74D" }} />,
    overdue: <Warning sx={{ fontSize: 16, color: "#FF5252" }} />,
};
const STATUS_COLOR: Record<string, string> = { paid: "#00E676", partial: "#FFB74D", overdue: "#FF5252" };

export default function FinancePage() {
    const total = INVOICES.reduce((s, i) => s + i.amount, 0);
    const collected = INVOICES.reduce((s, i) => s + i.paid, 0);

    return (
        <Box sx={{ animation: "fadeIn 0.4s ease" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Finance</Typography>
                <Typography color="text.secondary" mt={0.5}>Fee management and payment tracking</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                    { label: "Total Expected", value: `₹${total.toLocaleString("en-IN")}`, color: "#7C4DFF", icon: <CurrencyRupee /> },
                    { label: "Collected", value: `₹${collected.toLocaleString("en-IN")}`, color: "#00E676", icon: <CheckCircle /> },
                    { label: "Pending", value: `₹${(total - collected).toLocaleString("en-IN")}`, color: "#FF5252", icon: <Warning /> },
                    { label: "Collection Rate", value: `${Math.round((collected / total) * 100)}%`, color: "#00E5FF", icon: <TrendingUp /> },
                ].map((s, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card><CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Box sx={{ color: s.color }}>{s.icon}</Box>
                            </Box>
                            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </CardContent></Card>
                    </Grid>
                ))}
            </Grid>

            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={3}>Fee Collection Status</Typography>
                    {INVOICES.map((inv, i) => (
                        <Box key={i} sx={{ mb: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {STATUS_ICON[inv.status]}
                                    <Typography variant="body2" fontWeight={600}>{inv.student}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary">₹{inv.paid.toLocaleString("en-IN")} / ₹{inv.amount.toLocaleString("en-IN")}</Typography>
                                    <Chip label={inv.status} size="small" sx={{ textTransform: "capitalize", bgcolor: `${STATUS_COLOR[inv.status]}20`, color: STATUS_COLOR[inv.status], border: "none", fontWeight: 600 }} />
                                </Box>
                            </Box>
                            <LinearProgress variant="determinate" value={(inv.paid / inv.amount) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { borderRadius: 4, background: STATUS_COLOR[inv.status] } }} />
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Box>
    );
}
