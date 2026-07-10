// Placeholder listings — swap images/text for real spaces when available.
// Types drive the filter tabs on /spatii-comerciale.
export type SpaceType = "apartament" | "spatiu-comercial" | "birou" | "depozit";

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  apartament: "Apartament",
  "spatiu-comercial": "Spațiu comercial",
  birou: "Birou",
  depozit: "Depozit",
};

export interface SpaceListing {
  slug: string;
  type: SpaceType;
  title: string;
  price: string;
  area: string;
  location: string;
  image: string;
  description: string;
  characteristics: { label: string; value: string }[];
}

export const spaceListings: SpaceListing[] = [
  {
    slug: "apartament-2-camere-centru",
    type: "apartament",
    title: "Apartament 2 camere, zona Centru",
    price: "350 €/lună",
    area: "62 m²",
    location: "Chișinău, sector Centru",
    image: "https://placehold.co/800x600/9D5654/ffffff?text=Apartament+Centru",
    description:
      "Apartament luminos cu 2 camere, renovat recent, situat central, aproape de transport public și zone comerciale.",
    characteristics: [
      { label: "Suprafață", value: "62 m²" },
      { label: "Camere", value: "2" },
      { label: "Etaj", value: "4 din 9" },
      { label: "Stare", value: "Renovat" },
      { label: "Parcare", value: "Da" },
      { label: "Disponibilitate", value: "Imediată" },
    ],
  },
  {
    slug: "apartament-3-camere-botanica",
    type: "apartament",
    title: "Apartament 3 camere, Botanica",
    price: "420 €/lună",
    area: "84 m²",
    location: "Chișinău, sector Botanica",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Apartament+Botanica",
    description:
      "Apartament spațios cu 3 camere, ideal pentru familii, în apropierea parcurilor și instituțiilor de învățământ.",
    characteristics: [
      { label: "Suprafață", value: "84 m²" },
      { label: "Camere", value: "3" },
      { label: "Etaj", value: "2 din 5" },
      { label: "Stare", value: "Bună" },
      { label: "Parcare", value: "Da" },
      { label: "Disponibilitate", value: "Din luna viitoare" },
    ],
  },
  {
    slug: "spatiu-comercial-strada-stefan-cel-mare",
    type: "spatiu-comercial",
    title: "Spațiu comercial, Ștefan cel Mare",
    price: "1200 €/lună",
    area: "140 m²",
    location: "Chișinău, bd. Ștefan cel Mare",
    image: "https://placehold.co/800x600/710808/ffffff?text=Spatiu+Comercial",
    description:
      "Spațiu comercial la stradă, vitrină generoasă, potrivit pentru magazin, showroom sau servicii.",
    characteristics: [
      { label: "Suprafață", value: "140 m²" },
      { label: "Vitrină stradă", value: "Da" },
      { label: "Etaj", value: "Parter" },
      { label: "Utilități", value: "Toate incluse" },
      { label: "Parcare", value: "Limitată" },
      { label: "Disponibilitate", value: "Imediată" },
    ],
  },
  {
    slug: "spatiu-comercial-mall",
    type: "spatiu-comercial",
    title: "Spațiu comercial în complex, zona Râșcani",
    price: "900 €/lună",
    area: "95 m²",
    location: "Chișinău, sector Râșcani",
    image: "https://placehold.co/800x600/9D5654/ffffff?text=Spatiu+Rascani",
    description:
      "Spațiu comercial într-un complex cu trafic ridicat, potrivit pentru retail sau food service.",
    characteristics: [
      { label: "Suprafață", value: "95 m²" },
      { label: "Trafic zonă", value: "Ridicat" },
      { label: "Etaj", value: "Parter" },
      { label: "Utilități", value: "Toate incluse" },
      { label: "Parcare", value: "Da, amplă" },
      { label: "Disponibilitate", value: "Imediată" },
    ],
  },
  {
    slug: "birou-open-space-centru",
    type: "birou",
    title: "Birou open-space, zona Centru",
    price: "800 €/lună",
    area: "110 m²",
    location: "Chișinău, sector Centru",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Birou+Centru",
    description:
      "Spațiu de birouri modern, layout open-space, pretabil pentru echipe de 10-15 persoane.",
    characteristics: [
      { label: "Suprafață", value: "110 m²" },
      { label: "Posturi de lucru", value: "~14" },
      { label: "Etaj", value: "6 din 8" },
      { label: "Climatizare", value: "Da" },
      { label: "Parcare", value: "Da" },
      { label: "Disponibilitate", value: "Din luna viitoare" },
    ],
  },
  {
    slug: "depozit-industrial-zona-periferica",
    type: "depozit",
    title: "Depozit industrial, zonă periferică",
    price: "5 €/m²/lună",
    area: "600 m²",
    location: "Chișinău, zona industrială",
    image: "https://placehold.co/800x600/710808/ffffff?text=Depozit",
    description:
      "Spațiu de depozitare cu acces facil pentru camioane, înălțime utilă mare, potrivit pentru stocare sau mică producție.",
    characteristics: [
      { label: "Suprafață", value: "600 m²" },
      { label: "Înălțime utilă", value: "6 m" },
      { label: "Acces camioane", value: "Da, rampă" },
      { label: "Birouri incluse", value: "40 m²" },
      { label: "Pază", value: "24/7" },
      { label: "Disponibilitate", value: "Imediată" },
    ],
  },
];
