# API de control al catalogului — produse, categorii, subcategorii, oferte, comenzi

Controlezi catalogul site-ului din orice aplicație (Excel/VBA, Python, Postman, un alt site): **citire, creare, editare, ștergere**
pentru produse, categorii, subcategorii, oferte și **comenzi**. Orice modificare reîmprospătează automat site-ul (cache-ul catalogului și paginile
atinse), deci se vede imediat — nu trebuie să aștepți.

Adresa de bază: `https://lumina.md/api/catalog` · Format: JSON (UTF-8) · Toate răspunsurile sunt `Cache-Control: no-store`.

---

## 1. Activare și chei

În Vercel → Settings → Environment Variables:

| Variabilă | Ce permite |
|---|---|
| `CATALOG_API_KEYS` | chei cu drept **complet** (citire + creare + editare + ștergere) |
| `CATALOG_API_READ_KEYS` | chei **doar pentru citire** (ex. un tablou de bord) — la orice scriere primesc `403` |

Mai multe chei se separă prin virgulă (fiecare de cel puțin 16 caractere). Fiecare programator primește cheia lui; o revoci scoțând-o
din listă. După modificarea variabilei, redeploy.

Cheia se trimite în **antet** (niciodată în adresă, adresele rămân în jurnale):

```
X-API-Key: <cheia>
```
sau `Authorization: Bearer <cheia>`.

Cheia dă control **absolut** asupra catalogului (inclusiv ștergere) — păstreaz-o ca pe o parolă. Fiecare scriere reușită apare în jurnalul
Vercel (Logs) ca `[catalog-api] cheia …abcd · modifică produs · slug`, cu ultimele 4 caractere ale cheii.

Verificare rapidă:
```bash
curl -H "X-API-Key: $KEY" https://lumina.md/api/catalog
# → { "ok": true, "produse": 312, "categorii": 24, "endpoints": [...] }
```

## 2. Reguli generale

- **Referința unui produs** (`{ref}`) = `id` (24 hex), `slug` sau `code` (cod produs) — în această ordine.
- **Referința unei categorii** = `id` sau `slug`.
- **Câmpurile JSON au numele din baza de date** (`name`, `price`, `oldPrice`, `priceTiers`, `hidden` …), exact ca în formularul din admin.
- **PATCH modifică doar ce trimiți.** Un câmp opțional se șterge cu `null` (ex. `"oldPrice": null`).
- Un obiect citit cu GET se poate trimite înapoi cu PATCH ca atare (câmpurile doar-citire — `id`, `createdAt`, `rating`, `reviewCount`,
  `variants`, `url`, `discountPercent`, `quantityOffers` — sunt ignorate la scriere).
- Un câmp necunoscut sau o valoare greșită dă `422` cu lista problemelor în `details` — nimic nu se salvează pe jumătate.
- **Coduri de răspuns:** `200` ok · `201` creat · `400` cerere goală/invalidă · `401` cheie lipsă/greșită · `403` cheie doar-citire ·
  `404` nu există · `409` conflict (slug/cod duplicat, ștergere refuzată) · `422` date invalide · `503` API neactivat.
- Erorile au forma `{ "error": "text", "details": ["…"] }`.
- **Doar GET și POST?** Orice operație se poate face printr-un POST pe adresa resursei (`/produse/{ref}`, `/categorii/{ref}`, `/oferte/{ref}`,
  `/comenzi/{ref}`), cu metoda dorită în `?_method=PATCH|PUT|DELETE` sau în antetul `X-HTTP-Method-Override`. Fără ele, un POST pe o resursă
  înseamnă **modificare** (PATCH; la oferte PUT). Exemple: `POST /produse/grebla?_method=DELETE` șterge, `POST /comenzi/1052` cu `{"stage":"confirmata"}` o confirmă.
  Creările (`POST /produse`, `/categorii`, `/comenzi`, `/oferte`, `/produse/bulk`) și citirile (GET) funcționează direct.
- Slug-ul se normalizează (fără diacritice/spații) și e **unic între produse ȘI categorii** (pagina `/produse/{slug}` le servește pe amândouă).

## 3. Produse

