# Ghid de instalare și distribuire — Lab Manager

## 1. Instalare pe calculatorul de dezvoltare (prima configurare)

Necesar: [Node.js](https://nodejs.org) versiunea 20 sau mai nouă.

```bash
git clone <url-ul repo-ului tau>
cd lab-manager
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Asta pornește aplicația direct, cu hot-reload. E suficient pentru dezvoltare și testare zilnică — nu ai nevoie de pașii de mai jos decât atunci când vrei să dai aplicația mai departe (instalator, alt calculator).

## 2. Construirea unui instalator (pentru distribuire)

```bash
npm run build
```

Rezultatul apare în folderul `release/`:
- **macOS**: fișier `.dmg`
- **Windows**: fișier `.exe` (instalator NSIS)
- **Linux**: fișier `.AppImage`

**Important**: `electron-builder`, implicit, construiește instalatorul **pentru platforma pe care rulează comanda**. Dacă rulezi `npm run build` pe un Mac, obții un `.dmg` pentru macOS — nu un `.exe` pentru Windows.

## 3. Scenariul tău: build de pe Mac, instalare pe un calculator Windows

Ai trei variante, de la cea mai simplă la cea mai robustă:

### Varianta A — Build direct pe calculatorul Windows țintă (cea mai simplă)

Dacă ai acces la calculatorul Windows (chiar temporar, sau prin remote desktop):

```bash
# pe calculatorul Windows
git clone <url-ul repo-ului tau>
cd lab-manager
npm install
npx prisma migrate dev --name init
npm run build
```

Rezultă direct un `.exe` nativ, fără nicio complicație de cross-compilare. **Aceasta e varianta recomandată dacă ai acces fizic sau la distanță la mașina Windows, fie și temporar.**

### Varianta B — Cross-build de pe Mac către Windows (`electron-builder --win`)

`electron-builder` poate produce un instalator Windows de pe macOS, dar target-ul NSIS are nevoie de **Wine** instalat pe Mac:

```bash
brew install --cask wine-stable
npm run build -- --win
```

Funcționează în majoritatea cazurilor, dar poate avea probleme punctuale (semnare de cod, anumite dependențe native ca Prisma/Argon2 cu binare specifice platformei). Testează instalatorul rezultat înainte să-l consideri gata de livrare.

### Varianta C — CI/CD cu GitHub Actions (cea mai robustă, recomandată pe termen lung)

Dacă proiectul e deja pe GitHub (vezi secțiunea 4), poți construi automat pentru toate platformele, fiecare pe sistemul ei nativ, fără nicio grijă de cross-compilare. Creează `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx prisma generate
      - run: npm run build:renderer
      - run: npx electron-builder --publish never
      - uses: actions/upload-artifact@v4
        with:
          name: lab-manager-${{ matrix.os }}
          path: release/*.{dmg,exe,AppImage}
```

La fiecare tag `v*` împins pe git (`git tag v1.0.0 && git push --tags`), GitHub construiește automat instalatoare pentru Mac, Windows și Linux, disponibile ca artefacte de descărcat — fără să ai nevoie de un calculator Windows fizic.

## 4. Instalarea pe calculatorul Windows (odată ce ai `.exe`-ul)

1. Copiază fișierul `.exe` pe calculatorul Windows (stick USB, transfer de rețea, sau descărcat direct dacă ai folosit Varianta C).
2. Rulează instalatorul — Windows poate afișa un avertisment „Windows protected your PC" pentru că aplicația nu e semnată digital cu un certificat plătit; alege „More info" → „Run anyway".
3. La prima pornire, aplicația îți cere să configurezi o parolă nouă — baza de date pornește goală pe noul calculator.

### Probleme frecvente pe Windows (nesemnat digital)

| Simptom | Cauză | Soluție |
|--------|--------|---------|
| **Windows protected your PC** / SmartScreen | `.exe` nesemnat | „More info" → „Run anyway" |
| **Avast / CyberCapture blochează** | fișier nou, necunoscut | Avast → Exceptions → adaugă `.exe`-ul |
| **Parolă incorectă** după upgrade | hash vechi sau DB corupt | Login → „Resetează parola" sau șterge `%APPDATA%\lab-manager\database\lab-manager.db` |
| **Eroare la pornire (Prisma)** | versiune veche | Instalează ultimul `.exe` din GitHub Actions |
| **Date dispărute după update** | normal — update-ul nu șterge AppData | Baza e în `%APPDATA%\lab-manager\database\` — folosește Backup regulat |

**Loguri pentru diagnostic:** `%APPDATA%\lab-manager\logs\`

**Semnare digitală (viitor):** certificat code signing (~200–400 €/an) elimină majoritatea avertismentelor Antivirus/SmartScreen.

## 5. Migrarea datelor pe noul calculator (dacă vrei să continui cu aceleași date)

Aplicația nu sincronizează automat între calculatoare (funcționează strict local, conform cerinței inițiale). Pentru a muta datele:

1. Pe calculatorul vechi: **Backup → Exportă** (alege orice backup din listă, sau creează unul nou întâi) → salvează fișierul `.db` pe un stick USB.
2. Pe calculatorul nou, după instalare: **Backup → Restaurează din fișier extern** → selectează fișierul `.db` de pe stick.

Toate datele (clienți, lucrări, materiale, salarii, tot) apar instant pe noul calculator. Parola de acces rămâne cea din baza de date restaurată (nu cea setată inițial pe calculatorul nou).

## 6. Urcarea pe GitHub

```bash
git init
git add .
git commit -m "Initial commit — Lab Manager, toate cele 12 module"
git branch -M main
git remote add origin <url-ul repo-ului tau de pe GitHub>
git push -u origin main
```

Fișierele sensibile (`.env`, baza de date `.db`, `node_modules/`, `dist/`) sunt deja excluse prin `.gitignore` — nu vor ajunge pe GitHub.

## 7. Deschiderea în Cursor

Deschide direct folderul proiectului în Cursor. Structura feature-based (fiecare modul cu `domain/infrastructure/application/ipc` pe partea de Electron, și `api/hooks/components/pages` pe partea de React) e gândită explicit ca Cursor să poată naviga și extinde ușor — cere-i, de exemplu, „adaugă un câmp nou la Client" și indică-i tiparul unui modul existent ca referință.
