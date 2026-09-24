// Validări ușoare pentru datele de livrare la checkout — suficient de
// permisive să nu blocheze clienți reali, dar să prindă evident-greșit
// (text în loc de telefon, cod poștal cu prea multe/puține cifre) înainte
// să ajungă comanda la curier.

// Acceptă orice combinație rezonabilă: cu/fără prefix de țară (+373/373),
// cu/fără 0 inițial, cu spații/paranteze/liniuțe — doar numărul de cifre
// contează, nu formatarea exactă.
export function isValidMoldovanPhone(raw: string): boolean {
  const digitsOnly = raw.replace(/\D/g, "");
  if (/^373\d{8}$/.test(digitsOnly)) return true;
  if (/^0?\d{8}$/.test(digitsOnly)) return true;
  return false;
}

// EVS respinge emailurile fără domeniu complet ("nume@gmail", "nume@localhost" — testat direct pe API), dar
// <input type="email"> din browser le acceptă. Fără asta, o greșeală frecventă de tastare ("...@gmail" fără .com)
// lăsa comanda să se confirme, iar AWB-ul nu se mai crea.
export function isValidCourierEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

// EVS Express cere ZIP în format "XXXX" (4 cifre) — confirmat direct de API
// ("Invalid chars count: ...ZIP" pentru orice altă lungime).
export function isValidPostalCode(raw: string): boolean {
  return /^\d{4}$/.test(raw.trim());
}
