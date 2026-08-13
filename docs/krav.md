# Krav — Bekräfta Beslut Frontend (BEKF)

## Bakgrund och syfte

Bekräfta Beslut frontend är en mikrofrontend som implementerar handläggarens
beslutsbekräftelse-formulär i ett förmåns-/ersättningsärende. Handläggaren granskar beräknade ersättningsutfall, väljer klassificerande beslutsvärden och bekräftar därmed beslutet, vilket skriver tillbaka ersättningsstatus och slutför uppgiften. Den finns för att formellt fastställa ett beräknat beslut innan ärendet går vidare.

---

## Intressenter och aktörer

| Aktör | Roll |
|---|---|
| Handläggare | Enda användarrollen; granskar och bekräftar beslut |
| Handläggarportalen (värdapplikation) | Laddar in denna mikrofrontend och förmedlar uppgiftens identifierare |
| Bekräfta Beslut BFF | Enda bakomliggande tjänst denna mikrofrontend anropar |

---

## Funktionella krav

### BEKF-FR-01 — Visa beslutsunderlag

- **BEKF-FR-01.1** Vid öppning av uppgiften ska gränssnittet hämta och visa kundens
  ersättningsunderlag (utfall, period, belopp) för den angivna handläggningen.
- **BEKF-FR-01.2** Gränssnittet ska hämta referensdata för avslutstyp, beslutstyp och
  beslutsutfallstyp för att fylla klassificeringsvalen i formuläret.
- **BEKF-FR-01.3** Beslutsbekräftelse ska endast vara möjlig om referensdata innehåller ett
  fastställt anspråksstatusvärde; annars ska ett tydligt meddelande visas och formuläret döljas.
- **BEKF-FR-01.4** Handläggaren ska kunna öppna en hjälptext som beskriver uppgiftstypen.

### BEKF-FR-02 — Bekräfta beslut

- **BEKF-FR-02.1** Handläggaren ska ange avslutstyp, beslutstyp och beslutsutfall innan
  beslutet kan bekräftas.
- **BEKF-FR-02.2** Vid bekräftelse ska samtliga ersättningsposters anspråksstatus uppdateras
  till fastställd status, tillsammans med de valda klassificeringsvärdena.
- **BEKF-FR-02.3** Uppgiften ska markeras som slutförd endast om uppdateringen av
  ersättningsposternas status lyckades.
- **BEKF-FR-02.4** Vid lyckad bekräftelse ska handläggarportalen meddelas att uppgiften är
  klar, så att den kan tas bort från handläggarens uppgiftslista.
- **BEKF-FR-02.5** Efter en lyckad bekräftelse ska bekräftelseknappen inte längre kunna
  aktiveras igen för samma uppgift.

---

## Icke-funktionella krav

### BEKF-NFR-01 — Integrerbarhet

- **BEKF-NFR-01.1** Mikrofrontenden ska kunna laddas in dynamiskt i handläggarportalen och ta
  emot uppgiftens identifierare som indata från värdapplikationen.
- **BEKF-NFR-01.2** Bekräftelsestatus ska återställas när mikrofrontenden laddas ur, så att den
  inte felaktigt visas som bekräftad vid en efterföljande visning av ett annat ärende.

---

## API-gränssnitt (översikt)

| API | Målgrupp | Specifikationsartefakt |
|---|---|---|
| Bekräfta Beslut BFF REST-API | Denna mikrofrontend | Ingen dedikerad OpenAPI-specifikation för BFF-kontraktet |

---

## Integration med Bekräfta Beslut BFF

Mikrofrontenden talar uteslutande med sin dedikerade BFF. Den har ingen kännedom om
bakomliggande ärende- eller referensdatatjänster — allt sådant döljs av BFF:n.
