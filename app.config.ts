import { ExpoConfig } from "expo/config";
const config: ExpoConfig = {
    name: "Finance Master",
    slug: "finance-master-mobile",
    scheme: "finmaster",
    extra: { API_URL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000" }
};
export default config;