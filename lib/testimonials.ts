// Mărturii publice de pe pagina de Facebook LuminTehnica, afișate alături de recenziile din magazin
// (fără stele — sunt comentarii, nu evaluări). Pentru recenzii cu stele, folosiți /admin/recenzii.
export interface FacebookTestimonial {
  id: string;
  author: string;
  /** Textul comentariului (folosit și ca text alternativ când există captura de ecran). */
  text: string;
  /** Captura de ecran a comentariului, din public/comentarii/ — dacă lipsește, se afișează cardul cu text. */
  image?: { src: string; width: number; height: number };
}

export const facebookTestimonials: FacebookTestimonial[] = [
  {
    id: "fb-lac-gel-cosmetologie",
    author: "Lac Gel Cosmetologie",
    text: "Bravo pentru curajul acestor oameni, care fac o muncă deloc ușoară. Ne mândrim cu voi ❤️ Bravo sunteți un exemplu pentru ceilalți! Apreciem munca voastră!",
    image: { src: "/comentarii/lac-gel-cosmetologie.png", width: 849, height: 210 },
  },
  {
    id: "fb-catalina-croitoru",
    author: "Cătălina Croitoru",
    text: "Personal am procurat dela ei produse și Sint calitate superbă recomand . și mă adresez la toți prietenii mei din profil ca să distribuim la toți prietenii noștri pentru ai ajuta să afle de ei",
  },
  {
    id: "fb-veronica-viorica",
    author: "Veronica Viorica",
    text: "Ceia ce am observat la acel rulou are imprimant inima pe el, asa ca dragi barbați vine ziua indragostițiilor faceți cadou femeilor ca este util si plus un ajutor acestor persoane.",
  },
  {
    id: "fb-dina-bodiu-jomiru",
    author: "Dina N Bodiu Jomiru",
    text: "Veronica Viorica anul imprejur trebuie să fie așa atmosfera, nu numai într-o zi anume..",
  },
];
