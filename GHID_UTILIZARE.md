# Ghid de utilizare — Lab Manager

## Pornirea aplicației

La prima deschidere, aplicația îți cere să setezi o parolă (minim 8 caractere, cu literă și cifră). Această parolă e cerută la fiecare pornire ulterioară — nu există conturi multiple, aplicația e gândită pentru un singur calculator, folosit de o singură persoană.

Dacă uiți parola, nu există recuperare automată (aplicația e offline, fără email/SMS de recuperare) — contactează persoana care a configurat aplicația sau, în ultimă instanță, va trebui reinstalată baza de date (se pierd datele, dacă nu există un backup).

## Panou general (Dashboard)

Prima ecranul văzut după autentificare: lucrări active, clienți, costuri din luna curentă, lucrări recente cu status. Se actualizează automat pe măsură ce lucrezi în celelalte module.

## Clienți

Evidența clienților laboratorului: nume, telefon, email, adresă. Un client nu poate fi șters dacă are lucrări asociate — mesajul de eroare îți spune exact acest lucru; trebuie mai întâi să ștergi sau să reasignezi lucrările.

## Lucrări

Nucleul aplicației. La crearea unei lucrări noi, completezi într-un singur formular:
- titlul și clientul
- materialele consumate (cantitate din fiecare, selectate din stocul existent)
- costurile asociate (manoperă, transport etc.)

Totul se salvează **atomic** — dacă ceva eșuează (de exemplu stoc insuficient la un material), nu se salvează nimic parțial. La salvare, stocul materialelor selectate scade automat.

Fiecare lucrare are un status: **În lucru**, **Finalizată**, **Anulată** — se schimbă din ecranul de detaliu al lucrării (click pe iconița de ochi din listă).

Dacă ștergi o lucrare, materialele consumate de ea **se restaurează automat în stoc**. Costurile rămân în evidență (utile pentru istoric financiar), doar se decuplează de la lucrarea ștearsă.

## Materiale

Gestiunea stocului: nume, unitate de măsură, cost unitar, cantitate în stoc, prag minim de stoc. Când stocul scade sub prag, materialul apare marcat vizual (triunghi galben de avertizare) în listă.

Stocul se modifică automat când creezi/ștergi lucrări care consumă materialul respectiv. Pentru recepții de marfă sau corecții manuale, folosește butonul de ajustare stoc (iconița de cutie) de pe fiecare rând — accepți cantități pozitive (adaugă) sau negative (scade).

Un material nu poate fi șters dacă a fost folosit în vreo lucrare — la fel ca la clienți, istoricul se păstrează.

## Costuri

Costuri generale ale laboratorului (chirie, utilități, transport) — spre deosebire de costurile per-lucrare din modulul Lucrări. Poți filtra după categorie și interval de date. Un cost poate fi opțional legat de o lucrare existentă din același formular.

## Salarii

Are două zone, accesibile din tab-uri:

- **Salarii** — înregistrare lunară per angajat (salariu de bază, bonusuri, deduceri). Suma netă se calculează automat, nu se introduce manual. Nu poți înregistra două salarii pentru același angajat în aceeași lună (aplicația blochează duplicatele).
- **Angajați** — evidența angajaților. Dacă un angajat are salarii înregistrate, nu poate fi șters — dezactivează-l în schimb (debifează „Activ" la editare), ca istoricul de salarii să rămână intact.

## Cont

Ecranul de securitate al aplicației — schimbarea parolei de acces. Afișează și data ultimei schimbări.

## Rapoarte

Trei tipuri de rapoarte, fiecare cu interval de date ajustabil și export CSV (deschis direct în Excel):

- **Sumar financiar** — costuri totale, salarii nete totale, lucrări finalizate, defalcare pe categorii de cost
- **Pe client** — câte lucrări și cât cost a generat fiecare client, în perioada aleasă
- **Pe angajat** — câte salarii și cât total net a primit fiecare angajat, în perioada aleasă

## Backup

**Foarte important — citește această secțiune.** Aplicația nu face backup automat în cloud; toate datele stau doar pe acest calculator, într-un singur fișier `.db`. Dacă acest fișier se pierde (calculator stricat, ștergere accidentală) și nu ai backup, datele se pierd definitiv.

- **„Creează backup acum"** — salvează o copie internă, gestionată de aplicație.
- Fiecare backup din listă poate fi **exportat** (iconița de download) către un stick USB sau un folder de rețea — recomandat periodic, ca să ai o copie și în afara acestui calculator.
- **„Restaurează"** — înlocuiește toate datele curente cu conținutul unui backup vechi. Necesită confirmare explicită (scrii "RESTAUREAZĂ"), pentru că e ireversibil.
- **„Restaurează din fișier extern"** — pentru a aduce o bază de date de pe alt calculator (vezi `GHID_INSTALARE.md` pentru scenariul de migrare pe alt calculator).

Recomandare: activează backup-ul automat din Setări, și exportă periodic manual pe un stick USB.

## Setări

Singura setare configurabilă momentan: backup automat la fiecare închidere a aplicației, cu un număr maxim de backup-uri păstrate (cele mai vechi se șterg automat peste acest prag).

## Audit Log

Istoric al acțiunilor critice: **ștergeri** (din orice modul), **modificări de salarii**, **autentificări** (reușite și eșuate, schimbări de parolă), **restaurări de backup**. Nu conține fiecare editare banală (ex: schimbarea telefonului unui client) — doar ce contează pentru trasabilitate și securitate.

Poți filtra după tip de entitate, tip de acțiune și interval de date. Click pe un rând arată datele exacte dinainte/după acțiune (unde e relevant).
