import { by, device, element, expect } from "detox";

describe("Tx pagination", () => {
    beforeAll(async () => { await device.launchApp({ newInstance: true }); });
    it("loads next page on scroll end", async () => {
        await element(by.id("tab-transactions")).tap();
        await element(by.id("tx-list")).scrollTo("bottom");
        await expect(element(by.id("tx-item-20"))).toExist();
    });
});