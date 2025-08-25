
try {

    const Clipboard: any = require("expo-clipboard");

    if (Clipboard) {
        const noopAsync = async () => undefined;
        const noopStr = async () => "";


        Clipboard.getStringAsync = noopStr;
        Clipboard.getStringAsyncWithOptions = noopStr;
        Clipboard.getUrlAsync = noopStr;
        Clipboard.getImageAsync = async () => ({ data: "", size: { width: 0, height: 0 } });

        Clipboard.setString = () => {};
        Clipboard.setStringAsync = noopAsync;
        Clipboard.setUrlAsync = noopAsync;
        Clipboard.setImageAsync = noopAsync;


        if (__DEV__) {

            console.warn("[SECURITY] Clipboard API devrede ama no-op’a yönlendirildi.");
        }
    }
} catch {

}