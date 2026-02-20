export type Role = "admin" | "teacher" | "parent" | null;

export interface Teacher {
    id: string; name: string; email: string; phone: string;
    subject: string; classes: string[];
}
export interface Student {
    id: string; name: string; rollNo: string; class: string;
    dob: string; parentName: string; parentPhone: string;
    parentEmail: string; address: string; teacherId: string;
}
export interface FeeRecord {
    id: string; studentId: string; month: string; year: number;
    amount: number; paid: boolean; paidDate?: string;
}
export interface Notice {
    id: string; title: string; content: string;
    type: "notice" | "holiday" | "event" | "exam";
    date: string; imageUrl?: string; postedBy: string;
}
export interface Admission {
    id: string; studentName: string; dob: string; class: string;
    parentName: string; phone: string; email: string;
    address: string; date: string; status: "pending" | "approved" | "rejected";
}
export interface AttendanceRecord {
    date: string; studentId: string; present: boolean;
}

export const SCHOOL = {
    name: "Ridgewood Educations",
    director: "Mr. Ankur Gupta (B.H.U)",
    address: "Near Alam Hospital, Hathwa Mor, Mirganj",
    phone: "+91-XXXXXXXXXX",
    email: "info@ridgewoodinstitute.edu.in",
};

export const CLASSES = ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const RED = "#DC2626";

export const LS = {
    get: <T>(key: string, fallback: T): T => {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set: (key: string, val: unknown) => {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
    },
};
