export type ApiErrorPayload = { error?: boolean; code?: string; message?: string };

const tr: Record<string, string> = {
    invalid_credentials: "E-posta veya şifre hatalı.",
    totp_required: "TOTP kodu gerekli.",
    totp_invalid: "TOTP kodu geçersiz.",
    validation_failed: "Geçersiz veri.",
    conflict: "Çakışma. Kayıt zaten var.",
    unauthorized: "Yetkisiz.",
    forbidden: "Erişim yasak.",
    not_found: "Bulunamadı.",
    rates_unavailable: "Kur servisine ulaşılamıyor.",
    invalid_refresh: "Oturum yenileme başarısız.",
    method_not_allowed: "Yöntem desteklenmiyor.",
    internal: "Sunucu hatası.",
    bad_request: "Hatalı istek.",
};

export function mapApiError(body?: any, data?: ApiErrorPayload, status?: number): string {
    if (!data) return status && status >= 500 ? "Sunucu hatası." : "Bilinmeyen hata.";
    if (data.code && tr[data.code]) return tr[data.code];
    if (status && status >= 500) return "Sunucu hatası.";
    const code = body?.code;
    if (code === "captcha_required") return "Güvenlik doğrulaması gerekli.";
    return body?.message || `Hata ${status ?? ""}`;
}