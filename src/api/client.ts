import axios, { AxiosError, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { mapApiError } from "./errors";
import { toast } from "@/ui/toast/bridge";
import { useAuthStore } from "@/store/auth";
import { resetOnLogout } from "@/sync/sync";

const ENV = (Constants.expoConfig?.extra as any)?.env || process.env.APP_ENV || "development";
const baseURL =
    (Constants.expoConfig?.extra as any)?.API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://127.0.0.1:8080";

export const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

/** HTTPS zorunluluğu */
const isHttps = /^https:\/\//i.test(baseURL);
if (ENV === "production" && !isHttps) {
    throw new Error("HTTP baseURL prod ortamında yasak. HTTPS kullanın.");
} else if (!isHttps) {
    console.warn("[SECURITY] API URL HTTPS değil. Sadece geliştirmede kullanın:", baseURL);
}

/** Token yardımcıları */
async function getToken() {
    const s = useAuthStore.getState() as any;
    return s?.token ?? (await SecureStore.getItemAsync("token"));
}
async function getRefresh() {
    const s = useAuthStore.getState() as any;
    return s?.refresh ?? (await SecureStore.getItemAsync("refresh"));
}
async function setAuth(token: string, refresh?: string) {
    const s = useAuthStore.getState() as any;
    if (typeof s?.setAuth === "function") s.setAuth(token, refresh);
    await SecureStore.setItemAsync("token", token);
    if (refresh) await SecureStore.setItemAsync("refresh", refresh);
}

/** Sertifika pinning preflight (opsiyonel) */
const PIN_CERT = process.env.EXPO_PUBLIC_PIN_CERT || (Constants.expoConfig?.extra as any)?.pinCert;
let pinChecked = false;
async function ensurePinned() {
    if (pinChecked || !PIN_CERT || !isHttps) return;
    try {
        // @ts-ignore optional
        const { fetch: rnFetch } = require("react-native-ssl-pinning");
        const health = baseURL.replace(/\/+$/, "") + "/health";
        await rnFetch(health, { method: "GET", timeoutInterval: 6000, sslPinning: { certs: [PIN_CERT] } });
        pinChecked = true;
    } catch {
        throw new Error("SSL pinning doğrulaması başarısız.");
    }
}

/** Refresh mutex + herd kilidi */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
const waiters: Array<(t: string) => void> = [];
const queue: Array<AxiosRequestConfig & { _retry?: boolean }> = [];
function notifyAll(t: string) { while (waiters.length) waiters.shift()!(t); }
async function ensureToken(): Promise<string> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
            try {
                const r = await getRefresh();
                if (!r) throw new Error("no_refresh");
                const { data } = await axios.post(`${baseURL}/v1/auth/refresh`, { refresh: r }, { timeout: 10000 });
                await setAuth(data.token, data.refresh);
                return data.token as string;
            } finally {
                isRefreshing = false;
            }
        })();
        refreshPromise.then((t) => notifyAll(t)).catch(() => notifyAll(""));
    }
    return new Promise((res) => waiters.push(res));
}

/** İstek interceptor */
api.interceptors.request.use(async (config) => {
    await ensurePinned();
    const t = await getToken();
    if (t) {
        if ((config.headers as any)?.set) {
            (config.headers as any).set("Authorization", `Bearer ${t}`);
        } else {
            config.headers = (config.headers || {}) as any;
            (config.headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
        }
    }
    return config;
});

/** Yanıt interceptor */
api.interceptors.response.use(
    (resp) => resp,
    async (error: AxiosError<any>) => {
        const original = error.config as (AxiosRequestConfig & { _retry?: boolean });
        const status = error.response?.status;

        if (status === 401 && !original?._retry) {
            original._retry = true;
            queue.push(original);

            let newToken = "";
            try { newToken = await ensureToken(); } catch { newToken = ""; }
            if (!newToken) {
                try { (useAuthStore.getState() as any).logout?.(); await resetOnLogout(); } catch {}
                return Promise.reject(error);
            }

            const pending = [...queue]; queue.length = 0;
            pending.forEach((cfg) => {
                if ((cfg.headers as any)?.set) {
                    (cfg.headers as any).set("Authorization", `Bearer ${newToken}`);
                } else {
                    cfg.headers = (cfg.headers || {}) as any;
                    (cfg.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
                }
            });
            return api.request(pending[0]);
        }

        try {
            const msg = mapApiError(error.response?.data, error.response?.status);
            toast(msg, "error");
        } catch {}
        return Promise.reject(error);
    }
);