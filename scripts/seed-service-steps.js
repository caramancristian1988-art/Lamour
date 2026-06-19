const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const stepsByTitle = {
  "Instalare condiționere": [
    { title: "Consultare", description: "Analizăm nevoile tale și îți recomandăm soluția optimă pentru spațiul tău.", image: "/IMG_2838.PNG" },
    { title: "Montaj", description: "Echipa noastră realizează instalarea rapid și eficient, cu atenție la fiecare detaliu.", image: "/IMG_2839.PNG" },
    { title: "Testare", description: "Verificăm funcționarea și ne asigurăm că totul este perfect.", image: "/IMG_2840.PNG" },
  ],
  "Mentenanță & curățare": [
    { title: "Programare", description: "Alegi data și ora, iar tehnicianul vine la tine acasă la timp.", image: "/IMG_2839.PNG" },
    { title: "Inspecție", description: "Verificăm starea aparatelor și identificăm toate problemele existente.", image: "/IMG_2848.PNG" },
    { title: "Curățare", description: "Curățăm complet filtrele, schimbătorul de căldură și drenajul.", image: "/IMG_2840.PNG" },
  ],
  "Reparații": [
    { title: "Apel & programare", description: "Ne descrii problema și stabilim împreună o vizită de diagnosticare.", image: "/IMG_2838.PNG" },
    { title: "Diagnosticare", description: "Tehnicianul identifică exact cauza defecțiunii și îți prezintă soluția.", image: "/IMG_2840.PNG" },
    { title: "Reparație", description: "Reparăm aparatul și îl testăm complet înainte de plecare.", image: "/IMG_2848.PNG" },
  ],
  "Consultanță": [
    { title: "Discuție", description: "Ne spui ce nevoi ai și ce buget ai alocat pentru proiect.", image: "/IMG_2841.PNG" },
    { title: "Evaluare", description: "Analizăm spațiul și parametrii tehnici necesari pentru sistem.", image: "/IMG_2848.PNG" },
    { title: "Recomandare", description: "Îți prezentăm cele mai potrivite soluții, cu prețuri și beneficii.", image: "/IMG_2840.PNG" },
  ],
  "Sisteme multisplit": [
    { title: "Evaluare", description: "Stabilim numărul de camere și capacitatea necesară pentru sistem.", image: "/IMG_2843.PNG" },
    { title: "Montaj", description: "Instalăm unitatea exterioară și unitățile interioare în fiecare cameră.", image: "/IMG_2839.PNG" },
    { title: "Configurare", description: "Setăm controlul individual și testăm funcționarea fiecărei zone.", image: "/IMG_2840.PNG" },
  ],
  "Sisteme comerciale HVAC": [
    { title: "Audit tehnic", description: "Evaluăm spațiul, sarcina termică și cerințele specifice afacerii tale.", image: "/IMG_2842.PNG" },
    { title: "Proiectare", description: "Concepem soluția HVAC optimă pentru clădire, birou sau hală.", image: "/IMG_2839.PNG" },
    { title: "Implementare", description: "Montăm și punem în funcțiune sistemul, cu testare completă.", image: "/IMG_2840.PNG" },
  ],
};

async function main() {
  for (const [title, steps] of Object.entries(stepsByTitle)) {
    const service = await prisma.service.findFirst({ where: { title } });
    if (!service) {
      console.log(`Serviciul "${title}" nu a fost găsit, sar peste.`);
      continue;
    }

    const existing = await prisma.serviceStep.count({ where: { serviceId: service.id } });
    if (existing > 0) {
      console.log(`"${title}" are deja ${existing} pași, sar peste.`);
      continue;
    }

    for (let i = 0; i < steps.length; i++) {
      await prisma.serviceStep.create({
        data: { serviceId: service.id, order: i, ...steps[i] },
      });
    }
    console.log(`"${title}": ${steps.length} pași adăugați.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
