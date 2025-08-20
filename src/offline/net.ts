import NetInfo from "@react-native-community/netinfo";
export const onReconnect = (fn: () => void) =>
    NetInfo.addEventListener(state => { if (state.isConnected && state.isInternetReachable) fn(); });
export const isOnline = async () => {
    const s = await NetInfo.fetch(); return !!(s.isConnected && s.isInternetReachable);
};