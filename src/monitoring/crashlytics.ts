import crashlytics from "@react-native-firebase/crashlytics";

export function crashInit(userId?: string) {
    if (userId) crashlytics().setUserId(String(userId));
}
export function crashLog(msg: string) { crashlytics().log(msg); }
export function crashRecord(e: any) { crashlytics().recordError(e); }