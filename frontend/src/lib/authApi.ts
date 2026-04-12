import type { AuthSession, Role, User } from "../types/models";

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(payload.message || "Request failed", response.status);
    }

    return payload as T;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: Role;
}

interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

interface SessionResponse {
    user: User;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
    const response = await requestJson<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return {
        user: response.user,
        token: response.token
    };
}

export async function signup(payload: SignupPayload): Promise<AuthSession> {
    const response = await requestJson<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return {
        user: response.user,
        token: response.token
    };
}

export async function me(token: string): Promise<User> {
    const response = await requestJson<SessionResponse>("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.user;
}