// Comentarii publice de pe pagina de Facebook LuminTehnica, afișate pe prima pagină ca CAPTURI DE ECRAN
// (inspiră mai multă încredere decât un text rescris). Fiecare intrare = o captură din public/comentarii/.
//
// Ca să adaugi un comentariu: pune captura în public/comentarii/<autor>.png și adaugă mai jos o intrare cu
// `image` (dimensiunile reale ale fișierului) și `text` = transcrierea comentariului (text alternativ pentru
// cititoarele de ecran). Aceeași captură nu se pune de două ori — o discuție cu răspuns e o singură captură.
export interface FacebookTestimonial {
  id: string;
  author: string;
  /** Transcrierea comentariului (inclusiv răspunsul, dacă apare în captură) — folosită ca text alternativ. */
  text: string;
  image: { src: string; width: number; height: number };
}

export const facebookTestimonials: FacebookTestimonial[] = [
  {
    id: "fb-lac-gel-cosmetologie",
    author: "Lac Gel Cosmetologie",
    text: "Bravo pentru curajul acestor oameni, care fac o muncă deloc ușoară. Ne mândrim cu voi ❤️ Bravo sunteți un exemplu pentru ceilalți! Apreciem munca voastră!",
    image: { src: "/comentarii/lac-gel-cosmetologie.png", width: 849, height: 210 },
  },
  {
    id: "fb-veronica-viorica",
    author: "Veronica Viorica",
    text: "Ceia ce am observat la acel rulou are imprimant inima pe el, asa ca dragi barbați vine ziua indragostițiilor faceți cadou femeilor ca este util si plus un ajutor acestor persoane. (Răspuns, Dina N Bodiu Jomiru: Veronica Viorica anul imprejur trebuie să fie așa atmosfera, nu numai într-o zi anume..)",
    image: { src: "/comentarii/veronica-viorica.png", width: 1020, height: 282 },
  },
  {
    id: "fb-bianca-rusu",
    author: "Bianca Rusu",
    text: "Recomand produsele confecționate de persoanele nevăzătoare",
    image: { src: "/comentarii/bianca-rusu.png", width: 1017, height: 147 },
  },
  {
    id: "fb-alexandr-plan",
    author: "Alexandr Plan",
    text: "El nu vede și oricum se bucură de viață, zâmbește, noi avem totul dar nu prețuim, bravo. (Răspuns, Natalia Ciuperco: Adevarat! Acesti oameni sint minunati! Ii respect enorm! Cred ca Dumnezeu i-a trimis sa ne invate bunatatea, empatia...)",
    image: { src: "/comentarii/alexandr-plan.png", width: 1003, height: 270 },
  },
  {
    id: "fb-catalina-croitoru",
    author: "Cătălina Croitoru",
    text: "Personal am procurat dela ei produse și Sint calitate superbă recomand . și mă adresez la toți prietenii mei din profil ca să distribuim la toți prietenii noștri pentru ai ajuta să afle de ei",
    image: { src: "/comentarii/catalina-croitoru.png", width: 1033, height: 172 },
  },
  {
    id: "fb-veceslav-cebotchevici",
    author: "Veceslav Cebotchevici",
    text: "Bravo Moldova, foarte bine că mai suntem uniți și putem sa ne mobilizăm la ceva bun, sper mult să se alăture și rețelele de magazine mari... (Răspuns, Vitalie Ciubrei: un autocolant „Like”)",
    image: { src: "/comentarii/veceslav-cebotchevici.png", width: 1014, height: 373 },
  },
];
