import { type Page, expect, test as base } from "@playwright/test";

export { expect };

// The standalone app (App.vue) falls back to VITE_DEV_HANDLAGGNING_ID from .env
// when no handlaggningId prop is passed in (i.e. when not embedded via Module
// Federation) — see src/App.vue and src/config/env.ts.
export const devHandlaggningId = "00be1ee0-5ffd-4394-bec2-4634770d9352";

// BeslutsData shape, camelCase — mapped by the bekraftabeslut BFF.
export const mockBeslutsData = {
  handlaggningId: devHandlaggningId,
  kund: {
    fornamn: "Lisa",
    efternamn: "Tass",
    kon: "K",
    anstallning: { organisationsnamn: "Region Dalarna", arbetstidProcent: 100 },
  },
  ersattning: [
    {
      ersattningId: "8e4c207b-6fdc-4f4d-9084-53455eb459dd",
      ersattningstyp: "042bd313-d5ef-4886-97c5-e0a1c828baca",
      omfattningProcent: 100,
      belopp: 40000,
      berakningsgrund: 0,
      beslutsutfall: "JA",
      from: "2025-12-01",
      tom: "2025-12-31",
    },
  ],
};

export const mockReferensdata = {
  avslutstyp: [{ id: "avslut-1", kod: "AUTOMATISKT", namn: "Automatiskt avslut" }],
  beslutstyp: [{ id: "beslut-1", kod: "BIFALL", namn: "Bifall" }],
  beslutsutfallstyp: [{ id: "utfall-1", kod: "JA", namn: "Ja" }],
  // bekraftaBeslut.ts requires a kod "faststallt" entry to enable the confirm button.
  yrkandestatus: [{ id: "status-faststallt", kod: "faststallt", namn: "Fastställt" }],
};

export async function mockBffApis(
  page: Page,
  data: typeof mockBeslutsData | { status: number } = mockBeslutsData,
  referensdata: typeof mockReferensdata = mockReferensdata,
) {
  // Registered first so it has the lowest priority (Playwright checks routes
  // LIFO) — it only ever needs to catch PATCH /{handlaggningId}, since every
  // named single-segment path below (avslutstyp, done, ...) is matched by a
  // more specific handler registered after it.
  await page.route("**/api/regel/bekraftabeslut/*", async (route) => {
    if (route.request().method() === "PATCH") {
      await route.fulfill({ status: 204 });
    } else {
      await route.continue();
    }
  });
  await page.route("**/api/regel/bekraftabeslut/handlaggning/**", async (route) => {
    if ("status" in data) {
      await route.fulfill({ status: data.status });
    } else {
      await route.fulfill({ json: data });
    }
  });
  await page.route("**/api/regel/bekraftabeslut/avslutstyp", async (route) => {
    await route.fulfill({ json: referensdata.avslutstyp });
  });
  await page.route("**/api/regel/bekraftabeslut/beslutstyp", async (route) => {
    await route.fulfill({ json: referensdata.beslutstyp });
  });
  await page.route("**/api/regel/bekraftabeslut/beslutsutfallstyp", async (route) => {
    await route.fulfill({ json: referensdata.beslutsutfallstyp });
  });
  await page.route("**/api/regel/bekraftabeslut/yrkandestatus", async (route) => {
    await route.fulfill({ json: referensdata.yrkandestatus });
  });
  await page.route("**/api/regel/bekraftabeslut/done", async (route) => {
    await route.fulfill({ status: 204 });
  });
  await page.route("**/api/uppgiftsbeskrivning", async (route) => {
    await route.fulfill({
      json: { beskrivning: "Bekräfta det fastställda beslutet för ärendet." },
    });
  });
}

export async function gotoApp(page: Page) {
  const ready = page.waitForResponse("**/api/regel/bekraftabeslut/handlaggning/**");
  await page.goto("/");
  await ready;
}

export const test = base.extend<{ setupMocks: Page }>({
  setupMocks: async ({ page }, use) => {
    await mockBffApis(page);
    await gotoApp(page);
    await use(page);
  },
});
