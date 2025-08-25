module.exports = {
    root: true,
    extends: ["expo", "prettier"],
    rules: {
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "expo-clipboard",
                        message: "Clipboard kullanımı güvenlik nedeni ile engellendi.",
                    },
                ],
            },
        ],
    },
};