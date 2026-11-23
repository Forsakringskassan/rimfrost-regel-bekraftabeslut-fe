import type { Page } from "@playwright/test";
import {
  defaultBekraftaStatus,
  devAuthorization,
  expect,
  gotoApp,
  mockBeslutsData,
  mockBffApis,
  mockReferensdata,
  setDevAuthorization,
  test,
} from "./fixtures";

const SAKNAR_BEHORIGHET =
  "Kunde inte identifiera dig som handläggare. Logga in i handläggarportalen igen och öppna uppgiften på nytt.";

// Standalone smoke tests for the bekraftabeslut MFE, run directly against its own
// preview server (no Module Federation host) using VITE_DEV_HANDLAGGNING_ID as
// the fallback handlaggningId. Covers all of the app's own BFF endpoints:
// GET handlaggning/{id}, 4x referensdata GETs, PATCH, POST done, GET uppgiftsbeskrivning.
async function valjAllaBeslut(page: Page) {
  await page.locator("#avslutstyp").selectOption({ label: "Automatiskt avslut" });
  await page.locator("#beslutstyp").selectOption({ label: "Bifall" });
  await page.locator("#beslutsutfall").selectOption({ label: "Ja" });
}

test.describe("BekraftaBeslutKomponent", () => {
  test("laddar och visar beslutsdata", async ({ page }) => {
    await mockBffApis(page);
    await gotoApp(page);

    await expect(page.getByText("Lisa Tass")).toBeVisible();
    await expect(page.getByText("Region Dalarna")).toBeVisible();
    await expect(page.getByText("40000 kr")).toBeVisible();
    await expect(page.getByText("20000 kr")).toBeVisible();
    await expect(page.locator(".error-message")).not.toBeVisible();
  });

  test("hämtar uppgiftsbeskrivning vid tooltip-klick", async ({ page }) => {
    await mockBffApis(page);
    await gotoApp(page);

    const descriptionRequest = page.waitForRequest("**/api/uppgiftsbeskrivning");
    await page.getByRole("button", { name: /Läs mer om uppgiften/ }).click();
    await descriptionRequest;
    await expect(
      page.getByText("Bekräfta det fastställda beslutet för ärendet."),
    ).toBeVisible();
  });

  test("bekräftar beslut när alla val är gjorda", async ({ page }) => {
    await mockBffApis(page);
    await gotoApp(page);

    await valjAllaBeslut(page);

    // The button is re-keyed on buttonDisabled (:key="String(buttonDisabled)"),
    // which forces Vue to swap the DOM node when it flips — waiting for the
    // enabled state first avoids racing that remount with the click below.
    const button = page.getByRole("button", { name: "Bekräfta beslut", exact: true });
    await expect(button).toBeEnabled();

    const patchRequest = page.waitForRequest(
      (req) =>
        req.url().includes(`/api/regel/bekraftabeslut/${mockBeslutsData.handlaggning_id}`) &&
        req.method() === "PATCH",
    );
    const doneRequest = page.waitForRequest(
      (req) => req.url().includes("/api/regel/bekraftabeslut/done") && req.method() === "POST",
    );
    await button.click();
    const patch = await patchRequest;
    const done = await doneRequest;

    // Every ersättning from the GET response must be sent with its own
    // ersattning_id — a missing id is dropped by JSON.stringify and the BFF
    // rejects the request (FKPOC-1488).
    const patchBody = patch.postDataJSON();
    expect(patchBody.ersattningar).toEqual(
      mockBeslutsData.ersattning.map((e) => ({
        ersattning_id: e.ersattning_id,
        yrkandestatus: mockReferensdata.yrkandestatus[0].id,
      })),
    );
    for (const ersattning of patchBody.ersattningar) {
      expect(ersattning.ersattning_id).toEqual(expect.any(String));
    }
    expect(patchBody.beslut).toEqual({
      avslutstyp: mockReferensdata.avslutstyp[0].id,
      beslutstyp: mockReferensdata.beslutstyp[0].id,
      beslutsutfall: mockReferensdata.beslutsutfallstyp[0].id,
    });
    const doneBody = done.postDataJSON();
    expect(doneBody.handlaggningId).toBe(mockBeslutsData.handlaggning_id);
  });

  test("knappen är inaktiverad tills alla tre val är gjorda", async ({ page }) => {
    await mockBffApis(page);
    await gotoApp(page);

    const button = page.getByRole("button", { name: "Bekräfta beslut", exact: true });
    await expect(button).toBeDisabled();

    await page.locator("#avslutstyp").selectOption({ label: "Automatiskt avslut" });
    await expect(button).toBeDisabled();
    await page.locator("#beslutstyp").selectOption({ label: "Bifall" });
    await expect(button).toBeDisabled();
    await page.locator("#beslutsutfall").selectOption({ label: "Ja" });
    await expect(button).toBeEnabled();
  });

  test("visar fel när fastställt-status saknas i referensdata", async ({ page }) => {
    await mockBffApis(page, undefined, {
      ...mockReferensdata,
      yrkandestatus: [],
    });
    await gotoApp(page);

    await expect(
      page.getByText(
        "Det är inte möjligt att bekräfta beslut eftersom referensdata saknas.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Bekräfta beslut", exact: true }),
    ).toBeDisabled();
  });

  test("kraschar inte när referensdata saknar kod", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));
    await mockBffApis(page, undefined, {
      ...mockReferensdata,
      yrkandestatus: [{ id: "status-utan-kod", namn: "Utan kod" }],
    });
    await gotoApp(page);

    await expect(page.getByText("Lisa Tass")).toBeVisible();
    await expect(
      page.getByText(
        "Det är inte möjligt att bekräfta beslut eftersom referensdata saknas.",
      ),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("visar inte referensdata utan id eller namn", async ({ page }) => {
    await mockBffApis(page, undefined, {
      ...mockReferensdata,
      avslutstyp: [
        ...mockReferensdata.avslutstyp,
        { kod: "UTAN_ID", namn: "Saknar id" },
        { id: "avslut-utan-namn", kod: "UTAN_NAMN" },
      ],
    });
    await gotoApp(page);

    // The disabled "Välj avslutstyp" placeholder plus the one complete item.
    await expect(page.locator("#avslutstyp option")).toHaveCount(2);
    await expect(page.locator("#avslutstyp option", { hasText: "Saknar id" })).toHaveCount(0);
  });

  for (const steg of ["patch", "done"] as const) {
    test(`visar att tjänsten inte är tillgänglig vid 503 från ${steg}`, async ({ page }) => {
      await mockBffApis(page, undefined, undefined, { ...defaultBekraftaStatus, [steg]: 503 });
      await gotoApp(page);

      await valjAllaBeslut(page);
      const button = page.getByRole("button", { name: "Bekräfta beslut", exact: true });
      await expect(button).toBeEnabled();
      await button.click();

      await expect(
        page.getByText("Tjänsten är inte tillgänglig för tillfället. Försök igen senare."),
      ).toBeVisible();
    });
  }

  test("visar felmeddelande när beslutsdata inte kan hämtas", async ({ page }) => {
    await mockBffApis(page, { status: 503 });
    await page.goto("/");

    await expect(
      page.getByText("Tjänsten är inte tillgänglig för tillfället. Försök igen senare."),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".beslut-information")).toHaveCount(0);
  });

  test.describe("Authorization till BFF:en", () => {
    test("skickar handläggarens token på alla BFF-anrop", async ({ page }) => {
      await mockBffApis(page);
      const authByCall = new Map<string, string | undefined>();
      page.on("request", (req) => {
        const path = new URL(req.url()).pathname;
        if (path.startsWith("/api/")) {
          authByCall.set(`${req.method()} ${path}`, req.headers()["authorization"]);
        }
      });
      await gotoApp(page);

      const descriptionResponse = page.waitForResponse("**/api/uppgiftsbeskrivning");
      await page.getByRole("button", { name: /Läs mer om uppgiften/ }).click();
      await descriptionResponse;

      await valjAllaBeslut(page);
      const button = page.getByRole("button", { name: "Bekräfta beslut", exact: true });
      await expect(button).toBeEnabled();
      const doneResponse = page.waitForResponse("**/api/regel/bekraftabeslut/done");
      await button.click();
      await doneResponse;

      const id = mockBeslutsData.handlaggning_id;
      expect(Object.fromEntries(authByCall)).toEqual({
        [`GET /api/regel/bekraftabeslut/handlaggning/${id}`]: devAuthorization,
        "GET /api/regel/bekraftabeslut/avslutstyp": devAuthorization,
        "GET /api/regel/bekraftabeslut/beslutstyp": devAuthorization,
        "GET /api/regel/bekraftabeslut/beslutsutfallstyp": devAuthorization,
        "GET /api/regel/bekraftabeslut/yrkandestatus": devAuthorization,
        "GET /api/uppgiftsbeskrivning": devAuthorization,
        [`PATCH /api/regel/bekraftabeslut/${id}`]: devAuthorization,
        "POST /api/regel/bekraftabeslut/done": devAuthorization,
      });
    });

    test("visar begripligt fel och anropar inte BFF:en när token saknas", async ({ page }) => {
      await mockBffApis(page);
      await setDevAuthorization(page, "");
      const bffRequests: string[] = [];
      page.on("request", (req) => {
        if (new URL(req.url()).pathname.startsWith("/api/")) bffRequests.push(req.url());
      });
      await page.goto("/");

      await expect(page.getByText(SAKNAR_BEHORIGHET)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Lisa Tass")).not.toBeVisible();

      await page.getByRole("button", { name: /Läs mer om uppgiften/ }).click();
      await expect(page.getByText("Kunde inte hämta uppgiftsbeskrivningen.")).toBeVisible();
      expect(bffRequests).toEqual([]);
    });

    test("visar begripligt fel när BFF:en svarar 401", async ({ page }) => {
      await mockBffApis(page, { status: 401 });
      await page.goto("/");

      await expect(page.getByText(SAKNAR_BEHORIGHET)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Lisa Tass")).not.toBeVisible();
    });

    test("visar begripligt fel när referensdata svarar 401", async ({ page }) => {
      await mockBffApis(page);
      await page.route("**/api/regel/bekraftabeslut/yrkandestatus", async (route) => {
        await route.fulfill({ status: 401 });
      });
      await gotoApp(page);

      await expect(page.getByText(SAKNAR_BEHORIGHET)).toBeVisible();
    });

    test("visar begripligt fel när bekräftelsen svarar 401", async ({ page }) => {
      await mockBffApis(page, undefined, undefined, { ...defaultBekraftaStatus, patch: 401 });
      await gotoApp(page);

      await valjAllaBeslut(page);
      const button = page.getByRole("button", { name: "Bekräfta beslut", exact: true });
      await expect(button).toBeEnabled();
      await button.click();

      await expect(page.getByText(SAKNAR_BEHORIGHET)).toBeVisible();
    });
  });
});
