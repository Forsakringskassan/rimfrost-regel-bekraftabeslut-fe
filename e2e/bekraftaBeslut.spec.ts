import {
  expect,
  gotoApp,
  mockBeslutsData,
  mockBffApis,
  mockReferensdata,
  test,
} from "./fixtures";

// Standalone smoke tests for the bekraftabeslut MFE, run directly against its own
// preview server (no Module Federation host) using VITE_DEV_HANDLAGGNING_ID as
// the fallback handlaggningId. Covers all of the app's own BFF endpoints:
// GET handlaggning/{id}, 4x referensdata GETs, PATCH, POST done, GET uppgiftsbeskrivning.
test.describe("BekraftaBeslutKomponent", () => {
  test("laddar och visar beslutsdata", async ({ page }) => {
    await mockBffApis(page);
    await gotoApp(page);

    await expect(page.getByText("Lisa Tass")).toBeVisible();
    await expect(page.getByText("Region Dalarna")).toBeVisible();
    await expect(page.getByText("40000 kr")).toBeVisible();
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

    await page.locator("#avslutstyp").selectOption({ label: "Automatiskt avslut" });
    await page.locator("#beslutstyp").selectOption({ label: "Bifall" });
    await page.locator("#beslutsutfall").selectOption({ label: "Ja" });

    // The button is re-keyed on buttonDisabled (:key="String(buttonDisabled)"),
    // which forces Vue to swap the DOM node when it flips — waiting for the
    // enabled state first avoids racing that remount with the click below.
    const button = page.getByRole("button", { name: "Bekräfta beslut", exact: true });
    await expect(button).toBeEnabled();

    const patchRequest = page.waitForRequest(
      (req) =>
        req.url().includes(`/api/regel/bekraftabeslut/${mockBeslutsData.handlaggningId}`) &&
        req.method() === "PATCH",
    );
    const doneRequest = page.waitForRequest(
      (req) => req.url().includes("/api/regel/bekraftabeslut/done") && req.method() === "POST",
    );
    await button.click();
    const patch = await patchRequest;
    const done = await doneRequest;

    const patchBody = patch.postDataJSON();
    expect(patchBody.ersattningar).toEqual([
      {
        ersattning_id: mockBeslutsData.ersattning[0].ersattningId,
        yrkandestatus: mockReferensdata.yrkandestatus[0].id,
      },
    ]);
    const doneBody = done.postDataJSON();
    expect(doneBody.handlaggningId).toBe(mockBeslutsData.handlaggningId);
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

  // KNOWN BUG (found via this test, not fixed here — flagged for the team):
  // the component's error <p> lives inside `v-if="!isInfoLoading && store.data"`.
  // fetchBeslutsdata only ever sets store.error when the fetch *fails*, i.e.
  // exactly when store.data stays null — so the error message can never
  // actually render; the page just goes blank instead of showing
  // "Tjänsten är inte tillgänglig...". This test documents that current
  // (broken) behavior rather than the intended one.
  test("går blank vid backend-fel istället för att visa felmeddelande (känd bugg)", async ({
    page,
  }) => {
    await mockBffApis(page, { status: 503 });
    await page.goto("/");
    await page.waitForTimeout(500);

    await expect(page.locator(".beslut-information")).toHaveCount(0);
    await expect(
      page.getByText("Tjänsten är inte tillgänglig", { exact: false }),
    ).toHaveCount(0);
  });
});
