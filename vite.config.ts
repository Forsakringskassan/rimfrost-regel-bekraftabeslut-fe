import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [
    federation({
      name: "bekraftaBeslutApp",
      filename: "remoteEntry.js",
      exposes: {
        "./BekraftaBeslut": "./src/components/BekraftaBeslutkomponent.vue",
      },
      shared: {
        vue: { singleton: true, requiredVersion: "^3.5.24" },
        "@fkui/vue": { singleton: true, requiredVersion: "^6.26.0" },
        pinia: { singleton: true, requiredVersion: "^3.0.4" },
      },
      manifest: true,
      publicPath: "auto",
      dts: false,
    }),
    vue(),
    vueDevTools(),
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
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: false,
  },
});
