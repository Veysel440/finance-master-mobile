import { AccessibilityInfo, findNodeHandle } from "react-native";

export function announce(msg: string) {
    AccessibilityInfo.announceForAccessibility?.(msg);
}

export type A11y = {
    label?: string;
    hint?: string;
    role?: "button" | "header" | "image" | "text";
};

export function a11yProps(a: A11y = {}) {
    return {
        accessible: true,
        accessibilityLabel: a.label,
        accessibilityHint: a.hint,
        accessibilityRole: a.role,
    };
}

export function focusRef(ref: any) {
    const node = findNodeHandle(ref?.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
}