import type { SessionRecord, User } from "../types/models";

export function getCurrentUser(): User | null {
    const raw = sessionStorage.getItem("currentUser");
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function getUsers(): User[] {
    const raw = sessionStorage.getItem("users");
    if (!raw) {
        return [];
    }

    try {
        return JSON.parse(raw) as User[];
    } catch {
        return [];
    }
}

export function setUsers(users: User[]): void {
    sessionStorage.setItem("users", JSON.stringify(users));
}

export function setCurrentUser(user: User): void {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearCurrentUser(): void {
    sessionStorage.removeItem("currentUser");
}

export function getSessions(): SessionRecord[] {
    const raw = localStorage.getItem("sessions");
    if (!raw) {
        return [];
    }

    try {
        const sessions = JSON.parse(raw) as SessionRecord[];
        return sessions.map((session) => ({
            ...session,
            status:
                session.status === "live" || session.status === "paused" || session.status === "ended"
                    ? session.status
                    : "live",
            enrolledParticipants: Array.isArray(session.enrolledParticipants)
                ? session.enrolledParticipants
                : Array.isArray(session.participants)
                ? session.participants
                : [],
            liveParticipants: Array.isArray(session.liveParticipants)
                ? session.liveParticipants
                : Array.isArray(session.participants)
                ? session.participants
                : [],
            questions: Array.isArray(session.questions)
                ? session.questions.map((question) => ({
                      ...question,
                      source: question.source === "ai" ? "ai" : "student",
                      needsTeacher: typeof question.needsTeacher === "boolean" ? question.needsTeacher : true,
                      isAnonymous: Boolean(question.isAnonymous)
                  }))
                : []
        }));
    } catch {
        return [];
    }
}

export function setSessions(sessions: SessionRecord[]): void {
    localStorage.setItem("sessions", JSON.stringify(sessions));
    window.dispatchEvent(new Event("sessionsUpdated"));
}
