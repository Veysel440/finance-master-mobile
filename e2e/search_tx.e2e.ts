import { by, device, element, expect, waitFor } from "detox";

describe("Transactions search", () => {
    beforeAll(async () => { await device.launchApp({ newInstance: true }); });
    it("filters by query and clears", async () => {
        await element(by.id("tab-transactions")).tap();

        const input = element(by.label("Arama"));
        await waitFor(input).toBeVisible().withTimeout(5000);
        await input.typeText("ft:market\n");

        await waitFor(element(by.id("tx-item-0"))).toBeVisible().withTimeout(8000);

        await element(by.text("Temizle")).tap();
        await waitFor(element(by.id("tx-item-0"))).toBeVisible().withTimeout(8000);
    });
});