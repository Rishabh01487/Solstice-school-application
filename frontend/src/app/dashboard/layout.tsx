"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, IconButton, Typography, Avatar,
    Divider, Badge, Menu, MenuItem, Tooltip, useMediaQuery,
    useTheme as useMuiTheme,
} from "@mui/material";
import {
    Dashboard, People, School, Assignment, CurrencyRupee,
    Announcement, Event, BarChart, Settings, Logout, Menu as MenuIcon,
    Notifications, AccountCircle, Close, AdminPanelSettings,
    Class, CheckCircle, Grade,
} from "@mui/icons-material";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/contexts/AuthContext";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
    { label: "Dashboard", icon: <Dashboard />, path: "/dashboard", roles: ["admin", "teacher", "student", "parent"] },
    { label: "Students", icon: <People />, path: "/dashboard/students", roles: ["admin", "teacher"] },
    { label: "Teachers", icon: <School />, path: "/dashboard/teachers", roles: ["admin"] },
    { label: "Classes", icon: <Class />, path: "/dashboard/classes", roles: ["admin", "teacher"] },
    { label: "Attendance", icon: <CheckCircle />, path: "/dashboard/attendance", roles: ["admin", "teacher", "student", "parent"] },
    { label: "Gradebook", icon: <Grade />, path: "/dashboard/gradebook", roles: ["admin", "teacher", "student", "parent"] },
    { label: "Assignments", icon: <Assignment />, path: "/dashboard/assignments", roles: ["admin", "teacher", "student", "parent"] },
    { label: "Finance", icon: <CurrencyRupee />, path: "/dashboard/finance", roles: ["admin", "parent"] },
    { label: "Announcements", icon: <Announcement />, path: "/dashboard/announcements", roles: ["admin", "teacher", "student", "parent"] },
    { label: "Calendar", icon: <Event />, path: "/dashboard/calendar", roles: ["admin", "teacher", "student", "parent"] },
    { label: "Reports", icon: <BarChart />, path: "/dashboard/reports", roles: ["admin"] },
    { label: "Settings", icon: <Settings />, path: "/dashboard/settings", roles: ["admin", "teacher", "student", "parent"] },
];

