export type Role = "student" | "teacher";

export interface User {
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: Role;
    createdAt?: string;
}

export interface AuthSession {
    user: User;
    token: string;
}

export interface SessionQuestion {
    id: number;
    text: string;
    askedBy: string;
    isAnonymous?: boolean;
    source?: "student" | "ai";
    needsTeacher?: boolean;
    answers: string[];
}

export interface SessionRecord {
    id: string;
    title: string;
    teacher: string;
    teacherEmail: string;
    status: "live" | "paused" | "ended";
    createdAt: string;
    endedAt?: string;
    enrolledParticipants: string[];
    liveParticipants: string[];
    questions?: SessionQuestion[];
    participants?: string[];
}
