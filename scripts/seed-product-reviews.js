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

const acTexts = [
  "Instalare rapidă și aparatul lucrează foarte silențios. Recomand cu căldură!",
  "Echipa a venit la timp, a montat totul curat și ne-a explicat cum să folosim telecomanda.",
  "Răcește foarte bine pe căldurile mari de vară, sunt mulțumit de alegere.",
  "Am comparat mai multe oferte și aceasta a fost cea mai avantajoasă din punct de vedere preț-calitate.",
  "Tehnicianul a fost foarte profesionist, a verificat și instalația electrică înainte de montaj.",
  "Funcționează excelent, consumul de energie e mult mai mic decât la vechiul aparat.",
  "Sunt încântată de cât de discret arată unitatea interioară, se asortează bine cu mobila.",
  "Livrarea a fost rapidă, iar montajul s-a făcut în aceeași zi.",
  "Recomand! Am avut o experiență foarte bună de la comandă până la instalare.",
  "Aparatul e silențios noaptea, nu ne deranjează somnul deloc.",
  "Bun raport calitate-preț, merge fără probleme de câteva luni bune.",
  "Am apelat la garanție pentru o mică verificare și au răspuns prompt.",
  "Foarte bun pentru un apartament de dimensiuni medii, răcește rapid toată camera.",
  "Mulțumim echipei pentru consultanță, ne-au ajutat să alegem capacitatea corectă pentru cameră.",
  "Aplicația de control de pe telefon este simplă și utilă.",
  "Am instalat acasă și la birou, ambele funcționează impecabil.",
  "Singurul minus a fost timpul de așteptare pentru programare, dar montajul a fost ireproșabil.",
  "Conditionerul e puternic, dar și eficient energetic, exact ce căutam.",
  "Personalul a fost amabil și a răspuns la toate întrebările noastre.",
  "Funcție de încălzire foarte utilă iarna, surpriză plăcută.",
  "Diferența de zgomot față de aparatul vechi este enormă, sunt foarte mulțumit.",
  "Prețul accesoriilor adiționale a fost puțin mai mare decât m-am așteptat, dar per total recomand.",
  "Am ales acest model pe baza recomandării tehnicianului și nu am regretat.",
  "Montaj impecabil, fără mizerie lăsată în casă după instalare.",
  "Foarte bun pentru spațiile mari, am instalat la sediul firmei.",
];

const accessoryTexts = [
  "Calitate bună, exact ce aveam nevoie pentru instalare.",
  "Comandat online, a ajuns rapid și corespunde descrierii.",
  "Tehnicianul ni l-a recomandat și s-a dovedit o alegere bună.",
  "Produs util, simplu de folosit, fără bătaie de cap.",
  "Prețul este corect pentru calitatea oferită.",
  "Am folosit la instalarea aparatului nostru, totul a funcționat perfect.",
  "Livrare rapidă, ambalare îngrijită.",
  "Recomand, face exact ce trebuie.",
  "Material de calitate, rezistent, fără probleme până acum.",
  "Foarte util pentru întreținerea periodică a aparatului.",
];

const prosPool = [
  "Montaj rapid", "Funcționează silențios", "Preț bun", "Telecomandă simplă de utilizat",
  "Răcește foarte rapid", "Aspect modern", "Consum redus de energie", "Garanție extinsă",
  "Echipă punctuală", "Calitate excelentă a materialelor",
];

const consPool = [
  "Manualul de utilizare ar putea fi mai detaliat",
  "Livrarea a durat puțin mai mult decât am sperat",
  "Telecomanda e puțin greu de citit noaptea",
  "Prețul accesoriilor adiționale e cam mare",
  "Zgomotul unității exterioare se simte ușor noaptea",
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

const accessorySlugs = new Set([
  "telecomanda-universala-aer-conditionat",
  "kit-suport-montaj-perete-unitate-exterioara",
  "freon-r32-butelie-1kg",
  "kit-conducte-cupru-izolate-3m",
  "pompa-condens-aer-conditionat",
]);

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  const usedNames = new Set();

  let totalCreated = 0;

  for (const product of products) {
    const isAccessory = product.category?.slug === "accesorii-consumabile" || accessorySlugs.has(product.slug);
    const textsPool = isAccessory ? accessoryTexts : acTexts;

    const existingCount = await prisma.review.count({ where: { product: product.name } });
    const targetCount = Math.floor(Math.random() * 6) + 2; // 2 to 7
    const toCreate = Math.max(0, targetCount - existingCount);

    if (toCreate === 0) continue;

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

    const createdRatings = [];
    for (const name of reviewers) {
      const rating = pick(ratings);
      createdRatings.push(rating);
      await prisma.review.create({
        data: {
          name,
          rating,
          text: pick(textsPool),
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
