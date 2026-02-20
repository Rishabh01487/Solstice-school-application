import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
    title: "Ridgewood Educations — Student Information System",
    description:
        "Modern K-12 Student Information System with multi-role portals, attendance, gradebook, and analytics. Powered by Ridgewood Educations.",
    keywords: ["Ridgewood Educations", "school", "SIS", "student information", "attendance", "grades"],
    openGraph: {
        title: "Ridgewood Educations",
        description: "Next-generation School Information System by Ridgewood Educations",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
