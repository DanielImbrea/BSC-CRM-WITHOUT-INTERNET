# Instalare pe Windows — ghid pentru secretară

Dacă apar erori de tip **„Windows cannot access…”** sau **„cannot complete the extraction”**, urmează exact pașii de mai jos.

---

## Ce ai nevoie (2 fișiere separate)

1. **`BSC-CRM-Setup-0.3.6.exe`** — programul (instalator)
2. **`lab-manager.db`** — baza de date cu toate datele (doctori, lucrări etc.)

**Nu** rula instalatorul direct din arhivă. **Nu** pune `.exe` și `.db` într-un singur zip dacă extragerea eșuează — transferă-le separat (stick USB, WhatsApp/Web, email).

---

## Pasul 1 — Descarcă și extrage instalatorul

GitHub Actions livrează artefactul ca **zip** (`lab-manager-windows-latest.zip`). În interior e fișierul `.exe`.

1. Descarcă zip-ul pe **Desktop** sau în **Documente**
2. Click dreapta pe zip → **Extract All…** / **Extrage tot…**
3. Alege folder simplu, de exemplu: `C:\BSC-CRM`
4. Apasă **Extract** / **Extrage**

### Dacă extragerea eșuează („destination file could not be created”)

- Încearcă alt folder: `C:\BSC-CRM` (nu Desktop, nu OneDrive)
- Instalează **7-Zip** (gratuit) și extrage cu click dreapta → 7-Zip → Extract to…
- Închide antivirusul temporar sau adaugă excepție pentru folderul `C:\BSC-CRM`
- Verifică că ai spațiu liber pe disc (minim 500 MB)

---

## Pasul 2 — Rulează instalatorul

1. Deschide folderul `C:\BSC-CRM` (sau unde ai extras)
2. Click dreapta pe **`BSC-CRM-Setup-0.3.6.exe`**
3. Alege **Run as administrator** / **Rulează ca administrator**

### Dacă apare „Windows protected your PC” (SmartScreen)

1. Click **More info** / **Mai multe informații**
2. Click **Run anyway** / **Rulează oricum**

### Dacă apare „Windows cannot access the specified device, path or file”

Cauze frecvente: antivirus (Avast, Defender, CyberCapture) sau rulare din folder Temp.

1. **Nu** deschide `.exe`-ul din interiorul zip-ului fără extragere completă
2. Click dreapta pe `.exe` → **Properties** / **Proprietăți** → bifează **Unblock** / **Deblocare** (dacă există) → OK
3. Adaugă excepție în antivirus pentru `C:\BSC-CRM`
4. Rulează din nou **ca administrator**

---

## Pasul 3 — Instalare

1. Urmează wizard-ul de instalare
2. Poți lăsa locația implicită (de ex. `C:\Users\...\AppData\Local\Programs\...`)
3. La final, deschide aplicația **Billionaire Smile Club CRM** din Start sau de pe Desktop

La prima pornire baza e **goală** — normal. Datele vin la pasul următor.

---

## Pasul 4 — Restaurează baza de date

1. Copiază fișierul **`lab-manager.db`** pe stick sau pe Desktop (același calculator)
2. În aplicație: meniul **Backup**
3. Click **Restaurează din fișier extern**
4. Selectează fișierul **`lab-manager.db`**
5. Așteaptă mesajul verde **Restaurare reușită**
6. **Închide complet aplicația și deschide-o din nou** (important!)
7. Opțional: **Creează backup acum** ca să apară o copie în listă

**Nu** face dublu-click pe `.db` — restaurarea se face doar din aplicație.

---

## Pasul 5 — Setări recomandate

1. **Setări** → activează **backup automat la închiderea aplicației**
2. Periodic: **Backup → Creează backup acum** sau exportă pe stick

---

## Unde sunt datele pe Windows

| Ce | Locație |
|----|---------|
| Baza de date live | `%APPDATA%\Billionaire Smile Club CRM\database\lab-manager.db` |
| Backup-uri interne | `%APPDATA%\Billionaire Smile Club CRM\backups\` |
| Loguri (pentru suport) | `%APPDATA%\Billionaire Smile Club CRM\logs\` |

Pentru a deschide `%APPDATA%`: tasta Windows + R → scrie `%APPDATA%` → Enter.

---

## Probleme frecvente

| Problemă | Soluție |
|----------|---------|
| Zip nu se extrage | Folder `C:\BSC-CRM`, 7-Zip, dezactivare temporară antivirus |
| Instalator blocat | Extragere completă, Unblock, Run as administrator, excepție antivirus |
| Listă backup goală după restore extern | Normal — creează backup manual după restore |
| Eroare bază de date P2022 | Instalează **v0.3.6** (sau mai nou) |

---

## Actualizare (secretară care are deja aplicația și datele)

**Trimiți doar instalatorul `.exe` — fără bază de date.** Instalatorul nu conține datele laboratorului.

1. **Închide complet** aplicația (inclusiv din tray, dacă e deschisă)
2. Opțional dar recomandat: **Backup → Creează backup acum** (sau copiază manual `lab-manager.db` pe stick)
3. Rulează noul **`BSC-CRM-Setup-0.3.6.exe`** peste versiunea veche (Next → Install)
4. Deschide aplicația — **datele rămân** în AppData; **nu** înlocui manual fișierul `.db`

**Nu trebuie** să copieze/replaceze `lab-manager.db` la update. Baza live stă separat de program, în:

`%APPDATA%\Billionaire Smile Club CRM\database\lab-manager.db`

(Dacă a instalat foarte devreme, folderul poate fi `%APPDATA%\lab-manager\` — același subfolder `database\lab-manager.db`.)

**Nu șterge** folderul `database` din AppData la update. Doar la **prima instalare** (calculator nou, fără date) se folosește restore din Backup cu fișierul `.db` primit separat.
| Parolă greșită după restore | Parola e cea din baza restaurată (din `.db`), nu cea setată la instalare |

---

## Contact

Dacă tot nu merge, trimite screenshot + fișierele din folderul **logs** (ultimele `.log`).
