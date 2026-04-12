import type { AuthSession, SessionRecord, User } from "../types/models";

const AUTH_USER_KEY = "currentUser";
const AUTH_TOKEN_KEY = "authToken";
const LEGACY_USERS_KEY = "users";
const SESSIONS_KEY = "sessions";

export function getCurrentUser(): User | null {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function getAuthToken(): string {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthSession(session: AuthSession): void {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    sessionStorage.setItem(AUTH_TOKEN_KEY, session.token);
}

export function setCurrentUser(user: User): void {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function clearAuthSession(): void {
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getLegacyUsers(): User[] {
    const raw = sessionStorage.getItem(LEGACY_USERS_KEY);
    if (!raw) {
        return [];
    }

    try {
        return JSON.parse(raw) as User[];
    } catch {
        return [];
    }
}

export function getSessions(): SessionRecord[] {
    const raw = localStorage.getItem(SESSIONS_KEY);
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
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event("sessionsUpdated"));
}
