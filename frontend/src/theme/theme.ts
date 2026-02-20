import { createTheme, alpha } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#DC2626", light: "#EF4444", dark: "#B91C1C", contrastText: "#fff" },
        secondary: { main: "#1E40AF", light: "#3B82F6", dark: "#1E3A8A" },
        background: { default: "#F9FAFB", paper: "#FFFFFF" },
        success: { main: "#16A34A" },
        warning: { main: "#D97706" },
        error: { main: "#DC2626" },
        text: { primary: "#111827", secondary: "#6B7280" },
    },
    typography: {
        fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
        h1: { fontWeight: 800 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 },
        h4: { fontWeight: 700 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 10, boxShadow: "none", "&:hover": { boxShadow: "none" } },
                contained: {
                    background: `linear-gradient(135deg, #DC2626, #EF4444)`,
                    "&:hover": { background: `linear-gradient(135deg, #B91C1C, #DC2626)` },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: "1px solid #F3F4F6",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    "&:hover": { borderColor: alpha("#DC2626", 0.25), boxShadow: `0 4px 16px ${alpha("#DC2626", 0.08)}` },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        "& fieldset": { borderColor: "#E5E7EB" },
                        "&:hover fieldset": { borderColor: "#DC2626" },
                        "&.Mui-focused fieldset": { borderColor: "#DC2626" },
                    },
                },
            },
        },
        MuiTabs: { styleOverrides: { indicator: { backgroundColor: "#DC2626" } } },
        MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, "&.Mui-selected": { color: "#DC2626" } } } },
        MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiAppBar: { styleOverrides: { root: { backgroundColor: "#fff", borderBottom: "1px solid #F3F4F6", color: "#111827" } } },
    },
});
