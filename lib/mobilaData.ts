// Placeholder listings — swap images/text for real furniture pieces when available.
// Types drive the filter tabs on /mobila.
export type FurnitureType = "birou" | "casa" | "bucatarie" | "comercial";

export const FURNITURE_TYPE_LABELS: Record<FurnitureType, string> = {
  birou: "Birou",
  casa: "Casă",
  bucatarie: "Bucătărie",
  comercial: "Comercial",
};

export interface FurnitureListing {
  slug: string;
  type: FurnitureType;
  title: string;
  price: string;
  material: string;
  leadTime: string;
  image: string;
  description: string;
  characteristics: { label: string; value: string }[];
}

export const furnitureListings: FurnitureListing[] = [
  {
    slug: "birou-conducere-lemn-masiv",
    type: "birou",
    title: "Birou de conducere, lemn masiv",
    price: "De la 8.500 MDL",
    material: "Lemn masiv de stejar",
    leadTime: "3-4 săptămâni",
    image: "https://placehold.co/800x600/9D5654/ffffff?text=Birou+conducere",
    description:
      "Birou executiv din lemn masiv de stejar, cu finisaj natural sau vopsit la alegere, gândit pentru birouri de conducere sau cabinete.",
    characteristics: [
      { label: "Material", value: "Lemn masiv de stejar" },
      { label: "Dimensiuni", value: "160 x 80 x 75 cm (personalizabile)" },
      { label: "Finisaj", value: "Natural sau vopsit, la alegere" },
      { label: "Termen execuție", value: "3-4 săptămâni" },
      { label: "Garanție", value: "24 luni" },
      { label: "Livrare și montaj", value: "Incluse" },
    ],
  },
  {
    slug: "mobilier-open-space-echipa",
    type: "birou",
    title: "Set mobilier open-space pentru echipă",
    price: "De la 3.200 MDL / post de lucru",
    material: "PAL melaminat, structură metalică",
    leadTime: "4-6 săptămâni",
    image: "https://placehold.co/800x600/710808/ffffff?text=Mobilier+open-space",
    description:
      "Birouri modulare pentru spații open-space, gândite pentru echipe de orice dimensiune — configurabile pe unități de 1, 2 sau 4 posturi.",
    characteristics: [
      { label: "Material", value: "PAL melaminat + structură metalică" },
      { label: "Configurație", value: "Module de 1, 2 sau 4 posturi" },
      { label: "Cabluri", value: "Canal cablu integrat" },
      { label: "Termen execuție", value: "4-6 săptămâni" },
      { label: "Garanție", value: "24 luni" },
      { label: "Livrare și montaj", value: "Incluse" },
    ],
  },
  {
    slug: "dulap-dressing-la-comanda",
    type: "casa",
    title: "Dulap dressing la comandă",
    price: "De la 6.000 MDL",
    material: "PAL melaminat + accesorii metalice",
    leadTime: "3-5 săptămâni",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Dulap+dressing",
    description:
      "Dulap dressing proiectat pe măsura spațiului disponibil, cu compartimentare interioară personalizată — sertare, rafturi, bară de haine.",
    characteristics: [
      { label: "Material", value: "PAL melaminat" },
      { label: "Compartimentare", value: "Personalizată — sertare, rafturi, bară haine" },
      { label: "Sistem uși", value: "Batante sau glisante, la alegere" },
      { label: "Termen execuție", value: "3-5 săptămâni" },
      { label: "Garanție", value: "24 luni" },
      { label: "Livrare și montaj", value: "Incluse" },
    ],
  },
  {
    slug: "biblioteca-living-lemn-sticla",
    type: "casa",
    title: "Bibliotecă living, lemn și sticlă",
    price: "De la 4.800 MDL",
    material: "MDF vopsit + panouri de sticlă",
    leadTime: "3-4 săptămâni",
    image: "https://placehold.co/800x600/9D5654/ffffff?text=Biblioteca+living",
    description:
      "Bibliotecă suspendată sau pe sol pentru living, cu rafturi deschise și module cu uși de sticlă, disponibilă în orice dimensiune.",
    characteristics: [
      { label: "Material", value: "MDF vopsit + panouri de sticlă" },
      { label: "Montaj", value: "Suspendată sau pe sol, la alegere" },
      { label: "Iluminare LED", value: "Opțională" },
      { label: "Termen execuție", value: "3-4 săptămâni" },
      { label: "Garanție", value: "24 luni" },
      { label: "Livrare și montaj", value: "Incluse" },
    ],
  },
  {
    slug: "mobila-bucatarie-front-mat",
    type: "bucatarie",
    title: "Mobilă de bucătărie, front mat",
    price: "De la 12.000 MDL",
    material: "PAL rezistent la umiditate + front mat",
    leadTime: "5-6 săptămâni",
    image: "https://placehold.co/800x600/710808/ffffff?text=Bucatarie+front+mat",
    description:
      "Mobilă de bucătărie completă, proiectată pe măsura spațiului, cu fronturi mate și blat la alegere din mai multe finisaje.",
    characteristics: [
      { label: "Material corp", value: "PAL rezistent la umiditate" },
      { label: "Front", value: "Mat, mai multe culori" },
      { label: "Blat", value: "La alegere din mai multe finisaje" },
      { label: "Termen execuție", value: "5-6 săptămâni" },
      { label: "Garanție", value: "24 luni" },
      { label: "Livrare și montaj", value: "Incluse" },
    ],
  },
  {
    slug: "mobilier-showroom-receptie",
    type: "comercial",
    title: "Mobilier showroom / recepție",
    price: "La cerere, în funcție de proiect",
    material: "MDF vopsit + accente metalice",
    leadTime: "4-8 săptămâni",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Showroom+receptie",
    description:
      "Mobilier de recepție, showroom sau spații comerciale — banc de recepție, rafturi de expunere și panouri personalizate cu identitatea vizuală a afacerii tale.",
    characteristics: [
      { label: "Material", value: "MDF vopsit + accente metalice" },
      { label: "Personalizare", value: "Culori și logo, la cerere" },
      { label: "Iluminare LED", value: "Opțională" },
      { label: "Termen execuție", value: "4-8 săptămâni" },
      { label: "Garanție", value: "24 luni" },
      { label: "Livrare și montaj", value: "Incluse" },
    ],
  },
];
