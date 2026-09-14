import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3033",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // preview builds the dist and serves it as static files — no dep pre-bundling
    // cache to worry about, unlike the dev server.
    command: "npm run preview",
    url: "http://localhost:3033",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
