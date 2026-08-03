import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { logger } from "./logger";

function findFileRecursive(dir: string, pattern: RegExp): string | null {
  if (!fs.existsSync(dir)) return null;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findFileRecursive(fullPath, pattern);
      if (nested) return nested;
    } else if (pattern.test(entry.name)) {
      return fullPath;
    }
  }

  return null;
}

function getUnpackedRoots(): string[] {
  return [
    path.join(process.resourcesPath, "app.asar.unpacked"),
    process.resourcesPath,
  ];
}

/**
 * După asarUnpack, Prisma trebuie să știe explicit unde sunt binarele native.
 * @see https://github.com/prisma/prisma/discussions/5200
 */
export function configurePrismaEnginePaths(): void {
  if (!app.isPackaged) return;

  const queryEnginePattern = /^(lib)?query_engine-.*\.(node|dll\.node|dylib\.node)$/;
  const schemaEnginePattern = /^schema-engine-.*\.exe$/;

  let queryEngine: string | null = null;
  let schemaEngine: string | null = null;

  for (const root of getUnpackedRoots()) {
    queryEngine ??= findFileRecursive(
      path.join(root, "node_modules/prisma-client"),
      queryEnginePattern,
    );
    queryEngine ??= findFileRecursive(
      path.join(root, "node_modules/@prisma/engines"),
      queryEnginePattern,
    );

    schemaEngine ??= findFileRecursive(
      path.join(root, "node_modules/@prisma/engines"),
      schemaEnginePattern,
    );
  }

  if (queryEngine) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = queryEngine;
    logger.info("Prisma query engine:", queryEngine);
  } else {
    logger.warn("Prisma query engine negăsit în app.asar.unpacked.");
  }

  if (schemaEngine) {
    process.env.PRISMA_SCHEMA_ENGINE_BINARY = schemaEngine;
    logger.info("Prisma schema engine:", schemaEngine);
  } else {
    logger.warn("Prisma schema engine negăsit — migrările CLI pot eșua.");
  }
}
