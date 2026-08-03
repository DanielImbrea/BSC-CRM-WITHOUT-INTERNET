import { createRequire } from "node:module";

/**
 * Prisma Client e CommonJS; procesul principal Electron rulează ESM.
 * Clientul generat e în node_modules/prisma-client (fără dot-prefix, inclus în pachet).
 */
const require = createRequire(import.meta.url);
const prismaModule = require("prisma-client") as typeof import("prisma-client");

export const PrismaClient = prismaModule.PrismaClient;
export const Prisma = prismaModule.Prisma;
