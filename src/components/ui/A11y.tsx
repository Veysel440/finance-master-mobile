import { Pressable, Text, TextInput, View, PressableProps, TextInputProps, TextProps } from "react-native";
import React from "react";

export function A11yButton({
                               label,
                               children,
                               ...rest
                           }: PressableProps & { label: string; children: React.ReactNode }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={label}
            {...rest}
        >
            {children}
        </Pressable>
    );
}

export function A11yText({
                             children,
                             ...rest
                         }: TextProps) {
    return (
        <Text allowFontScaling maxFontSizeMultiplier={1.6} {...rest}>
            {children}
        </Text>
    );
}

export function A11yInput({
                              label,
                              ...rest
                          }: TextInputProps & { label: string }) {
    return (
        <View accessible accessibilityLabel={label}>
            <TextInput
                allowFontScaling
                maxFontSizeMultiplier={1.6}
                {...rest}
            />
        </View>
    );
}