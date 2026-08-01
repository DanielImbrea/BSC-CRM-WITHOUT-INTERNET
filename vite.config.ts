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
              external: ["@prisma/client", "argon2", "electron"],
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
