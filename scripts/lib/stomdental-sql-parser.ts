/**
 * Parser minimal pentru dump-uri MariaDB Stomdental (INSERT ... VALUES (...),(...)).
 */

export function sqlValue(raw: string): string | null {
  const v = raw.trim();
  if (v === "NULL" || v === "") return null;
  return v.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
}

export function parseInsertTuples(valuesBlob: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const n = valuesBlob.length;

  while (i < n) {
    if (valuesBlob[i] !== "(") {
      i += 1;
      continue;
    }
    i += 1;
    const fields: string[] = [];
    let field = "";
    let inString = false;
    let escaped = false;

    while (i < n) {
      const c = valuesBlob[i]!;
      if (inString) {
        if (escaped) {
          field += c;
          escaped = false;
        } else if (c === "\\") {
          escaped = true;
        } else if (c === "'") {
          inString = false;
        } else {
          field += c;
        }
      } else if (c === "'") {
        inString = true;
      } else if (c === ",") {
        fields.push(field);
        field = "";
      } else if (c === ")") {
        fields.push(field);
        rows.push(fields);
        i += 1;
        break;
      } else if (c !== " " && c !== "\n" && c !== "\r" && c !== "\t") {
        field += c;
      }
      i += 1;
    }
  }

  return rows;
}

export function extractInsertRows(sql: string, table: string): string[][] {
  const pattern = new RegExp(`INSERT INTO \`${table}\` VALUES ([\\s\\S]+?);`, "g");
  const rows: string[][] = [];
  for (const match of sql.matchAll(pattern)) {
    rows.push(...parseInsertTuples(match[1]!));
  }
  return rows;
}

export interface StomdentalDoctorRow {
  id: number;
  name: string;
}

export interface StomdentalTechnicianRow {
  id: number;
  name: string;
}

export interface StomdentalWorkRow {
  id: number;
  entryDate: Date | null;
  doctorName: string;
  patientName: string;
  workDescription: string;
  technician1: string | null;
  technician2: string | null;
  technician3: string | null;
  paymentStatus: string;
  writtenAt: Date | null;
}

export function parseStomdentalDump(sql: string): {
  doctors: StomdentalDoctorRow[];
  technicians: StomdentalTechnicianRow[];
  works: StomdentalWorkRow[];
} {
  const doctors = extractInsertRows(sql, "doctori").map((fields) => ({
    id: Number(fields[0]),
    name: sqlValue(fields[1]!)?.trim() ?? "",
  }));

  const technicians = extractInsertRows(sql, "tehnicieni").map((fields) => ({
    id: Number(fields[0]),
    name: sqlValue(fields[1]!)?.trim() ?? "",
  }));

  const works = extractInsertRows(sql, "lucrari").map((fields) => {
    const entryRaw = sqlValue(fields[1] ?? "");
    const writtenRaw = sqlValue(fields[11] ?? "");
    return {
      id: Number(fields[0]),
      entryDate: entryRaw ? new Date(entryRaw) : null,
      doctorName: sqlValue(fields[3] ?? "")?.trim() ?? "",
      patientName: sqlValue(fields[4] ?? "")?.trim() ?? "",
      workDescription: sqlValue(fields[5] ?? "")?.trim() ?? "",
      technician1: sqlValue(fields[6] ?? ""),
      technician2: sqlValue(fields[7] ?? ""),
      technician3: sqlValue(fields[8] ?? ""),
      paymentStatus: sqlValue(fields[9] ?? "")?.trim() ?? "",
      writtenAt: writtenRaw ? new Date(writtenRaw) : null,
    };
  });

  return { doctors, technicians, works };
}