### `GET /api/catalog/produse`
Parametri (toți opționali): `q` (nume / slug / cod / brand) · `categorie` (id|slug — include subcategoriile) · `ascuns=da|nu` ·
`principale=1` (fără variante) · `disponibilitate=În stoc` · `sortare=nou|vechi|pret|pret-desc|nume` · `pagina=1` ·
`perPagina=100` (max 500, sau `toate`) · `format=json|csv`.

```json
{ "total": 312, "pagina": 1, "perPagina": 100, "pagini": 4, "produse": [ { "id": "…", "slug": "…", "code": "A1B2C3", "name": "…", "price": 100,
  "oldPrice": 125, "discountPercent": 20, "quantityOffers": [{ "minQty": 10, "price": 90 }], "category": { "id": "…", "name": "…", "slug": "…" }, "variants": [] } ] }
```
`format=csv` întoarce un tabel (se deschide direct în Excel) cu coloanele principale.

### `GET /api/catalog/produse/{ref}`
Un produs, cu categoria și variantele lui.

### Câmpurile unui produs (ce întoarce GET)

**Bifele sunt mereu `true` / `false`, niciodată `null`.** (În baza de date unele produse mai vechi nu au deloc câmpul; API-ul le
normalizează, cu aceeași semnificație ca pe site.) Lista include **și produsele ascunse** — ca să le excluzi, folosește `?ascuns=nu`.

| Câmp | Tip | Poate fi `null`? | Semnificație |
|---|---|---|---|
| `hidden` | bool | nu | `true` = ascuns din admin (nu apare pe site); `false` = afișat |
| `visible` | bool | nu | invers lui `hidden` (`true` = afișat pe site) |
| `visibility` | text | nu | `"afisat"` sau `"ascuns"` — răspunsul explicit |
| `warrantyEnabled` | bool | nu | `true` = „Garanție 2 ani”; `false` = produs fără garanție |
| `recommended` | bool | nu | apare în „Produse recomandate” pe prima pagină |
| `isNewProduct` | bool | nu | apare în „Produse noi” |
| `installmentsEnabled` | bool | nu | se poate cumpăra în rate |
| `popupEnabled` | bool | nu | poate apărea în fereastra cu oferte |
| `id`, `slug`, `name`, `price`, `availability`, `salesCount`, `createdAt`, `categoryId` | | nu | mereu completate |
| `code` | text | **da** (produse foarte vechi) | cod produs salvat; `displayCode` = codul afișat pe site (la lipsă, ultimele 6 caractere ale id-ului) |
| `displayCode` | text | nu | codul de folosit la afișare / căutare |
| `oldPrice` | număr | da | preț vechi (reducere dacă e mai mare decât `price`); `null` = fără reducere |
| `discountPercent` | întreg | nu | procentul reducerii calculat (0 = fără reducere) |
| `priceTiers` / `quantityOffers` | listă | nu (poate fi goală) | oferta la cantitate: `[{ minQty, price }]` (`quantityOffers` include și vechiul prag unic `bulkMinQty`/`bulkPrice`) |
| `bulkMinQty`, `bulkPrice` | număr | da | forma veche a ofertei la cantitate (folosește `priceTiers`) |
| `weightKg` | număr | da | greutate pe bucată; `effectiveWeightKg` = cea folosită la livrare (lipsă → 1 kg) |
| `description`, `brand`, `badge`, `packageQuantity`, `image` | text | da | informații opționale; `null` = necompletat în admin |
| `images`, `specifications` | listă | nu (poate fi goală) | galeria și caracteristicile |
| `highlight` | text | da | eticheta specială aleasă manual (`bestseller`, `popular`, `nou`, `sezon`, `util`, `none`); `null` = **automat** (site-ul o alege după vânzări, dată și categorie) |
| `variantGroupId`, `variantLabel` | text | da | `null` = produs principal (nu variantă) |
| `rating`, `reviewCount` | număr | nu | calculate din recenzii (0 = fără recenzii) |

Dacă un câmp opțional apare `null`, înseamnă **necompletat**, nu eroare. Pentru a-l completa: `PATCH` cu valoarea dorită.

