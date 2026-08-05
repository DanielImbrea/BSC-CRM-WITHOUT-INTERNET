-- Schema finală CRM laborator dentar — folosită ca fallback în app-ul împachetat.
CREATE TABLE "AppAuth" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "passwordHash" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Technician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "WorkType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "doctorPrice" INTEGER NOT NULL,
    "technicianPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryDate" DATETIME NOT NULL,
    "patientName" TEXT NOT NULL,
    "observations" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'NEPLATITA',
    "doctorId" TEXT NOT NULL,
    "technician1Id" TEXT,
    "technician2Id" TEXT,
    "technician3Id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Work_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Work_technician1Id_fkey" FOREIGN KEY ("technician1Id") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Work_technician2Id_fkey" FOREIGN KEY ("technician2Id") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Work_technician3Id_fkey" FOREIGN KEY ("technician3Id") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "WorkLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "workTypeId" TEXT NOT NULL,
    "technicianId" TEXT,
    "technician2Id" TEXT,
    "technician3Id" TEXT,
    "quantity" INTEGER NOT NULL,
    "doctorUnitPrice" INTEGER NOT NULL,
    "technicianUnitPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkLine_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkLine_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "WorkType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkLine_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkLine_technician2Id_fkey" FOREIGN KEY ("technician2Id") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkLine_technician3Id_fkey" FOREIGN KEY ("technician3Id") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" TEXT,
    "after" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BackupRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Doctor_name_idx" ON "Doctor"("name");
CREATE INDEX "Technician_name_idx" ON "Technician"("name");
CREATE INDEX "Technician_active_idx" ON "Technician"("active");
CREATE INDEX "WorkType_name_idx" ON "WorkType"("name");
CREATE INDEX "Work_doctorId_idx" ON "Work"("doctorId");
CREATE INDEX "Work_entryDate_idx" ON "Work"("entryDate");
CREATE INDEX "Work_paymentStatus_idx" ON "Work"("paymentStatus");
CREATE INDEX "Work_patientName_idx" ON "Work"("patientName");
CREATE INDEX "WorkLine_workId_idx" ON "WorkLine"("workId");
CREATE INDEX "WorkLine_workTypeId_idx" ON "WorkLine"("workTypeId");
CREATE INDEX "WorkLine_technicianId_idx" ON "WorkLine"("technicianId");
CREATE INDEX "WorkLine_technician2Id_idx" ON "WorkLine"("technician2Id");
CREATE INDEX "WorkLine_technician3Id_idx" ON "WorkLine"("technician3Id");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE TABLE "DoctorRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "workTypeId" TEXT NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DoctorRate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DoctorRate_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "WorkType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TechnicianRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "technicianId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "workTypeId" TEXT NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechnicianRate_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechnicianRate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechnicianRate_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "WorkType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DoctorRate_doctorId_workTypeId_key" ON "DoctorRate"("doctorId", "workTypeId");
CREATE INDEX "DoctorRate_doctorId_idx" ON "DoctorRate"("doctorId");
CREATE INDEX "DoctorRate_workTypeId_idx" ON "DoctorRate"("workTypeId");
CREATE UNIQUE INDEX "TechnicianRate_technicianId_doctorId_workTypeId_key" ON "TechnicianRate"("technicianId", "doctorId", "workTypeId");
CREATE INDEX "TechnicianRate_technicianId_idx" ON "TechnicianRate"("technicianId");
CREATE INDEX "TechnicianRate_doctorId_idx" ON "TechnicianRate"("doctorId");
CREATE INDEX "TechnicianRate_workTypeId_idx" ON "TechnicianRate"("workTypeId");
