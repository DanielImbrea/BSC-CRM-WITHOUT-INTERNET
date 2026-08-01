import { getPrismaClient } from "../../../shared/db";

const SINGLETON_ID = "singleton";

export interface AuthRecord {
  id: string;
  passwordHash: string;
  updatedAt: Date;
}

/**
 * Repository pentru AppAuth — mereu un singur rând (id fix "singleton").
 * Izolează Prisma de use-case-uri, ca să putem schimba ORM-ul fără să
 * atingem regulile de business din application/.
 */
export const authRepository = {
  async find(): Promise<AuthRecord | null> {
    const db = getPrismaClient();
    return db.appAuth.findUnique({ where: { id: SINGLETON_ID } });
  },

  async upsertPasswordHash(passwordHash: string): Promise<AuthRecord> {
    const db = getPrismaClient();
    return db.appAuth.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, passwordHash },
      update: { passwordHash },
    });
  },
};