### `POST /api/catalog/produse` — creează
Obligatoriu: `name`, `price`, `category` (id|slug). Restul sunt opționale.
```json
{
  "name": "Greblă 12 dinți",
  "price": 100,
  "category": "greble",
  "slug": "grebla-12-dinti",
  "code": "LT-141",
  "description": "Text…",
  "oldPrice": 125,
  "priceTiers": [{ "minQty": 10, "price": 90 }],
  "image": "https://…", "images": ["https://…"],
  "packageQuantity": "1 buc", "weightKg": 0.8, "brand": "Gardena", "badge": "Nou",
  "availability": "În stoc",
  "installmentsEnabled": true, "warrantyEnabled": true, "popupEnabled": false,
  "hidden": false, "recommended": true, "isNewProduct": true, "highlight": "util",
  "salesCount": 0,
  "specifications": [{ "label": "Material", "value": "oțel" }],
  "variantGroup": "slug-produs-principal", "variantLabel": "2 buc"
}
```
- `code` gol/omis → se generează automat (6 caractere); dacă îl dai, trebuie să fie unic (litere — mari sau mici, și cu diacritice — și cifre, cu spațiu, punct, cratimă, `/` sau `_` între ele: `LMP204`, `LT-141`, `LT 141.5`; se salvează cu majuscule).
- `highlight`: `bestseller | popular | nou | sezon | util | none` sau `null` (= automat, după reguli).
- `variantGroup` face din produs o **variantă** a produsului principal (care nu poate fi el însuși variantă).
- Prag unic vechi: `bulkMinQty` + `bulkPrice` (amândouă sau niciunul). Pentru praguri noi folosește `priceTiers`.
- Un prag de cantitate trebuie să fie **mai mic** decât prețul de bază.
- `rating` și `reviewCount` nu se setează (se calculează din recenzii).

### `PATCH /api/catalog/produse/{ref}` — editează
Trimite doar câmpurile de schimbat; mutarea în altă categorie: `"category": "alt-slug"`; ascundere de pe site: `"hidden": true`;
scoaterea din grupul de variante: `"variantGroup": null`.

### `DELETE /api/catalog/produse/{ref}[?cuVariante=1]`
Șterge produsul (și întrebările lui frecvente; **recenziile se păstrează**). Un produs cu variante dă `409` și lista variantelor —
le ștergi mai întâi, sau adaugi `?cuVariante=1` ca să le ștergi împreună.

### `POST /api/catalog/produse/bulk` — mai multe operații (max. 200)
Executate pe rând, **fără tranzacție**: fiecare reușește/eșuează separat, iar răspunsul le listează. Site-ul se reîmprospătează o singură dată.
```json
{ "ops": [
  { "op": "create", "data": { "name": "A", "price": 10, "category": "greble" } },
  { "op": "update", "ref": "a", "data": { "price": 12 } },
  { "op": "delete", "ref": "a", "cuVariante": true }
] }
```
→ `{ "total": 3, "reusite": 3, "esuate": 0, "rezultate": [ { "index": 0, "op": "create", "ok": true, "status": 200, "data": {…} }, … ] }`

## 4. Categorii și subcategorii

O subcategorie e tot o categorie, cu `parent`. Structura are **două niveluri** (categorie → subcategorie), ca pe site.

### `GET /api/catalog/categorii[?tree=1][&parent=<slug|id|radacina>]`
Listă plată în ordinea de pe site (cu `productCount`, `childrenCount`, `parentSlug`), sau arbore cu `tree=1` (subcategoriile în `children`).

### `GET /api/catalog/categorii/{ref}`
O categorie cu subcategoriile ei.

### `POST /api/catalog/categorii`
```json
{ "name": "Greble metalice", "parent": "greble", "slug": "greble-metalice", "description": "…", "image": "https://…", "displayOrder": 5 }
```
`displayOrder`: număr întreg, mai mic = mai sus în meniu și pe prima pagină (gol = 0). Fără `parent` → categorie principală.

### `PATCH /api/catalog/categorii/{ref}`
Doar câmpurile trimise. Mutarea sub alt părinte: `"parent": "slug"`; promovare la categorie principală: `"parent": null`.
Refuză bucle și al treilea nivel. Schimbarea slug-ului face ca adresa veche să dispară (404).

