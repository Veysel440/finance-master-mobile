const detox = require("detox");
const config = require("../detox.config.js");
const adapter = require("detox/runners/jest/adapter");

jest.setTimeout(120000);
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => { await detox.init(config); }, 120000);
afterAll(async () => { await detox.cleanup(); });