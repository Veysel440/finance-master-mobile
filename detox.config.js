/** @type {Detox.DetoxConfig} */
module.exports = {
    testRunner: { args: { $0: "jest", config: "e2e/jest.config.js" }, jest: { setupTimeout: 120000 } },
    apps: {
        "android.debug": {
            type: "android.apk",
            build: "expo run:android --device",
            binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
        },
    },
    devices: { emulator: { type: "android.emulator", device: { avdName: "Pixel_5_API_34" } } },
    configurations: { "android.debug": { device: "emulator", app: "android.debug" } },
};