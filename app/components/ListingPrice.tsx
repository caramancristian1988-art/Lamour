// Prețul afișat al unei oferte de mobilă / spațiu comercial. Adminul îl scrie liber („De la 8.500 MDL”, „350 €/lună”,
// „De la 3.200 MDL / post de lucru”, „La cerere, în funcție de proiect”), iar pe un card de telefon (~170 px lățime) un
// șir lung se rupea în 3 rânduri, în locuri întâmplătoare. Aici îl despărțim în părți când forma se recunoaște — „De la”,
// suma (nu se rupe niciodată) și „/ unitatea” —, iar pe mobil le punem pe rânduri fixe; pe ecran mare rămâne pe un rând, ca înainte.
// Ce nu se recunoaște (fără cifră) se afișează ca text obișnuit.

interface PriceParts {
  prefix: string;
  main: string;
  suffix: string;
}

function splitPriceLabel(label: string): PriceParts | null {
  const text = label.trim();
  const from = text.match(/^(de la|începând de la|incepand de la)\s+(.+)$/i);
  const prefix = from ? from[1] : "";
  const rest = from ? from[2] : text;
  const withUnit = rest.match(/^([^/]*\d[^/]*?)\s*(\/.+)$/);
  const main = withUnit ? withUnit[1].trim() : rest;
  if (!/\d/.test(main)) return null;
  return { prefix, main, suffix: withUnit ? withUnit[2].trim() : "" };
}

export default function ListingPrice({ label, className = "" }: { label: string; className?: string }) {
  const parts = splitPriceLabel(label);

  if (!parts) {
    return <p className={`text-sm sm:text-lg font-bold leading-snug text-primary ${className}`}>{label}</p>;
  }

  return (
    <p className={`text-primary ${className}`}>
      {parts.prefix && (
        <span className="block text-[11px] font-semibold leading-tight text-muted-foreground sm:inline sm:text-lg sm:font-bold sm:text-primary">
          {parts.prefix.charAt(0).toUpperCase() + parts.prefix.slice(1)}{" "}
        </span>
      )}
      <span className="whitespace-nowrap text-lg font-bold leading-tight">{parts.main}</span>
      {parts.suffix && (
        <span className="block text-[11px] font-semibold leading-tight text-muted-foreground sm:ml-1 sm:inline sm:text-sm">
          {parts.suffix}
        </span>
      )}
    </p>
  );
}
