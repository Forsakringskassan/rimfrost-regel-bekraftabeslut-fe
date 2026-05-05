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
      "devEntry": "http://localhost:3033/assets/remoteEntry.js",
      "prodEntry": "https://your-prod-url.example.com/assets/remoteEntry.js"
    }
  }
}
```

In **production**, updating this ConfigMap entry is enough to register or update the remote — no portal rebuild required. The portal reads the manifest at runtime and loads the remote dynamically via Module Federation.

In **development**, the portal also needs:
- An entry in `devImporters` in `src/utils/loadRemoteModule.ts`
- A type declaration in `src/federation.d.ts`
- A dev server restart

See the portal README for the full steps.

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