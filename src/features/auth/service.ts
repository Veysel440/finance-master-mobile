import { api } from "@/api/client";

export type SessionRow = {
    id: number;
    ua?: string;
    ip?: string;
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
};

export async function login(payload: {
    email: string; password: string; totp?: string;
    deviceId?: string; deviceName?: string; captcha?: string;
}) {
    const { data } = await api.post("/v1/auth/login", payload);
    return data;
}

export async function listSessions(): Promise<SessionRow[]> {
    const { data } = await api.get("/v1/auth/sessions");
    return data;
}

export async function revokeSession(id: number) {
    await api.delete(`/v1/auth/sessions/${id}`);
}