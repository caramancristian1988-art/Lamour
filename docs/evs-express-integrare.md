# Integrarea cu EVS Express (curier) — documentație tehnică

Documentul descrie **exact** cum este făcută integrarea cu EVS Express (Muvi) Shipments Local API v3.1 în acest proiect:
ce face fiecare fișier, ce apeluri se trimit, ce capcane ale API-ului au fost descoperite și cum se reproduce pe alt proiect.
API-ul oficial: `docs/evs-express-api-3.1.pdf`.

> Nu conține parole sau chei. Valorile reale se țin doar în variabilele de mediu (Vercel / `.env` local).

## 1. Ce face integrarea

Pentru comenzile din coș (`ContactMessage` cu `source = "Comandă din coș"`) site-ul:

1. validează la checkout datele de livrare (localitate din nomenclatorul EVS, telefon, email, cod poștal de 4 cifre);
2. calculează greutatea comenzii din greutatea produselor;
3. **creează automat AWB-ul** (fișa de expediere) la EVS când comanda e confirmată sau marcată „Achitat”;
4. **cheamă curierul** (`ActivatePickUp`) când depozitarul apasă „Gata de ridicare”;
5. citește **statusul AWB-ului** de la EVS și îl afișează în admin și în Telegram;
6. descarcă **eticheta AWB** (PDF cu cod de bare) pentru lipit pe colet;
7. **anulează AWB-ul** (`RemoveDoc`) dacă comanda e anulată înainte de ridicare.

Totul rulează pe server (nicio cheie EVS nu ajunge în browser).

## 2. Fișiere

| Fișier | Rol |
|---|---|
| `lib/evsExpress.ts` | Clientul API: `createShipment`, `activatePickup`, `removeShipment`, `getShipmentStatus`, `parseLatestAwbStatus`, `fetchLatestAwbStatus`, `getAwbLabel` |
| `lib/adminMessageActions.ts` | Logica de business: `maybeCreateEvsShipment`, `advanceOrderStage`/`applyOrderStage` (tranzițiile comenzii care declanșează apelurile EVS) |
| `lib/adminShipmentActions.ts` | Acțiuni manuale din admin: validare (`type=validate`), creare AWB, reîmprospătare status |
| `app/admin/components/EvsShipmentPanel.tsx` | Panoul „EVS Express” din `/admin/mesaje` (validare, creare manuală, status) |
| `app/api/admin/awb-label/route.ts` | Descărcarea etichetei AWB din admin (după id-ul comenzii, nu după AWB brut) |
| `app/api/telegram/webhook/route.ts` | Butonul de etichetă AWB din Telegram + butoanele de etapă care declanșează EVS |
| `lib/deliveryValidation.ts` | Validări: telefon, email, cod poștal (cerințele EVS) |
| `lib/moldovaLocalities.ts` | Lista oficială de localități EVS (generată) |
| `scripts/fetch-moldova-localities.js` | Regenerează lista de localități din `GetNomenclatures?type=localities` |
| `lib/localityMatch.ts`, `app/components/LocalityField.tsx` | Potrivire exactă / sugestii (Levenshtein) pentru localitate la checkout |
| `lib/orderWeight.ts` | Greutatea comenzii (suma greutăților × cantități) |
| `lib/orderStages.ts` | Etapele comenzii: `noua` → `confirmata` → `predata_curier` / `anulata` |
| `prisma/schema.prisma` | Câmpurile `awbCode`, `awbStatus`, `awbCreatedAt`, `deliveryLocality`, `deliveryAddress`, `deliveryZip`, `deliveryWeightKg`, `deliveryCodAmount`, `ownDelivery` pe `ContactMessage`; `weightKg` pe `Product` |

## 3. Variabile de mediu

| Variabilă | Obligatorie | Ce este |
|---|---|---|
| `EVS_USERNAME`, `EVS_PASSWORD` | da | Contul API EVS (se trimit ca parametri de adresă, cum cere API-ul) |
| `EVS_SHIPPER_BRANCH_CODE` | da | Codul sucursalei expeditorului (cod din contul EVS) |
| `EVS_SHIPPER_CONTACT_PERSON_CODE` | da | Codul persoanei de contact a sucursalei |
| `EVS_AWB_CUSTOMER_PREFIX` | da | Prefixul de **3 litere** alocat de EVS contului nostru (intră în numărul AWB) |
| `EVS_API_URL` | nu | Implicit `https://api.muvi.dev/Shipments/Local/` |
| `EVS_API_VERSION` | nu | Implicit `3.1` (parametrul `api`) |

