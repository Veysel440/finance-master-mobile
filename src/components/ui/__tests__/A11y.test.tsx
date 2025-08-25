import React from "react";
import { render } from "@testing-library/react-native";
import { A11yText } from "@/components/ui/A11y";
import { Text } from "react-native";

it("renders text with scaling", () => {
    const { getByText } = render(<A11yText>Merhaba</A11yText>);
    expect(getByText("Merhaba")).toBeTruthy();
});