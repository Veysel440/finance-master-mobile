import NetInfo from "@react-native-community/netinfo";

export async function isOnline() {
    const s = await NetInfo.fetch();
    return Boolean(s.isConnected && s.isInternetReachable);
}

type Fn = () => void;
let subs: Fn[] = [];
NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) subs.forEach(f => f());
});
export function onReconnect(fn: Fn) {
    subs.push(fn);
    return () => { subs = subs.filter(x => x !== fn); };
}