-- Tehnician 2 și 3 pe fiecare linie de lucrare (ca în programul vechi).

ALTER TABLE "WorkLine" ADD COLUMN "technician2Id" TEXT REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkLine" ADD COLUMN "technician3Id" TEXT REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "WorkLine_technician2Id_idx" ON "WorkLine"("technician2Id");
CREATE INDEX "WorkLine_technician3Id_idx" ON "WorkLine"("technician3Id");
