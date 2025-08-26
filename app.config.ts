import type { ExpoConfig } from "expo/config";
import { config as loadEnv } from "dotenv";

const APP_ENV = process.env.APP_ENV ?? "development";
loadEnv({ path: `.env.${APP_ENV}` });

const config: ExpoConfig = {
    name: "Finance Master",
    slug: "finance-master-mobile",
    scheme: "finmaster",
    extra: {
        API_URL: process.env.EXPO_PUBLIC_API_URL,
        env: process.env.APP_ENV ?? "development",
        pinCert: "api_cert",
        captchaProvider: process.env.EXPO_PUBLIC_CAPTCHA_PROVIDER ?? "turnstile",
        captchaSiteKey: process.env.EXPO_PUBLIC_CAPTCHA_SITEKEY ?? "",
        captchaBaseURL: process.env.EXPO_PUBLIC_CAPTCHA_BASEURL ?? "https://your-domain.tld"
    },
    plugins: [
        ["sentry-expo", { organization: "<org>", project: "<project>" }],
        "@react-native-firebase/app",
        [
            "@react-native-firebase/crashlytics",
            {
                android_google_services_file: "./google-services.json",
                ios_google_services_file: "./GoogleService-Info.plist",
            },
        ],
    ],
    android: { package: "com.example.financemaster" },
    ios: { bundleIdentifier: "com.example.financemaster" },
};

export default config;