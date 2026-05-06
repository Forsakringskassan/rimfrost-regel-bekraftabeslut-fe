# Mallprojekt för Rimfrost micro frontend

## Introduktion
Det här är ett template-projekt för att skapa micro-frontends i Rimfrost-projektet. Utvald komponent exporteras med Module Federation för Vite och kan användas av olika host-projekt som också använder Module Federation.

Appen eller enstaka komponenter kan exporteras och användas i host-projektet. Stores specifika för denna remote-komponent kan skapas här och användas av host-projektets implementation av Pinia.

Information om Module Federation finns [att läsa här](https://module-federation.io/index.html).

Kom ihåg att lägga till alla bibliotek som används i den komponent som exporteras under federation-inställningarna i vite.config.ts, samt att använda scoped styles direkt i komponenterna.

### Installation
Med Node.js installerat, kör ```npm install``` i en terminal öppen i mappen.

### Kör appen för utveckling
Kör ```npm run dev``` för att testa komponenten under utveckling.

### Build och preview
Kör ```npm run build``` och sedan ```npm run preview``` för att tillgängliggöra den exporterade komponenten för lokal testning

## Registration with the Portal

This micro frontend is registered in the portal's `public/route-manifest.json`:

```json
{
  "routes": {
    "bekraftabeslut": {
      "scope": "bekraftaBeslutApp",
      "module": "BekraftaBeslut",
      "devEntry": "http://localhost:3033/mf-manifest.json",
      "prodEntry": "https://your-prod-url.example.com/mf-manifest.json"
    }
  }
}
```

Updating this entry is the **only** change needed to register or update the remote — no portal rebuild required in any environment. The portal fetches the manifest at runtime and loads the remote dynamically via `@module-federation/vite`.

In **development**, start this app's dev server and refresh the portal. No changes to `loadRemoteModule.ts`, `federation.d.ts`, or any other portal source file are needed.

## Environment Configuration

Config is split between local development and container deployments.

**Local development** — set in `.env`, baked into the bundle at build time:

```env
VITE_BFF_URL=http://localhost:9003
VITE_DEV_HANDLAGGNING_ID=<a handlaggningId from OUL, for standalone dev testing>
```

**Docker (local image testing)** — mount a `runtime-config.js` file:

```js
window._env_ = {
  "RUNTIME_BFF_URL": "http://your-bff-url"
};
```

```bash
docker run -p 8080:8080 \
  -v ./runtime-config.js:/usr/local/apache2/htdocs/runtime-config.js \
  your-image-name
```

**OpenShift (production)** — create a ConfigMap and mount it with `subPath`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bekraftabeslut-config
data:
  runtime-config.js: |
    window._env_ = {
      "RUNTIME_BFF_URL": "https://your-bff.internal.example.com"
    };
```

```yaml
# In your Deployment:
volumeMounts:
  - name: runtime-config
    mountPath: /usr/local/apache2/htdocs/runtime-config.js
    subPath: runtime-config.js
volumes:
  - name: runtime-config
    configMap:
      name: bekraftabeslut-config
```

| Variable | Dev (`.env`) | Container (`runtime-config.js`) | Description |
|---|---|---|---|
| BFF URL | `VITE_BFF_URL` | `RUNTIME_BFF_URL` | Rule BFF base URL |
| Dev handler ID | `VITE_DEV_HANDLAGGNING_ID` | — | Fallback `handlaggningId` for standalone dev testing only |