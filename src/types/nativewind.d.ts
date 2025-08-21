/// <reference types="nativewind/types" />

// Ek güvence: RN prop'larına className ekle
import "react-native";

type ClassNameProp = { className?: string };

declare module "react-native" {
    interface ViewProps extends ClassNameProp {}
    interface TextProps extends ClassNameProp {}
    interface PressableProps extends ClassNameProp {}
    interface TextInputProps extends ClassNameProp {}
    interface ScrollViewProps extends ClassNameProp {}
    interface FlatListProps<ItemT> extends ClassNameProp {}
}