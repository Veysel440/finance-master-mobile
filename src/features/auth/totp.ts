import { api } from "@/api/client";

export async function totpSetup(email?: string) {
    const { data } = await api.post(`/v1/auth/totp/setup`, null, { params: email ? { email } : {} });
    return data as { secret: string; otpauth: string };
}

export async function totpConfirm(code: string) {
    const { data } = await api.post(`/v1/auth/totp/confirm`, { code });
    return data as { status: string };
}