const ROLE_COLORS: Record<string, string> = {
    admin: "#FF6B6B",
    teacher: "#4ECDC4",
    student: "#45B7D1",
    parent: "#96CEB4",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
    admin: <AdminPanelSettings fontSize="small" />,
    teacher: <School fontSize="small" />,
    student: <People fontSize="small" />,
    parent: <AccountCircle fontSize="small" />,
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated } = useAuthStore();
    const { logout } = useAuth();
    const router = useRouter();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activePath, setActivePath] = useState("/dashboard");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        setActivePath(window.location.pathname);
    }, []);

    if (!isAuthenticated || !user) return null;

    const userRole = user.role;
    const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

    const handleNavigate = (path: string) => {
        setActivePath(path);
        router.push(path);
        if (isMobile) setMobileOpen(false);
    };

    const handleLogout = async () => {
        setAnchorEl(null);
        await logout();
    };

    const DrawerContent = () => (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Logo */}
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{
                    p: 0.5, borderRadius: 2,
                    background: "linear-gradient(135deg, rgba(27,77,62,0.4), rgba(15,45,74,0.4))",
                    border: "1px solid rgba(255,215,0,0.25)",
                    boxShadow: "0 0 12px rgba(255,215,0,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 44, height: 44, flexShrink: 0,
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ridgewood-logo.svg" alt="Ridgewood Educations Logo" width={34} height={34} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={800} sx={{
                        background: "linear-gradient(135deg, #FFD700, #2ECC71)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        lineHeight: 1.2, fontSize: "0.85rem",
                    }}>
                        Ridgewood
                    </Typography>
                    <Typography variant="caption" sx={{ lineHeight: 1, color: "#8892A4", fontSize: "0.7rem" }}>
                        Educations
                    </Typography>
                </Box>
                {isMobile && (
                    <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: "auto" }}>
                        <Close fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />

            {/* User info */}
            <Box sx={{ px: 2, py: 2 }}>
                <Box sx={{
                    p: 2, borderRadius: 2,
                    background: "rgba(124,77,255,0.06)",
                    border: "1px solid rgba(124,77,255,0.1)",
                    display: "flex", alignItems: "center", gap: 1.5,
                }}>
                    <Avatar
                        src={user.avatar_url}
                        sx={{
                            width: 38, height: 38,
                            background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
                            fontSize: 14, fontWeight: 700,
                        }}
                    >
                        {user.full_name?.charAt(0) || "U"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {user.full_name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                            <Box sx={{ color: ROLE_COLORS[userRole], display: "flex", alignItems: "center" }}>
                                {ROLE_ICONS[userRole]}
                            </Box>
                            <Typography variant="caption" sx={{ color: ROLE_COLORS[userRole], textTransform: "capitalize" }}>
                                {userRole}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1.5, py: 0 }}>
                {visibleItems.map((item) => {
                    const isActive = activePath === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                id={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    px: 2, py: 1.2,
                                    background: isActive
                                        ? "linear-gradient(135deg, rgba(124,77,255,0.25), rgba(0,229,255,0.08))"
                                        : "transparent",
                                    border: isActive ? "1px solid rgba(124,77,255,0.3)" : "1px solid transparent",
                                    "&:hover": {
                                        background: "rgba(124,77,255,0.12)",
                                        border: "1px solid rgba(124,77,255,0.2)",
                                    },
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 36,
                                    color: isActive ? "#7C4DFF" : "text.secondary",
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: "0.875rem",
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? "#E8ECF4" : "text.secondary",
                                    }}
                                />
                                {isActive && (
                                    <Box sx={{
                                        width: 4, height: 20, borderRadius: 2,
                                        background: "linear-gradient(180deg, #7C4DFF, #00E5FF)",
                                    }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Logout */}
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    id="nav-logout"
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2, px: 2, py: 1.2,
                        "&:hover": { background: "rgba(255,82,82,0.1)", "& *": { color: "#FF5252" } },
                        transition: "all 0.2s ease",
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{ fontSize: "0.875rem", color: "text.secondary" }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
            {/* Sidebar — Desktop */}
            {!isMobile && (
                <Box
                    component="nav"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        background: "rgba(17,24,39,0.95)",
                        borderRight: "1px solid rgba(124,77,255,0.1)",
                        backdropFilter: "blur(20px)",
                        position: "fixed", top: 0, left: 0, height: "100vh",
                        zIndex: 1200,
                        overflowY: "auto",
                    }}
                >
                    <DrawerContent />
                </Box>
            )}

            {/* Sidebar — Mobile Drawer */}
            {isMobile && (
                <Drawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: DRAWER_WIDTH,
                            background: "rgba(10,14,26,0.98)",
                            backdropFilter: "blur(20px)",
                            borderRight: "1px solid rgba(124,77,255,0.15)",
                        },
                    }}
                >
                    <DrawerContent />
                </Drawer>
            )}

            {/* Main content area */}
            <Box sx={{ flex: 1, ml: isMobile ? 0 : `${DRAWER_WIDTH}px`, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                {/* Top AppBar */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        background: "rgba(17,24,39,0.9)",
                        backdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(124,77,255,0.1)",
                    }}
                >
                    <Toolbar sx={{ gap: 2 }}>
                        {isMobile && (
                            <IconButton id="open-menu-btn" onClick={() => setMobileOpen(true)} edge="start">
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                            {visibleItems.find((i) => i.path === activePath)?.label || "Dashboard"}
                        </Typography>

                        <Tooltip title="Notifications">
                            <IconButton id="notifications-btn">
                                <Badge badgeContent={3} color="primary">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Account">
                            <IconButton id="account-btn" onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <Avatar
                                    src={user.avatar_url}
                                    sx={{ width: 34, height: 34, background: "linear-gradient(135deg, #7C4DFF, #00E5FF)" }}
                                >
                                    {user.full_name?.charAt(0)}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            PaperProps={{
                                sx: {
                                    background: "rgba(17,24,39,0.95)",
                                    border: "1px solid rgba(124,77,255,0.2)",
                                    borderRadius: 2, mt: 1,
                                },
                            }}
                        >
                            <MenuItem onClick={() => { setAnchorEl(null); router.push("/dashboard/settings"); }}>
                                <Settings fontSize="small" sx={{ mr: 1 }} /> Profile & Settings
                            </MenuItem>
                            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                            <MenuItem onClick={handleLogout} sx={{ color: "#FF5252" }}>
                                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                    {children}
                </Box>

                {/* Footer */}
                <Box sx={{
                    py: 2, px: 3, borderTop: "1px solid rgba(255,215,0,0.08)",
                    display: "flex", justifyContent: "center", alignItems: "center", gap: 1,
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ridgewood-logo.svg" alt="" width={16} height={16} style={{ opacity: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                        © 2025 Ridgewood Educations · All rights reserved
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
