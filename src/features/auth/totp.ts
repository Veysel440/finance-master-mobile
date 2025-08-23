import { api } from "@/api/client";

export async function totpSetup(email: string): Promise<{secret:string; otpauth:string}> {
    const { data } = await api.post("/v1/auth/totp/setup", null, { params: { email } });
    return data;
}
export async function totpConfirm(code: string): Promise<void> {
    await api.post("/v1/auth/totp/confirm", { code });
}