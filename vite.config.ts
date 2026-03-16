import { resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    federation({
      name: "bekraftaBeslutApp",
      filename: "remoteEntry.js",
      exposes: {
        "./BekraftaBeslut": "./src/components/BekraftaBeslutkomponent.vue",
      },
      shared: ["vue", "@fkui/vue", "pinia"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  preview: {
    port: 3033,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:9003",
    },
    port: 3033,
  },
  define: { "process.env": '"production"' },
  build: {
    cssCodeSplit: false,
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, "src/main.ts"),
      name: "bekraftaBeslut",
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/bekraftaBeslut.css";
          }
          return assetInfo.name ?? "assets/[name][extname]";
        },
      },
    },
  },
});