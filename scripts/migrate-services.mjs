/**
 * Migration: Ensure all 6 service pages are linked to DB records.
 * Run once with: node scripts/migrate-services.mjs
 *
 * For each service it will:
 *  1. Find or create the Service record with correct href
 *  2. Seed steps / features / checklist / testimonials if empty
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SERVICES = [
  {
    href: "/servicii/instalare",
    title: "Instalare condiționere",
    description: "Montaj rapid și sigur pentru apartamente, case, birouri și spații comerciale.",
    section: "principale",
    order: 1,
    detailImage: "/IMG_2843.PNG",
    heroImageDesktop: "/IMG_2838.PNG",
    features: [
      { title: "Echipă autorizată", description: "Tehnicieni calificați și mereu la curent cu noile tehnologii.", icon: "award" },
      { title: "Montaj rapid și curat", description: "Respectăm timpul tău și lăsăm spațiul curat după instalare.", icon: "clock" },
      { title: "Garanție inclusă", description: "Oferim garanție pentru manoperă și echipamente.", icon: "shield" },
      { title: "Suport dedicat", description: "Îți suntem alături înainte, în timpul și după instalare.", icon: "support" },
    ],
    checklist: [
      "Consultanță și recomandare personalizată",
      "Montaj efectuat conform standardelor",
      "Verificare completă și testare sistem",
      "Instrucțiuni de utilizare și întreținere",
      "Garanție pentru manoperă și echipamente",
    ],
    steps: [
      { title: "Consultare", description: "Analizăm nevoile tale și îți recomandăm soluția optimă pentru spațiul tău." },
      { title: "Montaj", description: "Echipa noastră realizează instalarea rapid și eficient, cu atenție la fiecare detaliu." },
      { title: "Testare", description: "Verificăm funcționarea și ne asigurăm că totul este perfect." },
    ],
    testimonials: [
      { text: "Servicii excelente! Montajul a fost realizat rapid și foarte curat. Echipa a fost profesionistă și atentă la detalii.", name: "Andrei M.", city: "Chișinău", initials: "AM" },
      { text: "Foarte mulțumit de recomandări și de calitatea lucrării. Aerul condiționat funcționează perfect!", name: "Diana P.", city: "Bălți", initials: "DP" },
      { text: "Comunicare excelentă, preț corect și montaj fără dificultăți. Recomand cu încredere!", name: "Vlad G.", city: "Chișinău", initials: "VG" },
    ],
  },
  {
    href: "/servicii/mentenanta",
    title: "Mentenanță & igienizare",
    description: "Curățare, igienizare și verificare periodică pentru aparate de aer condiționat.",
    section: "principale",
    order: 2,
    detailImage: "/IMG_2839.PNG",
    heroImageDesktop: "/IMG_2848.PNG",
    features: [
      { title: "Tehnicieni certificați", description: "Personal calificat cu experiență în toate brandurile de climatizare.", icon: "award" },
      { title: "Produse profesionale", description: "Folosim soluții de curățare și igienizare certificate și sigure.", icon: "package" },
      { title: "Garanție inclusă", description: "Oferim garanție pentru toate lucrările de mentenanță efectuate.", icon: "shield" },
      { title: "Programare flexibilă", description: "Alegem împreună data și ora care ți se potrivesc cel mai bine.", icon: "calendar" },
    ],
    checklist: [
      "Curățare filtre și schimbător de căldură",
      "Igienizare cu soluții antibacteriene",
      "Verificare și reîncărcare freon",
      "Curățare drenaj și țeavă condensat",
      "Verificare presiune și performanță",
    ],
    steps: [
      { title: "Programare", description: "Alegi data și ora, iar tehnicianul vine la tine acasă la timp." },
      { title: "Inspecție", description: "Verificăm starea aparatelor și identificăm toate problemele existente." },
      { title: "Curățare", description: "Curățăm complet filtrele, schimbătorul de căldură și drenajul." },
    ],
    testimonials: [
      { text: "Curățare impecabilă! Aparatul funcționează mult mai bine acum și consumă mai puțin. Recomand cu drag!", name: "Mihai D.", city: "Chișinău", initials: "MD" },
      { text: "Tehnicianul a fost foarte profesionist și atent. A explicat tot ce a făcut. Serviciu excelent!", name: "Elena R.", city: "Bălți", initials: "ER" },
      { text: "Am un abonament anual și sunt foarte mulțumit. Aparatele mele sunt mereu în stare perfectă.", name: "Ion P.", city: "Chișinău", initials: "IP" },
    ],
  },
  {
    href: "/servicii/diagnosticare",
    title: "Diagnosticare & reparații",
    description: "Identificăm și reparăm rapid orice defecțiune a aparatelor de climatizare.",
    section: "principale",
    order: 3,
    detailImage: "/IMG_2840.PNG",
    heroImageDesktop: "/IMG_2848.PNG",
    features: [
      { title: "Diagnosticare rapidă", description: "Identificăm problema în cel mai scurt timp posibil.", icon: "search" },
      { title: "Piese originale", description: "Folosim exclusiv componente originale sau certificate.", icon: "wrench" },
      { title: "Garanție reparație", description: "Toate reparațiile sunt acoperite de garanție.", icon: "shield" },
      { title: "Suport tehnic", description: "Suntem disponibili pentru orice întrebare după reparație.", icon: "support" },
    ],
    checklist: [
      "Diagnosticare completă a sistemului",
      "Identificare și reparare scurgeri freon",
      "Înlocuire componente defecte",
      "Reparare plăci electronice",
      "Testare după reparație și garanție",
    ],
    steps: [
      { title: "Apel & programare", description: "Ne descrii problema și stabilim împreună o vizită de diagnosticare." },
      { title: "Diagnosticare", description: "Tehnicianul identifică exact cauza defecțiunii și îți prezintă soluția." },
      { title: "Reparație", description: "Reparăm aparatul și îl testăm complet înainte de plecare." },
    ],
    testimonials: [
      { text: "Au reparat aparatul în aceeași zi! Tehnicianul a fost foarte profesionist și a explicat tot ce a făcut.", name: "Radu M.", city: "Chișinău", initials: "RM" },
      { text: "Preț corect și transparență totală. Au prezentat oferta înainte de a începe și au respectat-o.", name: "Ioana S.", city: "Bălți", initials: "IS" },
      { text: "Am sunat dimineața și după-amiaza aparatul funcționa perfect. Recomand cu toată încrederea!", name: "Doru N.", city: "Chișinău", initials: "DN" },
    ],
  },
  {
    href: "/servicii/consultanta",
    title: "Consultanță",
    description: "Îți oferim sfaturi experte pentru alegerea sistemului de climatizare potrivit.",
    section: "principale",
    order: 4,
    detailImage: "/IMG_2841.PNG",
    heroImageDesktop: "/IMG_2848.PNG",
    features: [
      { title: "Experți certificați", description: "Consultanți cu experiență vastă în sisteme de climatizare.", icon: "award" },
      { title: "Recomandare personalizată", description: "Analizăm spațiul tău și propunem soluția optimă pentru nevoile tale.", icon: "search-plus" },
      { title: "Fără costuri ascunse", description: "Consultanța este transparentă, fără obligații sau taxe surpriză.", icon: "shield" },
      { title: "Suport complet", description: "Te ghidăm de la alegerea sistemului până la instalarea finală.", icon: "support" },
    ],
    checklist: [
      "Evaluare gratuită a spațiului tău",
      "Recomandare sistem potrivit bugetului",
      "Comparație modele și eficiență energetică",
      "Estimare costuri instalare și întreținere",
      "Suport în alegerea finală",
    ],
    steps: [
      { title: "Discuție", description: "Ne spui ce nevoi ai și ce buget ai alocat pentru proiect." },
      { title: "Evaluare", description: "Analizăm spațiul și parametrii tehnici necesari pentru sistem." },
      { title: "Recomandare", description: "Îți prezentăm cele mai potrivite soluții, cu prețuri și beneficii." },
    ],
    testimonials: [
      { text: "Consultanța a fost extrem de utilă. Mi-au recomandat exact ce aveam nevoie, fără să mă convingă să cumpăr mai mult.", name: "Radu T.", city: "Chișinău", initials: "RT" },
      { text: "Foarte profesioniști, mi-au explicat clar diferențele dintre modele. Am ales cu încredere!", name: "Cristina M.", city: "Orhei", initials: "CM" },
      { text: "Mulțumesc pentru recomandare, sistemul ales se potrivește perfect spațiului meu.", name: "Sergiu V.", city: "Chișinău", initials: "SV" },
    ],
  },
  {
    href: "/servicii/multisplit",
    title: "Sisteme multisplit",
    description: "Climatizare pentru mai multe camere cu o singură unitate exterioară, eficientă și discretă.",
    section: "avansate",
    order: 1,
    detailImage: "/IMG_2966.PNG",
    heroImageDesktop: "/IMG_2848.PNG",
    features: [
      { title: "O unitate, mai multe camere", description: "Climatizezi întreaga locuință cu o singură unitate exterioară.", icon: "grid" },
      { title: "Control independent", description: "Fiecare cameră are propriul termostat și setări individuale.", icon: "clock-alt" },
      { title: "Eficiență energetică", description: "Consum redus comparativ cu mai multe unități independente.", icon: "bolt" },
      { title: "Montaj estetic", description: "O singură unitate exterioară, fără a încărca fațada clădirii.", icon: "home" },
    ],
    checklist: [
      "Consultanță pentru numărul de camere",
      "Montaj unitate exterioară și interioare",
      "Configurare control individual pe cameră",
      "Testare completă a sistemului",
      "Garanție pentru manoperă și echipamente",
    ],
    steps: [
      { title: "Evaluare", description: "Stabilim numărul de camere și capacitatea necesară pentru sistem." },
      { title: "Montaj", description: "Instalăm unitatea exterioară și unitățile interioare în fiecare cameră." },
      { title: "Configurare", description: "Setăm controlul individual și testăm funcționarea fiecărei zone." },
    ],
    testimonials: [
      { text: "Soluția multisplit a fost perfectă pentru apartamentul nostru. Doar o unitate exterioară și toate camerele climatizate!", name: "Tatiana B.", city: "Chișinău", initials: "TB" },
      { text: "Montaj rapid, fără bătăi de cap. Fiecare cameră are temperatura ei, exact cum voiam.", name: "Igor C.", city: "Bălți", initials: "IC" },
      { text: "Recomand cu încredere sistemele multisplit, mai ales pentru case cu mai multe camere.", name: "Natalia S.", city: "Chișinău", initials: "NS" },
    ],
  },
  {
    href: "/servicii/comerciale",
    title: "Soluții comerciale",
    description: "Sisteme HVAC pentru birouri, hale industriale și spații comerciale de orice dimensiune.",
    section: "avansate",
    order: 2,
    detailImage: "/IMG_2842.PNG",
    heroImageDesktop: "/IMG_2848.PNG",
    features: [
      { title: "Capacități mari", description: "Sisteme dimensionate pentru spații comerciale, hale și birouri.", icon: "building" },
      { title: "Proiectare personalizată", description: "Calcul de sarcină termică și soluție adaptată clădirii tale.", icon: "blueprint" },
      { title: "Mentenanță programată", description: "Contracte de service pentru funcționare continuă, fără pauze.", icon: "clock-alt" },
      { title: "Echipă specializată", description: "Tehnicieni autorizați pentru instalații comerciale complexe.", icon: "users" },
    ],
    checklist: [
      "Evaluare tehnică a spațiului comercial",
      "Proiectare sistem HVAC personalizat",
      "Montaj de către echipă specializată",
      "Punere în funcțiune și testare completă",
      "Contract de mentenanță disponibil",
    ],
    steps: [
      { title: "Audit tehnic", description: "Evaluăm spațiul, sarcina termică și cerințele specifice afacerii tale." },
      { title: "Proiectare", description: "Concepem soluția HVAC optimă pentru clădire, birou sau hală." },
      { title: "Implementare", description: "Montăm și punem în funcțiune sistemul, cu testare completă." },
    ],
    testimonials: [
      { text: "Au proiectat și montat sistemul HVAC pentru biroul nostru de 300mp fără nicio problemă. Echipă foarte profesionistă.", name: "Andrei P.", city: "Chișinău", initials: "AP" },
      { text: "Sistem comercial montat în hala noastră de producție, funcționează impecabil de la instalare.", name: "Olesea D.", city: "Bălți", initials: "OD" },
      { text: "Contractul de mentenanță ne-a scutit de bătăi de cap, totul e verificat periodic.", name: "Mihai R.", city: "Chișinău", initials: "MR" },
    ],
  },
];

async function run() {
  console.log("Starting service migration...\n");

  for (const svc of SERVICES) {
    console.log(`Processing: ${svc.href}`);

    // 1. Find or create the Service record
    let service = await prisma.service.findFirst({ where: { href: svc.href } });

    if (!service) {
      // Try to find by title (might exist without href)
      service = await prisma.service.findFirst({ where: { title: svc.title } });
      if (service) {
        // Update existing record to add/fix href and images
        service = await prisma.service.update({
          where: { id: service.id },
          data: {
            href: svc.href,
            section: svc.section,
            order: svc.order,
            detailImage: service.detailImage ?? svc.detailImage,
            heroImageDesktop: service.heroImageDesktop ?? svc.heroImageDesktop,
          },
        });
        console.log(`  → Updated existing service (added href)`);
      } else {
        // Create new
        service = await prisma.service.create({
          data: {
            title: svc.title,
            description: svc.description,
            section: svc.section,
            order: svc.order,
            href: svc.href,
            detailImage: svc.detailImage,
            heroImageDesktop: svc.heroImageDesktop,
          },
        });
        console.log(`  → Created new service record`);
      }
    } else {
      console.log(`  → Found existing service record`);
    }

    const id = service.id;

    // 2. Seed steps if empty
    const stepsCount = await prisma.serviceStep.count({ where: { serviceId: id } });
    if (stepsCount === 0) {
      await prisma.serviceStep.createMany({
        data: svc.steps.map((s, i) => ({ serviceId: id, order: i + 1, title: s.title, description: s.description })),
      });
      console.log(`  → Created ${svc.steps.length} steps`);
    } else {
      console.log(`  → Steps already exist (${stepsCount}), skipping`);
    }

    // 3. Seed features if empty
    const featuresCount = await prisma.serviceFeature.count({ where: { serviceId: id } });
    if (featuresCount === 0) {
      await prisma.serviceFeature.createMany({
        data: svc.features.map((f, i) => ({ serviceId: id, order: i + 1, title: f.title, description: f.description, icon: f.icon })),
      });
      console.log(`  → Created ${svc.features.length} features`);
    } else {
      console.log(`  → Features already exist (${featuresCount}), skipping`);
    }

    // 4. Seed checklist if empty
    const checklistCount = await prisma.serviceChecklistItem.count({ where: { serviceId: id } });
    if (checklistCount === 0) {
      await prisma.serviceChecklistItem.createMany({
        data: svc.checklist.map((text, i) => ({ serviceId: id, order: i + 1, text })),
      });
      console.log(`  → Created ${svc.checklist.length} checklist items`);
    } else {
      console.log(`  → Checklist already exists (${checklistCount}), skipping`);
    }

    // 5. Seed testimonials if empty
    const testimonialsCount = await prisma.serviceTestimonial.count({ where: { serviceId: id } });
    if (testimonialsCount === 0) {
      await prisma.serviceTestimonial.createMany({
        data: svc.testimonials.map((t, i) => ({ serviceId: id, order: i + 1, ...t })),
      });
      console.log(`  → Created ${svc.testimonials.length} testimonials`);
    } else {
      console.log(`  → Testimonials already exist (${testimonialsCount}), skipping`);
    }

    console.log();
  }

  console.log("Migration complete.");
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
