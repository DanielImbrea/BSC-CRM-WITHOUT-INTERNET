# Lab Manager

Aplicație desktop offline pentru managementul unui laborator — clienți, lucrări, materiale, costuri, salarii, rapoarte, backup, audit log. 100% locală, fără server, fără cloud.

## Stack tehnic

- **Desktop**: Electron 32
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui (Radix)
- **Backend**: rulează în main process-ul Electron, comunicare prin IPC (nu HTTP)
- **ORM**: Prisma 5
- **Bază de date**: SQLite (fișier local, în `userData` la aplicația împachetată)
- **State management**: TanStack Query
- **Formulare**: React Hook Form + Zod

## Arhitectură

Feature-based, cu straturi Clean Architecture în main process:

```
electron/
  main/
    features/<modul>/
      domain/          # reguli de business pure, fără Prisma/Electron
      infrastructure/  # repository-uri Prisma
      application/     # use-cases (orchestrare, validare, audit log)
      ipc/              # handlere IPC subțiri
    shared/            # db client, logger, erori, wrapper IPC
  preload/             # contextBridge — singurul pod între main și renderer
src/
  features/<modul>/    # components, hooks, api, types, pages — pe fiecare modul
  shared/              # componente UI (shadcn), utilitare, tipuri globale
shared-types/          # contract IPC comun (tipuri + nume de canale)
prisma/
  schema.prisma
```

Cele 12 module: Dashboard, Autentificare, Clienți, Lucrări, Materiale, Costuri, Salarii, Cont (fostul "Utilizatori" — vezi nota de mai jos), Rapoarte, Backup, Setări, Audit Log.

**Notă:** aplicația e single-user, single-machine, autentificare offline cu o singură parolă (Argon2id). Modulul "Utilizatori" din specificația inițială a devenit un ecran de cont/securitate (schimbare parolă), nu administrare de conturi multiple — decizie confirmată explicit în timpul dezvoltării.

## Pornire rapidă (prima rulare)

```bash
# 1. Instalează dependențele
npm install

# 2. Copiază fișierul de mediu
cp .env.example .env

# 3. Generează clientul Prisma și creează baza de date (o singură dată)
npx prisma migrate dev --name init

# 4. Pornește aplicația în modul dezvoltare
npm run dev
```

`npm run dev` pornește Vite (dev server pentru React) și lansează automat fereastra Electron — un singur comand, nimic de rulat separat.

La prima pornire, aplicația cere să setezi o parolă (ecran de configurare inițială). La pornirile ulterioare, cere acea parolă pentru autentificare.

## Scripturi disponibile

| Script | Ce face |
|---|---|
| `npm run dev` | Pornește aplicația în modul dezvoltare (hot reload) |
| `npm run build` | Build complet de producție + pachet instalabil (electron-builder) |
| `npm run build:renderer` | Doar build-ul React (fără packaging Electron) — util pentru verificare rapidă |
| `npm run typecheck` | Verifică tipurile TypeScript pe tot proiectul, fără să genereze fișiere |
| `npm run lint` | ESLint |
| `npm run prisma:studio` | Deschide Prisma Studio — interfață vizuală pentru baza de date |
| `npm run prisma:migrate` | Creează o nouă migrare după ce modifici `schema.prisma` |

## Adăugarea unui modul nou

1. Creează folderele `electron/main/features/<modul>/{domain,infrastructure,application,ipc}` și `src/features/<modul>/{api,hooks,components,pages,types}`.
2. Adaugă tipurile în `shared-types/ipc.ts` (canale + payload-uri + `LabManagerApi`).
3. Scrie handler-ele IPC și înregistrează-le într-o singură linie în `electron/main/register-ipc-handlers.ts`.
4. Expune metodele noi în `electron/preload/index.ts`.
5. Construiește API layer + hooks + componente în `src/features/<modul>/`.
6. Adaugă ruta în `src/routes/router.tsx` și activează itemul din `src/shared/components/app-sidebar.tsx`.

Acest tipar a fost aplicat consecvent la toate cele 12 module — orice modul nou îl poate urma identic.

## Documente adiționale

- [`GHID_UTILIZARE.md`](./GHID_UTILIZARE.md) — cum se folosește aplicația, modul cu modul
- [`GHID_INSTALARE.md`](./GHID_INSTALARE.md) — cum se instalează pe alt calculator, inclusiv build cross-platform (Mac → Windows)