Lipsa oricăreia dintre cele obligatorii **nu aruncă excepție**: funcțiile întorc `{ ok: false, description }` cu mesajul „Lipsesc … din .env”.

## 4. Apelurile către EVS (cele folosite)

Baza: `EVS_API_URL`. Fiecare apel primește `username`, `password`, `api` în adresă. Cererile cu corp sunt `POST` JSON, restul `GET`.
Timeout 20 s (`AbortSignal.timeout`) — fără el, un EVS care nu răspunde bloca webhook-ul Telegram.

| Funcție | Endpoint | Parametri | Observații |
|---|---|---|---|
| `createShipment` | `POST CreateShipment` | `method=Standard`, `pickup=0|1`, `type=validate|record` | `validate` nu creează nimic; `record` creează AWB-ul real |
| `activatePickup` | `POST ActivatePickUp` | corp `[{ "AWB": "…" }]` | cheamă curierul pentru un AWB creat cu `pickup=0` |
| `removeShipment` | `GET RemoveDoc` | `type=AWB`, `doc_code=<AWB>` | doar cât AWB-ul nu e „gata de ridicare” |
| `getShipmentStatus` | `POST GetGroupAWBActions` | corp `[{ "AWB": "…" }]` | statusul unui singur AWB (`GetAWBActions` cere interval de date pe tot contul — nu îl folosim) |
| `getAwbLabel` | `GET GetDoc` | `type=AWB`, `doc_code`, `format=PDF`, `size=A4|100x100` | `100x100` = etichetă pentru imprimantă termică |
| (script) | `GET GetNomenclatures` | `type=localities` | sursa listei de localități |

### Corpul `CreateShipment` (un obiect într-un array)

```jsonc
[{
  "Shipper":  { "Type": "Branch", "Branch": { "Code": "<EVS_SHIPPER_BRANCH_CODE>", "ContactPersonCode": "<EVS_SHIPPER_CONTACT_PERSON_CODE>" } },
  "Receiver": { "Type": "Custom", "Custom": {
      "Name": "<client>", "ContactPersonName": "", "InternalID": "",
      "Phones": ["<telefon>"], "Emails": ["<email valid sau lista goală>"],
      "AddressType": "Standard",
      "AddressStandard": { "Line_1": "<adresa, localitatea>", "Line_2": "", "ZIP": "<4 cifre>", "Comment": "" } } },
  "AWB": "<generat de noi>",
  "InternalID_1": "", "InternalID_2": "",          // OBLIGATORII la type=record (vezi capcanele)
  "Service": 1,
  "COD": { "Type": "Fixed", "Amount": 314 },        // sau { "Type": "None", "Amount": 0 } dacă nu e ramburs
  "DeclaredValue": 314,                             // întreg, minim 1
  "PayServiceAtDelivery": { "Type": "None", "Amount": 0 },
  "ReturnDocsSpecification": "",
  "Labels": [{ "Code": "<AWB>", "Weight": 3.4, "InternalCode": "" }],
  "Weight": 3.4,
  "AllowOpenParcel": false,
  "Comment": ""
}]
```

- **COD (ramburs):** site-ul acceptă doar plata la livrare, deci `codAmount` = totalul comenzii (inclusiv livrarea), salvat la plasare în `deliveryCodAmount`.
- **Adresa:** `Line_1 = "<strada, nr>, <localitate>"` (ordinea din documentația EVS: strada întâi, localitatea după).
- **Email:** trimis doar dacă trece `isValidCourierEmail`; un email invalid face ca EVS să respingă tot AWB-ul, deci mai bine fără el.

### Numărul AWB

Îl generăm noi, format cerut de EVS: `XXX[0-9A-Z]{7}MMYY` (14 caractere): prefixul de 3 litere (`EVS_AWB_CUSTOMER_PREFIX`) +
7 caractere aleatoare + luna și anul (ex. `ABC7K2M9QX1026`). Se salvează în `ContactMessage.awbCode` **doar dacă** EVS a confirmat.

## 5. Interpretarea răspunsurilor (capcanele descoperite)

