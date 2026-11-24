# Teknisk spec — Bekräfta Beslut Frontend (BEKF)

## Översikt

Enskild inbäddad vy (Vue 3 + TypeScript, Pinia), exponerad som en module federation-komponent
till handläggarportalen. Ingen egen routing. All data hämtas via `fetch` mot en dedikerad BFF,
ingen websocket/polling.

## Komponentstruktur

```text
src/
├── App.vue                        # Rotkomponent vid fristående körning, tar emot handlaggningId och authorization
├── components/BekraftaBeslutKomponent.vue  # Formulär: klassificering + bekräftelse
├── stores/BekraftaBeslutStore.ts   # Beslutsunderlag, referensdata, status, fel
└── (typer definierade i store-filen, speglar BFF-specen)
```

## API-specifikationer

BFF-kontraktet specificeras i `openapi.yaml` i
[rimfrost-regel-bekraftabeslut-bff-openapi](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-bff-openapi).
Typerna i `BekraftaBeslutStore.ts` är handskrivna men följer specen fält för fält (snake_case).

| Metod | Sökväg | Beskrivning |
|---|---|---|
| GET | `/api/regel/bekraftabeslut/handlaggning/{handlaggningId}` | Hämta beslutsunderlag |
| GET | `/api/regel/bekraftabeslut/avslutstyp` | Referensdata: avslutstyp |
| GET | `/api/regel/bekraftabeslut/beslutstyp` | Referensdata: beslutstyp |
| GET | `/api/regel/bekraftabeslut/beslutsutfallstyp` | Referensdata: beslutsutfallstyp |
| GET | `/api/regel/bekraftabeslut/yrkandestatus` | Referensdata: status |
| GET | `/api/uppgiftsbeskrivning` | Hjälptext för uppgiftstypen |
| PATCH | `/api/regel/bekraftabeslut/{handlaggningId}` | Uppdatera ersättningsstatus och beslut |
| POST | `/api/regel/bekraftabeslut/done` | Slutföra uppgiften |

### Authorization

Alla anrop går genom `src/utils/bffFetch.ts`, som lägger på `Authorization` (BEKF-NFR-01.3).
Värdet kommer från propen `authorization` på den exponerade komponenten
`BekraftaBeslutKomponent.vue`, som portalen sätter till hela headervärdet (i dag
`Bearer <typId>:<varde>`, PORT-FR-03.6). Mikrofrontenden tolkar inte innehållet. Propen läggs i
Pinia-storen innan första anropet och tas bort när komponenten laddas ur. Portalen monterar om
komponenten när handläggaren byts eller loggar ut (PORT-FR-03.7).

Saknas token görs inget anrop. Saknas token, eller svarar BFF:en 401, visas
"Kunde inte identifiera dig som handläggare …" i stället för beslutsunderlaget, och ett
tidigare hämtat underlag rensas ur storen (BEKF-NFR-01.4).

Fristående (`npm run dev`/`preview`) finns ingen portal. Då används `VITE_DEV_AUTHORIZATION`
eller `RUNTIME_DEV_AUTHORIZATION` som token.

## Kafka-integration

Ingen. Mikrofrontenden har ingen meddelandeintegration.

## Konfiguration

| Egenskap | Beskrivning | Standardvärde |
|---|---|---|
| `VITE_BFF_URL` | BFF-url vid lokal utveckling | `http://localhost:9003` |
| `RUNTIME_BFF_URL` (`window.__BEKRAFTABESLUT_FE_ENV__`) | BFF-url vid körning i container | — |
| `VITE_DEV_AUTHORIZATION` / `RUNTIME_DEV_AUTHORIZATION` | Token (hela headervärdet) vid fristående utvecklingsläge. Ett tomt runtime-värde betyder ingen token. Får aldrig sättas i en driftsatt miljö, eftersom `runtime-config.js` är publik | — |

## Liveness

Ingen egen hälsokontroll — statisk frontend, hälsa avgörs av webbservern som serverar den.

## Kända begränsningar och framtida arbete

| Begränsning | Föreslagen åtgärd |
|---|---|
| Uppdatering av ersättningsstatus och slutförande är två separata anrop utan kompensation vid delvist fel | Utforma en återförsöks- eller kompensationsstrategi |
| Kund- och organisationsnamn faller tillbaka på platshållarvärden om data saknas, istället för att visa ett tydligt "saknas"-läge | Ersätt fallback med ett explicit felläge |
| Bara e2e-tester (Playwright, fristående mot mockad BFF), inga enhetstester | Inför enhetstester |
| Typerna för BFF-kontraktet är handskrivna, så en ändring i specen märks inte vid bygget | Generera typerna från BFF-specen (se FKPOC-1321) |
| Ospårat toast-notifieringsflöde finns i koden men är inte kopplat till bekräftelseflödet | Klargör om det ska kopplas in eller tas bort |
