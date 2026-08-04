/**
 * Import istoric Stomdental (.sql MariaDB) în baza SQLite a aplicației.
 *
 * Utilizare:
 *   npm run import:stomdental -- /cale/fisier.sql
 *   npm run import:stomdental -- /cale/fisier.sql --dry-run
 *
 * Înainte de import: fă backup din aplicație (Backup) sau copiază prisma/lab-manager.db
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "prisma-client";
import { parseStomdentalDump } from "./lib/stomdental-sql-parser";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const prismaDir = path.resolve(scriptDir, "../prisma");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(prismaDir, "lab-manager.db")}`;
}

const IMPORT_TAG_PREFIX = "[stomdental:";

type PaymentStatus = "NEPLATITA" | "PLATITA_DOCTOR" | "PLATITA_TEHNICIAN";

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function isNumericToken(value: string): boolean {
  return /^\d+([.,]\d+)?$/.test(value.trim());
}

function looksLikeNote(value: string): boolean {
  const v = value.trim();
  if (v.length > 45) return true;
  return /refacere|achita|glazura|observa|reparatie/i.test(v) && !/^[A-Z][a-z]+ [A-Z]/i.test(v);
}

function mapPaymentStatus(raw: string): PaymentStatus {
  const s = raw.trim().toLowerCase();
  if (s === "platit doctor") return "PLATITA_DOCTOR";
  if (s === "platit tehnicieni") return "PLATITA_TEHNICIAN";
  return "NEPLATITA";
}

function resolveEntryDate(row: { entryDate: Date | null; writtenAt: Date | null }): Date {
  const candidate = row.entryDate ?? row.writtenAt;
  if (candidate && !Number.isNaN(candidate.getTime())) return candidate;
  return new Date();
}

function importMarker(oldId: number): string {
  return `${IMPORT_TAG_PREFIX}${oldId}]`;
}

function classifyTechnicianField(
  value: string | null,
  slot: 1 | 2 | 3,
  knownTechnicians: Set<string>,
): { kind: "technician" | "note" | "skip"; text: string } {
  if (!value?.trim()) return { kind: "skip", text: "" };
  const text = value.trim();
  if (isNumericToken(text)) {
    return { kind: "note", text: `Preț vechi (T${slot}): ${text}` };
  }
  if (slot === 3 && looksLikeNote(text) && !knownTechnicians.has(normalizeName(text))) {
    return { kind: "note", text };
  }
  return { kind: "technician", text };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
  const dryRun = flags.has("--dry-run");
  const skipExisting = !flags.has("--force");

  const sqlPath = args[0]
    ? path.resolve(args[0])
    : path.resolve(scriptDir, "../data/gestiunecomenzi.sql");

  if (!fs.existsSync(sqlPath)) {
    console.error(`Fișierul SQL nu există: ${sqlPath}`);
    console.error("Utilizare: npm run import:stomdental -- /cale/catre/export.sql");
    process.exit(1);
  }

  console.log(`Citesc ${sqlPath} ...`);
  const sql = fs.readFileSync(sqlPath, "utf8");
  const parsed = parseStomdentalDump(sql);
  console.log(
    `Găsit: ${parsed.doctors.length} doctori, ${parsed.technicians.length} tehnicieni, ${parsed.works.length} lucrări`,
  );

  if (dryRun) {
    const statuses = new Map<string, number>();
    for (const w of parsed.works) {
      statuses.set(w.paymentStatus, (statuses.get(w.paymentStatus) ?? 0) + 1);
    }
    console.log("Statusuri:", Object.fromEntries(statuses));
    console.log("Dry-run — nu scriu în baza de date.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    const existingImported = skipExisting
      ? new Set(
          (
            await prisma.work.findMany({
              where: { observations: { contains: IMPORT_TAG_PREFIX } },
              select: { observations: true },
            })
          )
            .map((w) => w.observations?.match(/\[stomdental:(\d+)\]/)?.[1])
            .filter(Boolean),
        )
      : new Set<string>();

    if (existingImported.size > 0) {
      console.log(`Sar peste ${existingImported.size} lucrări deja importate (folosește --force pentru re-import complet).`);
    }

    const doctorByNorm = new Map<string, string>();
    for (const d of await prisma.doctor.findMany({ select: { id: true, name: true } })) {
      doctorByNorm.set(normalizeName(d.name), d.id);
    }

    let doctorsCreated = 0;
    const ensureDoctor = async (name: string): Promise<string> => {
      const clean = name.trim() || "Necunoscut";
      const norm = normalizeName(clean);
      const existing = doctorByNorm.get(norm);
      if (existing) return existing;
      const row = await prisma.doctor.create({ data: { name: clean } });
      doctorByNorm.set(norm, row.id);
      doctorsCreated += 1;
      return row.id;
    };

    await ensureDoctor("Necunoscut");

    for (const d of parsed.doctors) {
      if (d.name) await ensureDoctor(d.name);
    }
    for (const w of parsed.works) {
      await ensureDoctor(w.doctorName.trim() || "Necunoscut");
    }
    console.log(`Doctori: ${doctorByNorm.size} (${doctorsCreated} noi)`);

    const techByNorm = new Map<string, string>();
    const knownTechnicianNames = new Set<string>();
    for (const t of await prisma.technician.findMany({ select: { id: true, name: true } })) {
      techByNorm.set(normalizeName(t.name), t.id);
      knownTechnicianNames.add(normalizeName(t.name));
    }

    let techniciansCreated = 0;
    const ensureTechnician = async (name: string): Promise<string | null> => {
      const clean = name.trim();
      if (!clean || isNumericToken(clean)) return null;
      const norm = normalizeName(clean);
      knownTechnicianNames.add(norm);
      const existing = techByNorm.get(norm);
      if (existing) return existing;
      const row = await prisma.technician.create({ data: { name: clean, active: true } });
      techByNorm.set(norm, row.id);
      techniciansCreated += 1;
      return row.id;
    };

    for (const t of parsed.technicians) {
      if (t.name) await ensureTechnician(t.name);
    }

    for (const w of parsed.works) {
      for (const raw of [w.technician1, w.technician2]) {
        if (!raw?.trim() || isNumericToken(raw) || looksLikeNote(raw)) continue;
        await ensureTechnician(raw);
      }
      const t3 = w.technician3?.trim();
      if (t3 && !isNumericToken(t3) && !looksLikeNote(t3)) {
        await ensureTechnician(t3);
      }
    }
    console.log(`Tehnicieni: ${techByNorm.size} (${techniciansCreated} noi)`);

    const workTypeByNorm = new Map<string, string>();
    for (const wt of await prisma.workType.findMany({ select: { id: true, name: true } })) {
      workTypeByNorm.set(normalizeName(wt.name), wt.id);
    }

    let workTypesCreated = 0;
    const ensureWorkType = async (description: string): Promise<string> => {
      const clean = description.trim() || "Nespecificat";
      const norm = normalizeName(clean);
      const existing = workTypeByNorm.get(norm);
      if (existing) return existing;
      const row = await prisma.workType.create({
        data: { name: clean, doctorPrice: 0, technicianPrice: 0 },
      });
      workTypeByNorm.set(norm, row.id);
      workTypesCreated += 1;
      return row.id;
    };

    const uniqueDescriptions = new Set(parsed.works.map((w) => w.workDescription.trim() || "Nespecificat"));
    for (const desc of uniqueDescriptions) {
      await ensureWorkType(desc);
    }
    console.log(`Tipuri lucrări: ${workTypeByNorm.size} (${workTypesCreated} noi)`);

    const toImport = parsed.works.filter((w) => !existingImported.has(String(w.id)));
    console.log(`Import ${toImport.length} lucrări ...`);

    const fallbackDoctorId = doctorByNorm.get(normalizeName("Necunoscut"))!;

    let imported = 0;
    const batches = chunk(toImport, 200);

    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b]!;
      await prisma.$transaction(
        batch.map((row) => {
          const notes: string[] = [];
          const t1 = classifyTechnicianField(row.technician1, 1, knownTechnicianNames);
          const t2 = classifyTechnicianField(row.technician2, 2, knownTechnicianNames);
          const t3 = classifyTechnicianField(row.technician3, 3, knownTechnicianNames);

          for (const part of [t1, t2, t3]) {
            if (part.kind === "note" && part.text) notes.push(part.text);
          }

          const marker = importMarker(row.id);
          const observations = [...notes, marker].join(" | ") || marker;

          const doctorId =
            doctorByNorm.get(normalizeName(row.doctorName.trim() || "Necunoscut")) ?? fallbackDoctorId;

          const technician1Id =
            t1.kind === "technician" ? techByNorm.get(normalizeName(t1.text)) ?? null : null;
          const technician2Id =
            t2.kind === "technician" ? techByNorm.get(normalizeName(t2.text)) ?? null : null;
          const technician3Id =
            t3.kind === "technician" ? techByNorm.get(normalizeName(t3.text)) ?? null : null;

          const workTypeId =
            workTypeByNorm.get(normalizeName(row.workDescription.trim() || "Nespecificat")) ??
            workTypeByNorm.get(normalizeName("Nespecificat"))!;

          return prisma.work.create({
            data: {
              entryDate: resolveEntryDate(row),
              patientName: row.patientName.trim() || "—",
              observations,
              paymentStatus: mapPaymentStatus(row.paymentStatus),
              doctorId,
              lines: {
                create: {
                  workTypeId,
                  technicianId: technician1Id,
                  technician2Id: technician2Id,
                  technician3Id: technician3Id,
                  quantity: 1,
                  doctorUnitPrice: 0,
                  technicianUnitPrice: 0,
                },
              },
            },
          });
        }),
      );

      imported += batch.length;
      process.stdout.write(`\r  ${imported}/${toImport.length} lucrări ...`);
    }

    console.log("\nImport finalizat.");
    console.log(`  Doctori noi: ${doctorsCreated}`);
    console.log(`  Tehnicieni noi: ${techniciansCreated}`);
    console.log(`  Tipuri lucrări noi: ${workTypesCreated}`);
    console.log(`  Lucrări importate: ${imported}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