1. **Forma de eroare normală:** `{ Code, TrueFalse: false, Description }`. `Description` se afișează mereu brut adminului.
2. **`type=validate` fără probleme întoarce `TrueFalse:false` cu `Code:"3000"`** („No issue found. Records not registered…”). Nu e o eroare, e rezultatul dorit; în cod, `validateOnly && code === "3000"` → succes. Alte coduri (3001, 3005, 3017 …) sunt erori reale.
3. **Erorile de infrastructură** vin ca **HTTP 502** `{ status, error }` — **fără** `TrueFalse`. Înainte, lipsa lui `TrueFalse:false` era luată drept succes și se salva un AWB inexistent. Acum: `!res.ok`, câmpul `error` sau `status >= 400` = eșec.
4. **`InternalID_1` / `InternalID_2` lipsă:** `type=validate` trece, dar `type=record` pică cu HTTP 502 „Object field not found (InternalID_1)”. Trebuie trimise (goale) la fiecare AWB.
5. **ZIP:** exact 4 cifre (altfel „Invalid chars count: …ZIP”).
6. **Email:** fără domeniu complet („nume@gmail”) este respins, deși `<input type="email">` îl acceptă → validare proprie `isValidCourierEmail`.
7. **Localitatea** trebuie să existe în nomenclatorul EVS → lista oficială în `lib/moldovaLocalities.ts`; la checkout se acceptă doar potrivirea exactă (cu sugestii pentru greșeli de tastare).
8. **Statusul AWB** vine imbricat: `[[{ AWBNumber, Actions: [{ AWBStatus, ActionDate }] }]]`. `parseLatestAwbStatus` aplatizează, ia acțiunile în ordine cronologică și întoarce ultimul `AWBStatus`.
9. **Eticheta:** la succes răspunsul e PDF (se verifică începutul `%PDF`); la eroare vine JSON cu `Description` (sau 502 `{ error }`).
10. **Greutate:** minim 0,1 kg; produsele fără greutate se socotesc la 1 kg/buc (`DEFAULT_UNIT_WEIGHT_KG`).

> Notă: comentariul de la începutul `lib/evsExpress.ts` (că un răspuns de succes la `CreateShipment` nu ar fi fost observat live) este
> depășit — ulterior `type=record` a fost rulat și au fost găsite capcanele de mai sus (punctul 4), iar formatul statusului (punctul 8)
> este „verificat live”. Forma exactă a răspunsului de succes la `record` rămâne tratată defensiv: orice `TrueFalse !== false` fără eroare de proxy = succes.

## 6. Fluxul complet al unei comenzi

```
Checkout (CheckoutPanel)
  └─ validări: telefon, email, localitate (exactă), ZIP 4 cifre
  └─ comanda se salvează cu deliveryLocality/Address/Zip, deliveryWeightKg, deliveryCodAmount
        │
Operator în Telegram / admin: „Confirmă”  ──►  etapa `confirmata`
  └─ maybeCreateEvsShipment(pickup=false)  →  CreateShipment type=record, pickup=0
       • ok  → awbCode + awbCreatedAt salvate; curierul NU e chemat încă
       • eroare → comanda rămâne confirmată, operatorul primește avertisment (se reîncearcă la pasul următor)
        │
Depozitarul: „Gata de ridicare”  ──►  etapa `predata_curier`
  └─ are AWB?  da → ActivatePickUp(awb)
               nu → maybeCreateEvsShipment(pickup=true) (creează și cheamă curierul deodată)
  └─ EVS refuză → etapa revine la cea veche, avertisment cu motivul (butonul rămâne apăsabil)
  └─ ok → salesCount++ la produse, notificări către curier/manager
        │
La orice tranziție: fetchLatestAwbStatus → awbStatus (ex. „Received information”) în admin și Telegram

Anulare după confirmare (înainte de ridicare):  RemoveDoc(awb) → awbCode șters; eșec → avertisment „șterge manual”
```

Reguli de siguranță din cod:
- **Tranziție atomică** de etapă (`updateMany` cu etapa veche în `where`): două apăsări de buton sau același update Telegram livrat de două ori nu creează AWB duplicat și nu cheamă curierul de două ori.
- `maybeCreateEvsShipment` nu face nimic dacă există deja `awbCode` (fără AWB duplicat la retrogradări/remarcări).
- Un eșec EVS **nu blochează** schimbarea de status; adminul poate crea AWB-ul manual din panoul „EVS Express”.
- **Livrare proprie** (`ownDelivery`, ex. comenzile importate din fișier): nu se încearcă AWB/ridicare, decât dacă un AWB a fost creat manual.
- Comanda „Achitat” (status) declanșează tot `maybeCreateEvsShipment`, atât din admin, cât și din butonul Telegram.

## 7. Cum se testează fără să creezi expediții reale

