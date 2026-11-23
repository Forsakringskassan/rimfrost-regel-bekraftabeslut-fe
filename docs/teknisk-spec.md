# Teknisk spec — Bekräfta Beslut Frontend (BEKF)

## Översikt

Enskild inbäddad vy (Vue 3 + TypeScript, Pinia), exponerad som en module federation-komponent
till handläggarportalen. Ingen egen routing. All data hämtas via `fetch` mot en dedikerad BFF,
ingen websocket/polling.

## Komponentstruktur

```text
src/
├── App.vue                        # Rotkomponent, tar emot handlaggningId som prop
├── components/BekraftaBeslutKomponent.vue  # Formulär: klassificering + bekräftelse
├── stores/BekraftaBeslutStore.ts   # Beslutsunderlag, referensdata, status, fel
└── (typer definierade i store-filen, speglar BFF-specen)
```

## API-specifikationer

BFF-kontraktet specificeras i [rimfrost-regel-bekraftabeslut-bff-openapi](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-bff-openapi) (`openapi.yaml`). Typerna i
`BekraftaBeslutStore.ts` är handskrivna men följer specen fält för fält (snake_case).

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

## Kafka-integration

Ingen. Mikrofrontenden har ingen meddelandeintegration.

## Konfiguration

| Egenskap | Beskrivning | Standardvärde |
|---|---|---|
| `VITE_BFF_URL` | BFF-url vid lokal utveckling | `http://localhost:9003` |
| `RUNTIME_BFF_URL` (`window.__BEKRAFTABESLUT_FE_ENV__`) | BFF-url vid körning i container | — |

## Liveness

Ingen egen hälsokontroll — statisk frontend, hälsa avgörs av webbservern som serverar den.

## Kända begränsningar och framtida arbete

| Begränsning | Föreslagen åtgärd |
|---|---|
| Uppdatering av ersättningsstatus och slutförande är två separata anrop utan kompensation vid delvist fel | Utforma en återförsöks- eller kompensationsstrategi |
| Kund- och organisationsnamn faller tillbaka på platshållarvärden om data saknas, istället för att visa ett tydligt "saknas"-läge | Ersätt fallback med ett explicit felläge |
| Ingen automatiserad testtäckning finns i repot | Inför enhetstester |
| Typerna för BFF-kontraktet är handskrivna, så en ändring i specen märks inte vid bygget | Generera typerna från BFF-specen (se FKPOC-1321) |
| Ospårat toast-notifieringsflöde finns i koden men är inte kopplat till bekräftelseflödet | Klargör om det ska kopplas in eller tas bort |
