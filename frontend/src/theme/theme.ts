import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#DC2626",
            light: "#EF4444",
            dark: "#B91C1C",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#1E40AF",
            light: "#3B82F6",
            dark: "#1E3A8A",
        },
        background: {
            default: "#F9FAFB",
            paper: "#FFFFFF",
        },
        success: { main: "#16A34A" },
        warning: { main: "#D97706" },
        error: { main: "#DC2626" },
        text: {
            primary: "#111827",
            secondary: "#6B7280",
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, letterSpacing: "-0.02em" },
        h2: { fontWeight: 700, letterSpacing: "-0.01em" },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: "10px 24px",
                    fontSize: "0.875rem",
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                },
                contained: {
                    background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
                    "&:hover": {
                        background: "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                    "&:hover": {
                        border: "1px solid #FECACA",
                        boxShadow: "0 4px 12px rgba(220,38,38,0.08)",
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        backgroundColor: "#FAFAFA",
                        "& fieldset": { borderColor: "#E5E7EB" },
                        "&:hover fieldset": { borderColor: "#DC2626" },
                        "&.Mui-focused fieldset": { borderColor: "#DC2626" },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#FFFFFF",
                    borderBottom: "1px solid #E5E7EB",
                    color: "#111827",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8 },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none" },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    "&.Mui-selected": { color: "#DC2626" },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: { backgroundColor: "#DC2626" },
            },
        },
    },
});
