import { createRequire } from "node:module";

/**
 * @prisma/client e CommonJS; procesul principal Electron rulează ESM.
 * Named imports ESM din CJS eșuează la runtime în app-ul împachetat (Windows/macOS).
 */
const require = createRequire(import.meta.url);
const prismaModule = require("@prisma/client") as typeof import("@prisma/client");

export const PrismaClient = prismaModule.PrismaClient;
export const Prisma = prismaModule.Prisma;
