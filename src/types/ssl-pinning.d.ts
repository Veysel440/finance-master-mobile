declare module "react-native-ssl-pinning" {
    export function fetch(url: string, opts: {
        method?: "GET"|"POST"|"PUT"|"DELETE"|"PATCH";
        headers?: Record<string, string>;
        body?: string;
        timeoutInterval?: number;
        sslPinning?: { certs: string[] };
    }): Promise<{ status: number; headers: any; bodyString: string }>;
}