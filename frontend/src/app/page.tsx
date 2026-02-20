"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Box, CircularProgress } from "@mui/material";

export default function HomePage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/dashboard");
        } else {
            router.replace("/login");
        }
    }, [isAuthenticated, router]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-bg)",
            }}
        >
            <CircularProgress sx={{ color: "var(--color-primary)" }} />
        </Box>
    );
}
