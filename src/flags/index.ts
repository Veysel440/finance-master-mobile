import Constants from "expo-constants";
const extra = (Constants.expoConfig?.extra || {}) as any;
export const flags = Object.freeze(extra.flags || {});