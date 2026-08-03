import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import path from "node:path";

const aliasConfig = {
  "@": path.resolve(__dirname, "./src"),
  "@shared-types": path.resolve(__dirname, "./shared-types"),
};

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main/index.ts",
        vite: {
          resolve: { alias: aliasConfig },
          build: {
            outDir: "dist-electron/main",
            rollupOptions: {
              // Prisma & Argon2 folosesc binare native — nu trebuie bundle-uite de Rollup.
              external: ["@prisma/client", "electron"],
            },
          },
        },
      },
      preload: {
        input: "electron/preload/index.ts",
        vite: {
          resolve: { alias: aliasConfig },
          build: {
            outDir: "dist-electron/preload",
            rollupOptions: {
              external: ["electron"],
              output: {
                // Proiectul e ESM ("type":"module") — preload CJS trebuie .cjs,
                // altfel Node tratează .js ca ESM și require() eșuează.
                format: "cjs",
                entryFileNames: "index.cjs",
                chunkFileNames: "[name].cjs",
                inlineDynamicImports: true,
              },
            },
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: aliasConfig,
  },
});
