const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const names = [
  "Ion Ceban", "Maria Rusu", "Andrei Popa", "Elena Moraru", "Vasile Guțu",
  "Cristina Lungu", "Dumitru Rotaru", "Ana Bostan", "Mihai Crețu", "Olga Sandu",
  "Vladimir Tarlev", "Natalia Ciobanu", "Sergiu Vrabie", "Tatiana Marin", "Igor Balan",
  "Daniela Postolache", "Victor Ungureanu", "Liliana Burlacu", "Radu Cojocaru", "Ecaterina Pleșca",
  "Nicolae Dragan", "Veronica Stratan", "Pavel Negru", "Diana Tomescu", "Gheorghe Sîrbu",
  "Alina Cazac", "Ruslan Botnari", "Carolina Iordan", "Ștefan Mustea", "Larisa Caraman",
  "Vitalie Robu", "Galina Ursu", "Anatol Pascari", "Doina Severin", "Constantin Brânză",
  "Irina Lupu", "Boris Tofan", "Svetlana Donică", "Eugen Căpățînă", "Tamara Vacarciuc",
];

// Residential wall-split units (the large majority of products)
const residentialTexts = [
  "Instalare rapidă și aparatul lucrează foarte silențios. Recomand cu căldură!",
  "Echipa a venit la timp, a montat totul curat și ne-a explicat cum să folosim telecomanda.",
  "Răcește foarte bine pe căldurile mari de vară, sunt mulțumit de alegere.",
  "Am comparat mai multe oferte și acest model a fost cel mai avantajos din punct de vedere preț-calitate.",
  "Tehnicianul a fost foarte profesionist, a verificat și instalația electrică înainte de montaj.",
  "Funcționează excelent, consumul de energie e mult mai mic decât la vechiul aparat.",
  "Sunt încântată de cât de discret arată unitatea interioară, se asortează bine cu mobila din dormitor.",
  "Livrarea a fost rapidă, iar montajul s-a făcut în aceeași zi.",
  "Recomand! Am avut o experiență foarte bună de la comandă până la instalare.",
  "Aparatul e silențios noaptea, nu ne deranjează somnul deloc.",
  "Bun raport calitate-preț, merge fără probleme de câteva luni bune.",
  "Foarte bun pentru un apartament de dimensiuni medii, răcește rapid toată camera.",
  "Mulțumim echipei pentru consultanță, ne-au ajutat să alegem capacitatea corectă pentru cameră.",
  "Aplicația de control de pe telefon este simplă și utilă.",
  "Diferența de zgomot față de aparatul vechi este enormă, sunt foarte mulțumit.",
  "Am ales acest model pe baza recomandării tehnicianului și nu am regretat.",
  "Montaj impecabil, fără mizerie lăsată în casă după instalare.",
  "Funcție de încălzire foarte utilă iarna, surpriză plăcută.",
  "Personalul a fost amabil și a răspuns la toate întrebările noastre legate de garanție.",
  "Telecomanda e intuitivă, iar afișajul se vede bine și noaptea.",
];

const portableTexts = [
  "Util pentru o cameră în care nu se poate monta o unitate exterioară. Funcționează bine!",
  "L-am cumpărat pentru birou, e ușor de deplasat dintr-o încăpere în alta cu rotilele.",
  "Furtunul de evacuare e simplu de instalat la geam, nu necesită montaj profesional.",
  "Răcește decent o cameră medie, dar e mai gălăgios decât un split clasic — la care mă așteptam.",
  "Bun pentru chirie, unde nu pot monta o unitate exterioară fixă.",
  "Rezervorul de condens trebuie golit destul de des, dar per total sunt mulțumit.",
  "Perfect ca soluție temporară pe timpul verii, ușor de depozitat iarna.",
  "Simplu de pus în funcțiune, fără nevoie de tehnician la instalare.",
];

const commercialTexts = [
  "Montat în showroom-ul nostru, distribuie aerul uniform pe toată sala.",
  "Echipa a instalat caseta de tavan fără să afecteze activitatea din birou, lucru rapid și ordonat.",
  "Soluție discretă pentru spațiu comercial, nu se vede aproape deloc de la nivelul tavanului fals.",
  "Putere suficientă pentru sala noastră de evenimente, recomand pentru spații comerciale.",
  "Mentenanța anuală prin Climat Rapid a confirmat că totul funcționează la capacitate maximă.",
  "Investiție bună pentru birou, angajații sunt mult mai confortabili pe timp de vară.",
];

const multisplitTexts = [
  "O singură unitate exterioară pentru tot apartamentul — exact ce căutam, fără bătaie de cap cu autorizațiile.",
  "Fiecare cameră are propriul termostat, foarte comod pentru familia noastră.",
  "Montaj de o zi pentru toate unitățile interioare, echipa a fost foarte organizată.",
  "Soluție elegantă pentru bloc, fațada rămâne curată cu o singură unitate exterioară.",
  "Funcționează silențios în toate camerele, suntem foarte mulțumiți de alegere.",
];

