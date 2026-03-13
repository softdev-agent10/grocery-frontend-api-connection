const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "tests/e2e/**/*.spec.js",
    supportFile: "tests/e2e/support/e2e.js",
    fixturesFolder: "tests/e2e/fixtures",
    baseUrl: "http://localhost:3000",
  },
});