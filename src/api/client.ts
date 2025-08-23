import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";


export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080",
    timeout: 10000,
});

api.interceptors.response.use(
    (r) => r,
    async (err) => {
        const data = err?.response?.data;
        const msg =
            data?.message ||
            (typeof data === "string" ? data : "") ||
            "Beklenmeyen hata";
        if (err?.response?.status >= 400) {
            Toast.show({ type: "error", text1: msg });
        }

        return Promise.reject(err);
    }
);

let refreshing = false;
let pending: Array<() => void> = [];

async function getAccess() { return SecureStore.getItemAsync("access_token"); }
async function getRefresh() { return SecureStore.getItemAsync("refresh_token"); }

api.interceptors.request.use(async (cfg) => {
    const t = await getAccess();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

api.interceptors.response.use(
    r => r,
    async err => {
        const cfg = err.config;
        if (err.response?.status !== 401 || cfg.__retried) throw err;


        if (!refreshing) {
            refreshing = true;
            try {
                const refresh = await getRefresh();
                if (!refresh) throw err;
                const { data } = await axios.post(
                    `${api.defaults.baseURL}/v1/auth/refresh`,
                    { refresh }
                );
                await SecureStore.setItemAsync("access_token", data.token);
                await SecureStore.setItemAsync("refresh_token", data.refresh);
                pending.forEach(fn => fn()); pending = [];
            } catch (e) {
                pending = []; refreshing = false;
                throw err;
            }
            refreshing = false;
        }
        await new Promise<void>(res => pending.push(res));
        cfg.__retried = true;
        const t = await getAccess();
        cfg.headers.Authorization = `Bearer ${t}`;
        return api(cfg);
    }
);