const accessoryReviewSets = {
  "telecomanda-universala-ac": [
    "Funcționează perfect cu aparatul nostru vechi, pentru care nu mai aveam telecomanda originală.",
    "Configurarea a fost simplă, am urmat instrucțiunile și a funcționat din prima.",
    "Butoanele sunt clare, iar afișajul se vede bine și pe lumină puternică.",
    "Bună alternativă la telecomanda originală pierdută, raport calitate-preț excelent.",
    "Semnalul are o rază bună de acțiune, funcționează fără probleme din toată camera.",
    "Bateriile țin mult, nu am avut nevoie să le schimb de câteva luni.",
  ],
  "suport-montaj-unitate-exterioara": [
    "Robust și stabil, unitatea exterioară nu vibrează deloc după montaj.",
    "Tehnicianul a folosit acest kit la instalare, zice că e de calitate superioară celor ieftine.",
    "Ușor de montat pe perete, găurile sunt exact la distanța standard.",
    "Rezistă bine la intemperii, l-am montat de aproape un an și nu prezintă rugină.",
    "Susține bine unitatea exterioară, fără zgomote sau mișcări pe timp de vânt.",
  ],
  "freon-r32-1kg": [
    "Tehnicianul a folosit această butelie pentru reîncărcarea aparatului, calitate bună a gazului.",
    "Butelie sigilată corect, exact cantitatea descrisă, fără probleme la încărcare.",
    "Recomand pentru recondiționarea aparatelor mai vechi care au nevoie de gaz suplimentar.",
    "Am folosit-o la mentenanța anuală, aparatul a revenit la performanța inițială.",
  ],
  "kit-conducte-cupru-izolate-3m": [
    "Izolația e groasă și de calitate, nu am avut condens pe conducte după instalare.",
    "Ușor de îndoit la montaj, s-a potrivit perfect pe traseul nostru până la unitatea exterioară.",
    "Cuprul e de calitate, fără urme de oxidare după câteva luni de utilizare.",
    "Setul a fost suficient pentru toată distanța dintre unități, nu a fost nevoie de prelungire.",
  ],
  "pompa-condens-ac": [
    "Funcționează silențios, nu mai avem probleme cu scurgerile de apă de la aparat.",
    "Montată ușor de tehnician, evacuează constant condensul fără înfundări.",
    "Soluție bună pentru aparatul montat fără acces direct la o conductă de scurgere.",
    "Fiabilă, funcționează fără probleme de câteva luni, fără zgomote deranjante.",
  ],
};

const acProsPool = [
  "Montaj rapid", "Funcționează silențios", "Preț bun", "Telecomandă simplă de utilizat",
  "Răcește foarte rapid", "Aspect modern", "Consum redus de energie", "Garanție extinsă",
  "Echipă punctuală",
];

const acConsPool = [
  "Manualul de utilizare ar putea fi mai detaliat",
  "Livrarea a durat puțin mai mult decât am sperat",
  "Telecomanda e puțin greu de citit noaptea",
  "Zgomotul unității exterioare se simte ușor noaptea",
];

const accessoryProsPool = [
  "Preț bun", "Calitate excelentă a materialelor", "Livrare rapidă", "Ușor de montat", "Compatibil cu mai multe modele",
];

const accessoryConsPool = [
  "Manualul de utilizare ar putea fi mai detaliat",
  "Livrarea a durat puțin mai mult decât am sperat",
  "Ambalajul putea fi mai rezistent",
];

const ratings = [5, 5, 5, 4.5, 5, 4, 5, 4, 4.5, 3.5, 5, 4, 5, 3];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinLastMonths(months) {
  const now = Date.now();
  const past = now - months * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function textsForProduct(product) {
  if (accessoryReviewSets[product.slug]) return accessoryReviewSets[product.slug];
  switch (product.category?.slug) {
    case "conditioane-portabile":
      return portableTexts;
    case "conditioane-comerciale":
      return commercialTexts;
    case "sisteme-multisplit":
      return multisplitTexts;
    default:
      return residentialTexts;
  }
}

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  const usedNames = new Set();
  let totalCreated = 0;

  for (const product of products) {
    const textsPool = textsForProduct(product);
    const isAccessory = Boolean(accessoryReviewSets[product.slug]);
    const prosPool = isAccessory ? accessoryProsPool : acProsPool;
    const consPool = isAccessory ? accessoryConsPool : acConsPool;

    const existingCount = await prisma.review.count({ where: { product: product.name } });
    const targetCount = Math.floor(Math.random() * 6) + 2; // 2 to 7
    const toCreate = Math.max(0, targetCount - existingCount);
    if (toCreate === 0) continue;

    const shuffledTexts = [...textsPool].sort(() => Math.random() - 0.5);
    const reviewers = [];
    let attempts = 0;
    while (reviewers.length < toCreate && attempts < 200) {
      const candidate = pick(names);
      const key = `${product.id}:${candidate}`;
      if (!usedNames.has(key)) {
        usedNames.add(key);
        reviewers.push(candidate);
      }
      attempts++;
    }

    for (let i = 0; i < reviewers.length; i++) {
      const name = reviewers[i];
      const rating = pick(ratings);
      const text = shuffledTexts[i % shuffledTexts.length];
      await prisma.review.create({
        data: {
          name,
          rating,
          text,
          pros: Math.random() < 0.4 ? pick(prosPool) : null,
          cons: Math.random() < 0.2 ? pick(consPool) : null,
          product: product.name,
          approved: true,
          createdAt: randomDateWithinLastMonths(8),
        },
      });
      totalCreated++;
    }

    const allReviews = await prisma.review.findMany({ where: { product: product.name } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.product.update({
      where: { id: product.id },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length },
    });
  }

  console.log(`✔ Create ${totalCreated} recenzii noi pentru ${products.length} produse.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