1. În panoul „EVS Express” din `/admin/mesaje` folosește **Validează** (`type=validate`) — nu creează nimic. Rezultat bun = „No issue found…” (cod 3000).
2. Pentru un test real: o comandă de probă, „Confirmă”, apoi verifică AWB-ul în contul EVS și șterge-l cu anularea comenzii (`RemoveDoc`) înainte de „Gata de ridicare”.
3. Eticheta se poate descărca imediat după creare (`/api/admin/awb-label?id=<idComandă>&size=100x100`).

## 8. Cum se reproduce pe alt proiect (listă de verificare)

1. Cere de la EVS: cont API, codul sucursalei și al persoanei de contact, **prefixul AWB de 3 litere** și documentația API v3.1.
2. Copiază `lib/evsExpress.ts` (independent de restul aplicației — doar `fetch` și variabilele de mediu) și setează variabilele din secțiunea 3.
3. Rulează `scripts/fetch-moldova-localities.js` pentru lista de localități și folosește potrivirea exactă la checkout.
4. Salvează la comandă: localitate, adresă, ZIP (4 cifre), greutate, sumă ramburs.
5. Creează AWB-ul la confirmare cu `pickup=0`, chemarea curierului cu `ActivatePickUp` la „gata de ridicare”.
6. Tratează răspunsurile exact ca în secțiunea 5 (în special: cod 3000 la validate, 502 fără `TrueFalse`, `InternalID_1/2` goale).
7. Fă tranzițiile de etapă **atomice** și AWB-ul **idempotent**.

## 9. Limite și lucruri de știut

- Un singur colet pe AWB (`Labels` are un element, cu greutatea totală).
- Serviciul este fix `Service: 1` și `method=Standard`.
- Statusul AWB se actualizează la tranzițiile de etapă și la cerere (buton în admin); nu există o sincronizare periodică în fundal.
- Expeditorul este mereu sucursala din variabilele de mediu.

## 10. Comenzi din fișier (Telegram) cu livrare prin curier

Fișierele Excel/PDF trimise botului într-un chat cunoscut (grupul principal, un destinatar conectat sau un grup din
Admin → Telegram → drepturi pe grup, ex. „Export comenzi”) creează o comandă (`handleOrderFileMessage` în `app/api/telegram/webhook/route.ts`).

- Dacă fișierul conține rândul **„Livrare prin compania de curierat”** (sau orice rând de livrare cu „EVS”), comanda NU mai e „livrare proprie”: adresa
  se desparte în **localitate** (exact din nomenclatorul EVS), **stradă** și **cod poștal** (`parseCourierAddress`), apoi comanda se confirmă și
  se creează AWB-ul (`advanceOrderStageReport` → `maybeCreateEvsShipment`, `pickup=0`; curierul e chemat abia la „Gata de ridicare”).
- AWB-ul poartă numele, telefonul, adresa, greutatea, rambursul (0 dacă „plată prin transfer”) și, în `Comment`, **toate produsele** cu cantități.
- Botul răspunde în același grup: **AWB creat** (cu cod, client, adresă, greutate, ramburs, produse) sau **eroarea exactă** de la EVS / ce lipsește
  (de ex. codul poștal) și cum se repară. Rezultatul apare și în jurnalul serverului (`import fișier (curier): …`).
- Codul poștal se recunoaște ca `MD-2001`, `cod poștal 2001` sau ca număr de 4 cifre singur între virgule. Dacă lipsește, se **completează automat** din
  lista oficială (`lib/moldovaPostalCodes.ts`, generată cu `scripts/build-postal-codes.js` din „Coduri poștale RM”, dataset.gov.md) **doar pentru localitățile cu
  un singur cod** (nu pentru Chișinău și nu pentru nume omonime); în mesajul din grup apare o notă „cod completat automat”. Fără cod (și fără completare), AWB-ul
  nu se poate crea (EVS cere ZIP) și mesajul din grup spune ce lipsește.
- **Anti-dublură (Excel + PDF ale aceleiași comenzi):** cheia comenzii (`OrderImportKey`, index unic) = numărul extern „Comanda Nr.” + luna, sau o
  amprentă a conținutului (telefon + produse + cantități) pe zi. Al doilea fișier e ignorat cu un mesaj; nu se creează nici comandă, nici AWB nou.
  Dacă primul import eșuează, cheia se eliberează ca retrimiterea să poată reuși.
- Pentru ca botul să primească fișiere într-un grup, trebuie să fie **administrator** al grupului sau să aibă „Group Privacy” oprit în BotFather.
