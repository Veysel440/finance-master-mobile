import type { ExpoConfig } from "expo/config";
import { config as loadEnv } from "dotenv";

const APP_ENV = process.env.APP_ENV ?? "development";
loadEnv({ path: `.env.${APP_ENV}` });

const config: ExpoConfig = {
    name: "Finance Master",
    slug: "finance-master-mobile",
    scheme: "finmaster",
    extra: {
        flags: {
            newDashboard: process.env.FLAG_NEW_DASHBOARD === "1",
            ftSearchDefault: process.env.FLAG_FT_DEFAULT === "1"
        },
        API_URL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080",
        sentryDsn: process.env.SENTRY_DSN || "",
        env: APP_ENV,
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