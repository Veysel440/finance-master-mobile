let fn: (msg: string, type?: "error" | "success" | "info") => void = () => {};
export function bindToast(show: typeof fn) { fn = show; }
export function toast(msg: string, type?: "error" | "success" | "info") { fn(msg, type); }