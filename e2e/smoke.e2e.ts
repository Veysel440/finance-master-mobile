describe("Smoke", () => {
    it("opens Settings via deep link and sees Kaydet", async () => {
        await device.launchApp({ newInstance: true, url: "finmaster://settings" });
        await waitFor(element(by.text("Kaydet"))).toBeVisible().withTimeout(12000);
    });
});