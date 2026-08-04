-- Grile preț: doctor × tip lucrare, tehnician × doctor × tip lucrare.
-- Tehnician pe linie (WorkLine) — salariu per linie, fără împărțire egală.

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

-- Tehnician responsabil pe fiecare linie de lucrare.
ALTER TABLE "WorkLine" ADD COLUMN "technicianId" TEXT REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "WorkLine_technicianId_idx" ON "WorkLine"("technicianId");
