# Integrarea site-ului cu CRM — partea SITE (contract v1)

Implementarea de pe site a contractului „Integrarea site-ului cu CRM, Contract API v1" (27 octombrie 2026). Două funcții independente:

1. **Notificări site → CRM** — coadă persistentă + trimitere semnată (HMAC-SHA256) către `https://crm-lumintehnica.vercel.app/api/site-sync/events`.
2. **Registru comun al numerelor de comandă** — două endpointuri noi (`rezerva`, `inregistreaza-istoric`) și checkout-ul site-ului pe același allocator.

## Ce se activează la publicare și ce nu

| Funcție | După publicare |
|---|---|
| Registru de numere (`/api/catalog/numere-comenzi/*`) | **Disponibil imediat** (autentificat cu cheia API existentă). Checkout-ul site-ului alocă deja prin registru. |
| Notificări către CRM | **Inactive** până setezi `CRM_SYNC_KEY`. Fără ea, extensia Prisma nu face nimic: site-ul se comportă exact ca înainte. |

## Variabile de mediu (Vercel)

| Variabilă | Rol |
|---|---|
| `CRM_SYNC_KEY` | Cheia API EXISTENTĂ a CRM-ului (aceeași valoare ca în CRM la Catalog site → Setări), min. 16 caractere. **Activează** notificările și e cheia cu care se semnează. Nu se trimite nicăieri. |
| `CRM_SYNC_URL` | (opțional) Adresa CRM. Implicit `https://crm-lumintehnica.vercel.app/api/site-sync/events`. |
| `CRM_SYNC_PAUSED=1` | (opțional) Oprește trimiterea; evenimentele continuă să se adune în coadă. |
| `CRON_SECRET` | Secretul programatorului periodic (min. 16 caractere) — vezi „Trimiterea periodică". |
| `CATALOG_API_KEYS` | Cheile API existente; aceleași chei autentifică endpointurile de numere. |

## 1. Notificări site → CRM

**Ce intră în coadă.** Orice scriere (din admin, Telegram, import Excel, API-ul de catalog) pe un **produs**, pe o **categorie** sau pe o **comandă din coș**
lasă un rând în coada `SiteSyncOutbox` (extensia Prisma din `lib/prisma.ts` → `lib/siteSyncEnqueue.ts`):

| Eveniment | Când | `data` |
|---|---|---|
| `order.upsert` | orice schimbare a unei comenzi din coș (creare, etapă, status, client, livrare, AWB, arhivare …) | comanda completă, ca în `GET /api/catalog/comenzi/{id}` (cu `items[].productId`) |
| `product.upsert` | produs creat / modificat | produsul complet, ca un element din `GET /api/catalog/export` → `produse` |
| `product.delete` | produs șters | `{ "id": "…" }` |
| `categories.replace` | orice schimbare de categorie / subcategorie | `{ "categorii": [arborele complet] }` |

**Starea completă, la timpul trimiterii.** În coadă se pune doar „entitatea X s-a schimbat" + o secvență (contor global, monoton, durabil). Starea
COMPLETĂ se citește chiar înainte de prima trimitere și se **îngheață**: reluările păstrează același `eventId` și aceiași octeți de corp, cu timestamp și
semnătură noi. Efecte: două modificări apropiate nu pot lăsa o stare veche cu secvență mai mare; modificările repetate ale aceleiași entități
cât timp nu s-a trimis nimic se unesc într-un singur eveniment; un produs șters între timp devine `product.delete`.

**Semnătura.** `HMAC-SHA256(CRM_SYNC_KEY, UTF8(timestamp + "\n") + octeții exacți ai corpului)`, antet `X-CRM-Signature: sha256=<hex>`, plus
`X-CRM-Timestamp` (secunde Unix, nou la fiecare încercare) și `Content-Type: application/json; charset=utf-8`. Limita corpului: 262.144 de octeți
(la o comandă prea mare se scoate textul brut `message`; dacă tot depășește, evenimentul e respins local și raportat).

**Răspunsuri și reluări** (exact tabelul din contract):

| CRM răspunde | Site-ul |
|---|---|
| `200` + `ok: true` (și `duplicate` / `stale` / `needsReview`) | confirmat; următorul |
| `400 / 413 / 415 / 422` | marcat `failed` (nu se repetă); coada merge mai departe |
| `401`, `409`, `429`, `5xx`, timeout, rețea | rămâne în coadă; reîncercare după 5 s, 15 s, 60 s, 5 min, 15 min, apoi la 15 min (cu variație aleatoare; `429` respectă `Retry-After`) |

Ordinea se păstrează: cât un eveniment așteaptă o reîncercare, cele de după el așteaptă. Un singur dispecer rulează o dată (lease în baza de date).

**Trimiterea periodică (worker-ul).** Pe Vercel nu rulează procese permanente, deci „worker-ul" are două părți:
- imediat după fiecare modificare, evenimentul se trimite după răspunsul cererii (`after()`);
- reîncercările și orice rest se trimit printr-un apel periodic la `GET /api/catalog/sync/dispatch` cu `Authorization: Bearer $CRON_SECRET`
  (sau cu cheia completă). Cel mai simplu: **Vercel Cron** — adaugă `vercel.json` cu
  ```json
  { "crons": [ { "path": "/api/catalog/sync/dispatch", "schedule": "* * * * *" } ] }
  ```
  *(planul Hobby permite doar un cron pe zi și ar respinge acest program; pe Pro merge din minut în minut. Altfel folosește orice serviciu de „ping" extern, la fiecare minut,
  cu antetul `Authorization: Bearer <CRON_SECRET>`.)* Nu am adăugat `vercel.json` ca să nu risc un deploy respins pe planul Hobby.

