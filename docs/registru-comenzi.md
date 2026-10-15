# Registrul de comenzi (site + Telegram)

Un singur registru permanent, accesibil din două interfețe care folosesc **aceeași bază de date**:

- site: `/admin/comenzi`
- Telegram: comenzile `/noi`, `/registru`, `/extrase`, `/comanda`, `/extrage`, `/istoric`, `/status`, `/ajutor`, `/id`

Nu există un al doilea registru: comenzile sunt rândurile `ContactMessage` cu `source = "Comandă din coș"`.

## Statusuri (independente)

| Etapă operațională (`orderStage`) | Status extragere (`extractionStatus`) |
|---|---|
| Comandă nouă / Confirmată / Gata de ridicare / Anulată | Neextrasă / Rezervată pentru extragere / Extrasă |

O comandă poate fi finalizată operațional și totuși neextrasă.

## Cum se extrage (site sau Telegram)

1. **Pregătește exportul** — toate comenzile neextrase sunt rezervate atomic și primesc statusul „Rezervată”.
2. **Descarcă fișierul** — Excel, un rând per produs. Se poate descărca de oricâte ori (conține mereu aceleași comenzi).
3. **Confirmă extragerea** — abia acum comenzile devin „Extrase”. Telegram acceptând fișierul NU marchează nimic.
   - „Nu am primit fișierul” retrimite fișierul; „Anulează” readuce comenzile la „Neextrasă”.
   - O rezervare neconfirmată expiră după 24 h și comenzile revin singure la „Neextrasă”.
   - Dacă pagina se închide sau conexiunea se pierde, „Pregătește exportul” **reia** exportul existent, nu creează altul.

Comenzile nu dispar niciodată din registru. Ștergerea comenzilor din coș a fost înlocuită cu **arhivare**
(ascunde din lista implicită, dar rămâne în registru și în exporturi).

## Configurare

Variabile de mediu (Vercel → Settings → Environment Variables):

| Variabilă | Rol |
|---|---|
| `TELEGRAM_REGISTRY_CHAT_ID` | ID-ul grupului registrului (anunțurile accesibile pentru comenzi noi; comenzile se acceptă doar de aici sau în privat). Ex. `-5380228863` |
| `TELEGRAM_REGISTRY_ADMIN_IDS` | ID-urile Telegram (separate prin virgulă) cu toate drepturile — primul administrator. Se află trimițând `/id` botului |

Alte persoane: **/admin/telegram → „Registrul de comenzi în Telegram — drepturi”**.

Drepturi: `vizualizare`, `consultare`, `date_personale`, `extragere`, `confirmare`, `administrare`.
Identitatea este ID-ul Telegram (`from.id`), nu numele sau apartenența la grup.

Date personale: telefonul, adresa și fișierul Excel complet se trimit **doar în conversația privată cu botul**,
doar celor autorizați. Persoana trebuie să fi apăsat Start în conversația privată cu botul cel puțin o dată.

## Migrare (făcută o singură dată)

`node scripts/migrate-order-registry.js --apply` marchează comenzile existente „extrase”, ca primul export să conțină
doar comenzile noi. Idempotent.

## Teste

```
DATABASE_URL=... node scripts/test-order-registry.js      # rezervare, concurență, confirmare, anulare, expirare, arhivare
DATABASE_URL=... node scripts/test-telegram-registry.js   # comenzi, permisiuni, date personale, fișier Excel (fetch simulat)
```

Ambele folosesc comenzi sintetice, izolate de cele reale, și șterg tot la final.

## Limitări cunoscute

- Verificările cu NVDA / JAWS / VoiceOver / TalkBack și sesiunea cu utilizatori nevăzători **nu au fost făcute**; interfața
  urmează practici WCAG (HTML semantic, `aria-live`, fără modale, ordine logică a focusului) dar trebuie validată cu utilizatorii.
- Unitatea de preț și produsele unei comenzi vechi (dinainte de registru) sunt calculate din catalogul actual și marcate ca „estimate”.
- Metoda de plată este fixă: „Plată la livrare” (site-ul nu are alt mod de plată).
- Notificările de comandă nouă către grupul registrului sunt reîncercate la `/noi` și `/status`, nu printr-un cron.