### `DELETE /api/catalog/categorii/{ref}[?moveTo=<categorie>][&cascade=1]`
- fără parametri → șterge doar o categorie **goală**; altfel `409` cu numerele (produse, subcategorii);
- `moveTo=<categorie>` → mută produsele și subcategoriile în altă categorie, apoi șterge;
- `cascade=1` → șterge **TOT**: subcategoriile și produsele lor (cu variante și întrebări frecvente). Irevocabil — fă mai întâi un export.

## 5. Oferte

Pe produs există două feluri de oferte, ambele afișate pe site:
- **reducere** — `oldPrice` (prețul vechi, tăiat) mai mare decât `price` → insigna „−X%” și suma economisită;
- **ofertă la cantitate** — `priceTiers` → „de la 10 buc.: 11,5 MDL/buc”, aplicat automat în coș.

### `GET /api/catalog/oferte[?tip=reducere|cantitate|toate][&categorie=<slug>]`
```json
{ "total": 14, "laReducere": 9, "laCantitate": 7, "oferte": [ { "slug": "…", "price": 120, "oldPrice": 150, "discountPercent": 20,
  "discountAmount": 30, "quantityOffers": [{ "minQty": 10, "price": 100 }], "hasDiscount": true, "hasQuantityOffer": true } ] }
```

### `GET /api/catalog/oferte/{ref}` · `PUT /api/catalog/oferte/{ref}` · `DELETE /api/catalog/oferte/{ref}`

`PUT` — corp cu `reducere` și / sau `cantitate`:
```json
{ "reducere": { "procent": 20 } }                        // −20% față de prețul vechi (sau cel curent); „oldPrice” devine baza
{ "reducere": { "pretNou": 110 } }                       // noul preț; prețul de dinainte devine „preț vechi”
{ "reducere": { "pretVechi": 150, "pretNou": 120 } }     // setare directă
{ "reducere": null, "restabilestePretul": true }         // șterge reducerea; prețul revine la cel vechi (fără restabilestePretul rămâne cel redus)
{ "cantitate": [{ "minQty": 10, "price": 11.5 }, { "minQty": 30, "price": 10 }] }
{ "cantitate": null }                                    // șterge pragurile
```
`procent` e **idempotent**: dacă reducerea există deja, se calculează din prețul vechi, deci repetarea cererii nu „scade din nou”.

`DELETE /api/catalog/oferte/{ref}[?tip=reducere|cantitate|toate][&restabilestePretul=1]` — scurtătură pentru ștergere.

### `POST /api/catalog/oferte` — oferte în masă
Pentru o listă de produse și / sau o categorie întreagă (cu subcategoriile), max. 1000 de produse:
```json
{ "categorie": "greble", "procent": 15 }
{ "produse": ["slug-a", "COD123"], "cantitate": [{ "minQty": 10, "price": 11.5 }] }
{ "categorie": "greble", "anuleaza": true, "tip": "reducere", "restabilestePretul": true }
```
Răspuns: `{ total, reusite, esuate, rezultate: [ { ref, ok, error?, oferta? } ] }`.

## 6. Comenzi

O comandă = o comandă „din coș” (aceeași ca în Admin → Comenzi și în Telegram). Orice faci aici **are aceleași efecte ca atunci când o face un operator**:
mesajul din Telegram se editează, AWB-ul EVS se creează la confirmare, depozitarul / curierul sunt anunțați, vânzările produselor cresc.
Comenzile **nu se șterg niciodată** (fac parte din registrul permanent): `DELETE` le **arhivează**; anularea reală e `"stage": "anulata"`.

### Etape și statusuri
| Câmp | Valori | Semnificație |
|---|---|---|
| `stage` (etapa operațională) | `noua` · `confirmata` · `predata_curier` · `anulata` | nouă → confirmată (la pregătire, se creează AWB EVS) → gata de ridicare (curierul e chemat) · anulată (definitivă: nu mai poate fi schimbată) |
| `status` (starea plății / contactului) | `in_asteptare` · `sunat` · `nu_raspunde` · `se_gandeste` · `programat` · `in_lucru` · `achitat` · `anulat` | `achitat` crește cu 1 vânzările produselor și încearcă AWB (dacă nu există); la revenire din `achitat` scade |
| `extraction.status` (registrul de extragere) | `neextrasa` · `rezervata` · `extrasa` | doar citire aici; se schimbă prin API-ul de registru |