**Monitorizare.** `GET /api/catalog/sync` (cheie de citire sau completă): `pending`, `failed`, `oldestPending.ageSeconds` (alertă dacă crește), `lastSuccessAt`,
`lastError`, `lastHttpStatus`, ultimele evenimente respinse. Erorile se scriu și în jurnalul Vercel (`[site-sync] …`, cu „ALERTĂ” după 8 încercări).

**Alte endpointuri** (cheie completă): `POST /api/catalog/sync/resync` — pune în coadă starea actuală a TUTUROR produselor, comenzilor din coș și categoriilor, cu secvențe noi
(punctul de pornire după importul inițial din CRM; plasă de siguranță dacă s-a pierdut ceva) · `POST /api/catalog/sync/retry` — repune în coadă evenimentele respinse ca invalide.

### Ordinea de punere în funcțiune (partea site)
1. Publică această versiune (nimic nu se schimbă pentru notificări).
2. CRM: import inițial complet al catalogului + sincronizarea comenzilor existente (cu notificările dezactivate).
3. Setează `CRM_SYNC_KEY` (+ `CRON_SECRET`, cron-ul) → redeploy. Din acest moment se adună evenimentele.
4. `POST /api/catalog/sync/resync` → starea actuală a tuturor entităților intră în coadă cu secvențe noi.
5. În CRM activează „Notificările automate de la site". Evenimentele rămân în coadă cât CRM răspunde 503.
6. Verifică: o modificare de produs, o comandă nouă, o confirmare (cu CRM-ul închis în browser), `GET /api/catalog/sync` fără coadă blocată.

## 2. Registru comun al numerelor de comandă

Un singur allocator (`Counter "order"`, incrementare atomică) și un singur index unic pe `number` (`OrderNumberRegistry`) pentru:
- **checkout-ul site-ului** (`nextOrderNumber()` → registru, `source: "site"`);
- **rezervările CRM** (`source: "crm"`, idempotent după `requestId`);
- **numerele istorice** ale CRM-ului (`crm-istoric`) și ale site-ului (`site-istoric`, înregistrate automat o singură dată);
- numerele puse de mână în admin / API (`manual`, înregistrate ca ocupate; adminul poate seta intenționat același număr pe două comenzi, ca înainte).

Numerele nu expiră și nu se reciclează. Indexurile unice se creează automat la prima folosire (idempotent); `prisma db push` rămâne recomandat și le găsește deja în regulă.

### `POST /api/catalog/numere-comenzi/rezerva`
Antete: `X-API-Key` (cheia existentă) · `Content-Type: application/json` · `Idempotency-Key: crm-order-<requestId>`
```json
{ "source": "crm", "requestId": "6f88b948-a602-49df-b977-930098455b8c" }
```
Răspuns `201` (nou) sau `200` (reluare): `{ "requestId": "…", "number": "1003", "reservationId": "…" }`.
`number` e **text** (păstrează zerourile și prefixele). Aceeași identitate → mereu aceeași rezervare (și la cereri simultane); identități diferite → numere diferite.
Nu creează comandă, nu face AWB, nu trimite notificări. `requestId`: 1–100 de caractere ASCII (litere, cifre, `_`, `-`). Fără cache.

### `POST /api/catalog/numere-comenzi/inregistreaza-istoric`
Antete: `X-API-Key` · `Content-Type: application/json` · `Idempotency-Key: crm-history-<sha256 al listei>`
```json
{ "source": "crm", "numbers": ["1000", "1001", "LT-00001002"] }
```
Max. 1.000 de numere/lot (lista goală e permisă). Idempotent: nu modifică și nu creează comenzi. Răspuns:
```json
{ "ok": true, "namespace": "shared-v1", "registered": 3, "alreadyRegistered": 0, "ambiguous": [] }
```
- `ambiguous`: numere care **existau deja în alt sistem** (ex. același „1000" și pe site, sau rezervat de CRM): rămân ocupate de primul, se raportează pentru reconciliere (nu se renumerotează nimic).
- Seria numerică continuă după **cel mai mare număr** din ambele istorice (contorul site-ului e ridicat automat).
- La prima folosire, numerele comenzilor deja existente pe site se înregistrează o singură dată (câteva secunde, în funcție de număr).

## Limite și decizii de știut
- **Tranzacția.** Evenimentul se scrie în coadă imediat DUPĂ ce modificarea e salvată, nu în aceeași tranzacție MongoDB (extensia Prisma rulează după commit). Dacă procesul cade exact între cele două, un eveniment se poate pierde; `POST /api/catalog/sync/resync` îl recuperează. Evenimentele deja scrise în coadă nu se pierd (coada e în baza de date).
- **Secvența** e un întreg pe 32 de biți (contor MongoDB), suficient pentru ~2 miliarde de evenimente; nu se resetează la redeploy.
- **Comenzi vechi** fără prețuri salvate au `items[].estimated: true`; lipsa unui preț = `null`, nu zero.
- Numerele rezervate rămase nefolosite lasă goluri în serie (acceptat de contract).
- Limita formularului public (15 comenzi / 10 min / IP) rămâne valabilă și pentru `POST /api/catalog/comenzi`.
