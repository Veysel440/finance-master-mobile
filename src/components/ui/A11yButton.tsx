import { Pressable, Text, PressableProps } from "react-native";
import { a11yProps } from "@/a11y";

type Props = PressableProps & {
    text: string;
    label?: string;
    hint?: string;
    className?: string;
    textClassName?: string;
};
export default function A11yButton({ text, label, hint, className, textClassName, ...rest }: Props) {
    return (
        <Pressable {...a11yProps({ label: label ?? text, hint, role: "button" })} className={className} {...rest}>
            <Text className={textClassName}>{text}</Text>
        </Pressable>
    );
}