**Atenție:** „gata de ridicare” (`predata_curier`) crește și el vânzările produselor. Folosește fie `stage`, fie `status: "achitat"` ca să marchezi vânzarea, nu amândouă, ca să nu se numere de două ori.

### `GET /api/catalog/comenzi`
Parametri (opționali): `etapa` · `status` · `extragere` · `arhivate=da|nu` (implicit toate) · `q` (număr, nume, telefon, email) · `de` / `pana` (AAAA-LL-ZZ sau ISO) ·
`sortare=nou|vechi` · `pagina=1` · `perPagina=50` (max 200, sau `toate`) · `format=json|csv`.
```json
{ "total": 120, "pagina": 1, "perPagina": 50, "pagini": 3, "comenzi": [ {
  "id": "…", "orderNumber": "1052", "ref": "1052", "createdAt": "2026-10-20T09:15:00Z",
  "stage": "confirmata", "stageLabel": "Confirmată — la pregătire", "status": "in_asteptare", "statusLabel": "În așteptare", "read": true,
  "archived": false,
  "customer": { "name": "Ion Popescu", "phone": "069123456", "email": null },
  "delivery": { "locality": "Chișinău", "address": "str. Test 1", "zip": "2001", "weightKg": 7.5, "codAmount": 1190, "ownDelivery": false,
                "awbCode": "…", "awbStatus": "…", "awbCreatedAt": "…" },
  "invoice": { "requested": false, "sentAt": null },
  "items": [ { "name": "Greblă", "code": "LT-141", "quantity": 12, "unitPrice": 80, "lineTotal": 960, "estimated": false } ],
  "itemCount": 15, "total": 1190, "paymentMethod": "Plată la livrare", "note": "Sunați înainte",
  "extraction": { "status": "neextrasa", "label": "Neextrasă", "exportId": null, "extractedAt": null, "extractedBy": null },
  "message": "textul complet al comenzii"
} ] }
```
`items[].unitPrice` / `lineTotal` sunt prețurile **de la plasare**; `estimated: true` = comandă veche, fără preț salvat (estimat din catalogul actual).
`format=csv` dă un tabel cu o linie pe comandă (produsele într-o coloană).

### `GET /api/catalog/comenzi/{număr | id}`
O comandă (ex. `/comenzi/1052`). Dacă același număr a fost setat manual pe două comenzi → `409` cu id-urile; folosește atunci id-ul.

### `POST /api/catalog/comenzi` — creează o comandă
```json
{
  "customer": { "name": "Ion Popescu", "phone": "069123456", "email": "ion@example.com" },
  "items": [ { "product": "grebla-12-dinti", "quantity": 12 }, { "product": "LT-141", "quantity": 1 } ],
  "delivery": { "locality": "Chișinău", "address": "str. Test 1", "zip": "2001", "ownDelivery": false },
  "note": "Sunați înainte",
  "paymentByTransfer": false,
  "invoice": { "companyName": "SRL Exemplu", "idno": "1002600000000", "address": "…", "vat": "…" },
  "confirm": false
}
```
- `product` = slug, id sau cod produs; același produs repetat se adună. Prețul se ia **din catalog** (cu pragurile de cantitate), niciodată din cerere.
- `customer.name` și `customer.phone` sunt obligatorii. `invoice` (opțional) cere `companyName` și `idno` și trimite automat datele contabilului.
- `delivery.ownDelivery: true` = livrăm noi (fără curier EVS). `paymentByTransfer: true` = plătită prin transfer (fără ramburs).
- `confirm: true` o confirmă direct (ca „Confirmă” din Telegram): depozitarul o primește și se creează AWB-ul EVS dacă are adresă și cod poștal. Implicit `false`: comanda rămâne „nouă”, pentru un operator.
- Comanda apare în Telegram și în admin ca orice altă comandă. Răspuns `201` cu comanda completă (+ `evs` dacă s-a încercat AWB).
- **Limită:** aceeași ca formularul public al site-ului — cel mult 15 comenzi la 10 minute de la aceeași adresă IP (`429` peste).

