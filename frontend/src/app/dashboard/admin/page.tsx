"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Admin route — redirects back to dashboard
export default function AdminPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard");
    }, [router]);
    return null;
}
