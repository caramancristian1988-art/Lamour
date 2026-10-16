# API de citire a registrului de comenzi (pentru Excel și alte aplicații)

Doar **citire**: nu rezervă comenzi și nu le marchează ca extrase. Răspunsurile conțin telefon și adresă, deci cheia API
se păstrează ca o parolă.

## Activare (o singură dată, de proprietar)

1. Generează o cheie lungă (minim 16 caractere), de ex.: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. În Vercel → Settings → Environment Variables adaugă `REGISTRY_API_KEYS` = cheia (mai multe chei, separate prin virgulă:
   câte una pentru fiecare programator/aplicație; ca să revoci pe cineva, scoți cheia lui din listă). Apoi Redeploy.
3. Cheia se trimite în antet — **nu în adresă**: `X-API-Key: <cheia>` sau `Authorization: Bearer <cheia>`.

Fără cheie sau cu cheie greșită răspunsul este `401`; dacă variabila nu e setată, `503`.

## Adrese

| Adresă | Ce întoarce |
|---|---|
| `GET /api/registru/comanda/40` | comanda cu numărul 40 (un rând pe produs) |
| `GET /api/registru/comenzi` | comenzile neextrase |
| `GET /api/registru/comenzi?status=toate` | toate comenzile (`neextrasa`, `rezervata`, `extrasa`, `toate`) |

Parametri opționali la listă: `q` (număr / nume / telefon), `arhivate=1` (include arhivatele).
Format: `?format=json` (implicit), `?format=tsv` (text separat prin TAB — cel mai simplu pentru VBA) sau `?format=csv`.

Coloanele sunt aceleași ca în fișierul Excel din Registru: Nr. export, ID comandă, Data comenzii, Status comandă,
Status extragere, Client, Telefon, Adresa de livrare, Cod produs, Produs, Cantitate, Preț unitar (lei), Total produs (lei),
Total comandă (lei), Metoda de plată, Observații. Un rând pe produs; datele comenzii se repetă pe fiecare rând.
Comandă negăsită: `404` cu `{"error": "..."}`.

## Exemplu cu curl

```
curl -H "X-API-Key: CHEIA" "https://lumina.md/api/registru/comanda/40?format=tsv"
```

## Exemplu VBA (buton din Excel → comanda într-o foaie goală)

Netestat în Excel — punct de plecare pentru programator. Numerele zecimale vin cu punct; într-un Excel cu setări
românești poate fi nevoie de conversie (`Val()` sau `Replace`) sau de `format=json`.

```vb
Sub ImportaComanda()
    Dim nr As String: nr = InputBox("Numărul comenzii:")
    If nr = "" Then Exit Sub

    Dim http As Object: Set http = CreateObject("MSXML2.XMLHTTP")
    http.Open "GET", "https://lumina.md/api/registru/comanda/" & nr & "?format=tsv", False
    http.setRequestHeader "X-API-Key", "CHEIA"
    http.send
    If http.Status <> 200 Then
        MsgBox "Eroare " & http.Status & ": " & http.responseText
        Exit Sub
    End If

    Dim lines() As String: lines = Split(Replace(http.responseText, vbCr, ""), vbLf)
    Dim ws As Worksheet: Set ws = ActiveSheet
    ws.Cells.Clear
    Dim r As Long, c As Long, parts() As String
    For r = 0 To UBound(lines)
        If Len(lines(r)) > 0 Then
            parts = Split(lines(r), vbTab)
            For c = 0 To UBound(parts)
                ws.Cells(r + 1, c + 1).Value = parts(c)
            Next c
        End If
    Next r
End Sub
```
