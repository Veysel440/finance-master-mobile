import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

const KEY_NAME = "queue_key";

async function getKey(): Promise<string> {
    let k = await SecureStore.getItemAsync(KEY_NAME);
    if (!k) {
        k = CryptoJS.lib.WordArray.random(32).toString();
        await SecureStore.setItemAsync(KEY_NAME, k);
    }
    return k;
}

export async function enc(obj: unknown): Promise<string> {
    const key = await getKey();
    const plaintext = JSON.stringify(obj);
    return CryptoJS.AES.encrypt(plaintext, key).toString();
}

export async function dec<T>(cipher: string): Promise<T> {
    const key = await getKey();
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(text) as T;
}