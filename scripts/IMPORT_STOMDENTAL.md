# Import date din Stomdental (program vechi)

Importă exportul MariaDB `.sql` (ex. `gestiunecomenzi_....sql`) în baza aplicației BSC CRM.

## Înainte de import

1. **Backup** — din aplicație (Backup → Export) sau copiază manual `prisma/lab-manager.db`
2. Închide aplicația Electron (să nu țină baza deschisă)

## Rulare

```bash
cd lab-manager

# Verificare (fără scriere în DB)
npm run import:stomdental -- "/Users/daniel/Downloads/gestiunecomenzi_-08-2026_1511_.sql" --dry-run

# Import complet (~59.000 lucrări, câteva minute)
npm run import:stomdental -- "/Users/daniel/Downloads/gestiunecomenzi_-08-2026_1511_.sql"
```

## Ce se importă

| Vechi | Nou |
|-------|-----|
| `doctori` + nume din lucrări | **Doctori** |
| `tehnicieni` + nume din câmpuri tehnician | **Tehnicieni** |
| `lucrare` (text) | **Tip lucrare** (câte un tip per descriere unică) |
| `lucrari` | **Lucrări** + o linie per înregistrare |
| `data_scriere` | **Data intrării** |
| `status` | **Status plată** (Neplatită / Plătită doctor / Plătită tehnician) |

Prețurile din vechiul program (cifre puse greșit la Tehnician 2) ajung în **observații** ca „Preț vechi: …”.

Fiecare lucrare importată are un marker invizibil în observații: `[stomdental:12345]` — ca să nu se dubleze la re-rulare.

## Opțiuni

| Flag | Efect |
|------|--------|
| `--dry-run` | Doar citește SQL-ul și afișează statistici |
| `--force` | Re-importă și lucrările deja importate (poate crea duplicate) |

## După import

- Configurează **grilele de preț** la Doctori / Tehnicieni (exportul vechi nu le conține)
- Lucrările importate au preț 0 — normal pentru istoric
- Raportul de salariu pentru date vechi va arăta 0 până configurezi grilele (sau editezi manual)

## Pe Windows (secretara)

Copiază fișierul `.sql` pe calculator, deschide terminal în folderul aplicației (sau folosește PowerShell) și rulează aceeași comandă `npm run import:stomdental -- "C:\cale\fisier.sql"`.

Necesită Node.js instalat o dată pe acel PC (doar pentru import, nu pentru utilizarea zilnică a `.exe`).
