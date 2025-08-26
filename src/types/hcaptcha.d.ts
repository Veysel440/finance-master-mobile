declare module "react-native-hcaptcha" {
    import * as React from "react";
    export type Size = "invisible" | "normal" | "compact";
    export interface HCaptchaProps {
        siteKey: string;
        baseUrl: string;
        size?: Size;
        onMessage?: (e: { nativeEvent: { data?: string } }) => void;
        onError?: () => void;
    }
    export default class HCaptcha extends React.Component<HCaptchaProps> {
        show(): void;
    }
}