### `PATCH /api/catalog/comenzi/{ref}` — modifică (și `POST` cu `?_method=PATCH` sau fără)
Trimite doar ce schimbi:
```json
{ "stage": "confirmata" }
{ "status": "achitat" }
{ "orderNumber": "1052", "read": true, "archived": false }
{ "customer": { "name": "…", "phone": "…", "email": "…" } }
{ "delivery": { "locality": "…", "address": "…", "zip": "…", "weightKg": 7.5, "codAmount": 1190, "ownDelivery": false } }
```
- Datele se salvează **înainte** de schimbarea etapei, deci AWB-ul se creează din adresa și greutatea noi.
- Rândul „Livrare: …” din textul comenzii (Telegram, fișa tipărită) urmează adresa nouă. Mesajul din Telegram se editează.
- Dacă etapa nu poate fi aplicată (ex. comandă anulată, sau EVS refuză ridicarea) → `409` cu motivul; celelalte modificări trimise rămân salvate.
- Răspunsul conține comanda actualizată și, când s-a încercat un AWB, `evs: { ok, description }`.
- **Produsele** unei comenzi nu se pot schimba prin API (ca să nu se strice prețurile salvate): anulează comanda și creeaz-o pe cea corectă.

### `DELETE /api/catalog/comenzi/{ref}` (sau `POST …?_method=DELETE`)
Arhivează comanda (dispare din lista `arhivate=nu`, rămâne în registru și în exporturi). Se reia cu `PATCH { "archived": false }`.

## 7. Export complet

`GET /api/catalog/export` → `{ exportatLa, categorii: [arbore], produse: [toate, inclusiv ascunse], totalProduse }`. Folosește-l ca **copie de siguranță**
înainte de operații mari (`cascade`, oferte în masă).

## 8. Exemple

**curl**
```bash
KEY="cheia-ta"; B="https://lumina.md/api/catalog"

# creează o subcategorie
curl -X POST "$B/categorii" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"name":"Greble metalice","parent":"greble"}'

# schimbă prețul și ascunde produsul
curl -X PATCH "$B/produse/grebla-12-dinti" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"price":110,"hidden":true}'

# −20% la toată categoria
curl -X POST "$B/oferte" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"categorie":"greble","procent":20}'

# creează o comandă
curl -X POST "$B/comenzi" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"customer":{"name":"Ion","phone":"069123456"},"items":[{"product":"grebla-12-dinti","quantity":2}]}'

# confirmă comanda 1052 (doar GET/POST disponibile: POST direct = modificare)
curl -X POST "$B/comenzi/1052" -H "X-API-Key: $KEY" -H "Content-Type: application/json" -d '{"stage":"confirmata"}'

# tabel CSV cu toate produsele
curl -H "X-API-Key: $KEY" "$B/produse?perPagina=toate&format=csv" -o produse.csv
```

**Python**
```python
import requests
B, H = "https://lumina.md/api/catalog", {"X-API-Key": "cheia-ta"}
r = requests.patch(f"{B}/produse/grebla-12-dinti", headers=H, json={"price": 110})
r.raise_for_status()
print(r.json()["price"])
```

**VBA (Excel)**
```vba
Function Catalog(metoda As String, cale As String, Optional corp As String = "") As String
    Dim http As Object: Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    http.Open metoda, "https://lumina.md/api/catalog" & cale, False
    http.setRequestHeader "X-API-Key", "cheia-ta"
    http.setRequestHeader "Content-Type", "application/json"
    If corp = "" Then http.Send Else http.Send corp
    Catalog = http.responseText   ' http.Status = 200 / 201 / 4xx
End Function
' Catalog "PATCH", "/produse/grebla-12-dinti", "{""price"":110}"
```
(Textul JSON în VBA se citește cu un parser JSON, ex. VBA-JSON; pentru un tabel simplu folosește `format=csv` și Power Query.)

## 9. Ce NU face

- Nu setează `rating` / `reviewCount` (vin din recenzii) și nu atinge recenziile.
- Nu schimbă produsele unei comenzi existente și nu șterge definitiv comenzi (se arhivează / se anulează).
- Nu încarcă poze: `image` / `images` primesc adrese (URL) — pozele se încarcă separat (din admin) și se pun aici ca adresă.
- Nu e tranzacțional în operațiile în masă: dacă o cerere cade la mijloc, ce s-a făcut până atunci rămâne făcut (răspunsul spune ce a reușit).
