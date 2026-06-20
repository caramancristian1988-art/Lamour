const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const products = [
  { name: "Daikin Sensira FTXF35E", slug: "daikin-sensira-ftxf35e", description: "Condiționer inverter eficient și silențios.", price: 12999, oldPrice: 14500, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Daikin+Sensira", btu: 12000, inverter: true, energyClass: "A++", rating: 4.8, reviewCount: 24, badge: "A++" },
  { name: "Gree Pular GWH12AGC", slug: "gree-pular-gwh12agc", description: "Condiționer cu design elegant și consum redus de energie.", price: 10499, oldPrice: 11999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Gree+Pular", btu: 12000, inverter: true, energyClass: "A++", rating: 4.7, reviewCount: 18, badge: "-10%" },
  { name: "Mitsubishi Electric MSZ-HR35VF", slug: "mitsubishi-electric-msz-hr35vf", description: "Performanță superioară și fiabilitate dovedită.", price: 13999, oldPrice: null, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Mitsubishi", btu: 12000, inverter: true, energyClass: "A++", rating: 4.9, reviewCount: 31, badge: null },
  { name: "LG DualCool PC12SQ", slug: "lg-dualcool-pc12sq", description: "Condiționer inverter cu filtrare avansată a aerului.", price: 9999, oldPrice: 12500, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=LG+DualCool", btu: 12000, inverter: true, energyClass: "A++", rating: 4.6, reviewCount: 19, badge: "-20%" },
  { name: "Samsung WindFree AR12TXFCAWKNEU", slug: "samsung-windfree-ar12", description: "Tehnologie WindFree pentru răcire fără curent de aer direct.", price: 11499, oldPrice: 14999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Samsung+WindFree", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.8, reviewCount: 27, badge: "-23%" },
  { name: "Haier Flexis Plus AS35S2SF2FA", slug: "haier-flexis-plus-as35", description: "Design slim și performanță excelentă pentru orice spațiu.", price: 8499, oldPrice: 10500, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Haier+Flexis", btu: 12000, inverter: true, energyClass: "A++", rating: 4.5, reviewCount: 14, badge: "-19%" },
  { name: "Panasonic Etherea CS-Z25ZKEW", slug: "panasonic-etherea-cs-z25", description: "Condiționer premium cu design minimalist și funcție nanoe™ X.", price: 15999, oldPrice: 19999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Panasonic+Etherea", btu: 9000, inverter: true, energyClass: "A+++", rating: 4.9, reviewCount: 11, badge: "-20%" },
  { name: "Daikin Perfera FTXM35R", slug: "daikin-perfera-ftxm35r", description: "Condiționer premium cu funcție 3D Airflow și filtrare Flash Streamer.", price: 14999, oldPrice: 17999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Daikin+Perfera", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.9, reviewCount: 33, badge: "Special" },
  { name: "Mitsubishi Electric MSZ-EF35VGK", slug: "mitsubishi-electric-msz-ef35vgk", description: "Design Kirigamine Zen, silențios și eficient energetic.", price: 16499, oldPrice: 19999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Mitsubishi+Zen", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.9, reviewCount: 28, badge: "Special" },
  { name: "Gree Sapphire WI-FI GWH12ACDXF", slug: "gree-sapphire-gwh12acdxf", description: "Condiționer inverter cu Wi-Fi integrat și design ultra-slim.", price: 9499, oldPrice: 11999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Gree+Sapphire", btu: 12000, inverter: true, energyClass: "A++", rating: 4.6, reviewCount: 17, badge: "Special" },
  { name: "Fujitsu ASYG12KGTA", slug: "fujitsu-asyg12kgta", description: "Performanță japoneză cu funcție de autopurificare a filtrului.", price: 11999, oldPrice: 14500, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Fujitsu+KGTA", btu: 12000, inverter: true, energyClass: "A++", rating: 4.7, reviewCount: 22, badge: "Special" },
  { name: "Hitachi Airhome 400 RAK-35PED", slug: "hitachi-airhome-400-rak35", description: "Tehnologie japoneză de top cu filtrare antibacteriană.", price: 13499, oldPrice: 16999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Hitachi+Airhome", btu: 12000, inverter: true, energyClass: "A++", rating: 4.8, reviewCount: 15, badge: "Special" },
  { name: "Carrier 42QHC012DS8", slug: "carrier-42qhc012ds8", description: "Răcire rapidă și uniformă cu distribuție 3D a aerului.", price: 10999, oldPrice: 13999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Carrier+QHC", btu: 12000, inverter: true, energyClass: "A++", rating: 4.6, reviewCount: 18, badge: "Special" },
  { name: "Trane TTK030E10HP2", slug: "trane-ttk030e10hp2", description: "Fiabilitate industrială adaptată pentru uz rezidențial.", price: 12499, oldPrice: 15499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Trane+TTK030", btu: 12000, inverter: true, energyClass: "A++", rating: 4.7, reviewCount: 12, badge: "Special" },
  { name: "Panasonic CS-TZ35WKEW", slug: "panasonic-cs-tz35wkew", description: "Funcție nanoe™ X pentru purificarea aerului și a suprafețelor.", price: 11299, oldPrice: 13999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Panasonic+TZ35", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.8, reviewCount: 26, badge: "Special" },
  { name: "Haier Tide Plus AS35S2SF1FA-MW", slug: "haier-tide-plus-as35s2", description: "Condiționer silențios cu Self-Cleaning și Wi-Fi integrat.", price: 9299, oldPrice: 11999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Haier+Tide", btu: 12000, inverter: true, energyClass: "A++", rating: 4.6, reviewCount: 20, badge: "Special" },
  { name: "Samsung WindFree Comfort AR09TXFCAWKNEU", slug: "samsung-windfree-comfort-ar09", description: "Răcire fără curent direct de aer, ideală pentru dormitoare.", price: 10499, oldPrice: 12999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Samsung+Comfort", btu: 9000, inverter: true, energyClass: "A+++", rating: 4.8, reviewCount: 31, badge: "Special" },
  { name: "LG ArtCool Mirror AC12BQ", slug: "lg-artcool-mirror-ac12bq", description: "Design oglindă elegant cu filtrare PM1.0 și control ThinQ.", price: 13999, oldPrice: 17499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=LG+ArtCool", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.9, reviewCount: 29, badge: "Special" },
  { name: "Daikin Emura FTXJ35MW", slug: "daikin-emura-ftxj35mw", description: "Design european award-winning cu purificare Flash Streamer.", price: 17999, oldPrice: 21999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Daikin+Emura", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.9, reviewCount: 24, badge: "Special" },
  { name: "Midea MSAGBU-12HRFN8 All Easy", slug: "midea-all-easy-12hrfn8", description: "Condiționer simplu de instalat, cu Wi-Fi inclus.", price: 7499, oldPrice: 9999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Midea+All+Easy", btu: 12000, inverter: true, energyClass: "A++", rating: 4.5, reviewCount: 16, badge: "-25%" },
  { name: "Bosch Climate 3000i W 35E", slug: "bosch-climate-3000i-w35e", description: "Fiabilitate germană la un preț accesibil.", price: 8299, oldPrice: 10999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Bosch+Climate", btu: 12000, inverter: true, energyClass: "A++", rating: 4.6, reviewCount: 21, badge: "-25%" },
  { name: "Toshiba Seiya RAS-B13E2KVG", slug: "toshiba-seiya-ras-b13", description: "Condiționer compact cu nivel de zgomot extrem de redus.", price: 9299, oldPrice: 11999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Toshiba+Seiya", btu: 13000, inverter: true, energyClass: "A++", rating: 4.7, reviewCount: 9, badge: "-22%" },
  { name: "Electrolux EACS/I-HAT/N8", slug: "electrolux-eacs-hat-n8", description: "Design nordic, eficiență ridicată și instalare rapidă.", price: 6999, oldPrice: 8999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Electrolux+HAT", btu: 9000, inverter: true, energyClass: "A+", rating: 4.4, reviewCount: 13, badge: "-22%" },
  { name: "Ariston PRIOS 25 Evo", slug: "ariston-prios-25-evo", description: "Condiționer silențios cu funcție de încălzire rapidă.", price: 7999, oldPrice: 10499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Ariston+Prios", btu: 9000, inverter: true, energyClass: "A++", rating: 4.5, reviewCount: 11, badge: "-24%" },
  { name: "Hisense Energy Pro QE35XV0D", slug: "hisense-energy-pro-qe35", description: "Eficiență maximă și consum redus de energie.", price: 8799, oldPrice: 11499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Hisense+Energy", btu: 12000, inverter: true, energyClass: "A+++", rating: 4.6, reviewCount: 14, badge: "-23%" },
  { name: "Whirlpool SPIW312L3", slug: "whirlpool-spiw312l3", description: "Purificare avansată a aerului cu tehnologie 6th Sense.", price: 7299, oldPrice: 9499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Whirlpool+6th", btu: 12000, inverter: true, energyClass: "A++", rating: 4.4, reviewCount: 8, badge: "-23%" },
  { name: "Sharp AY-X12ESR", slug: "sharp-ay-x12esr", description: "Plasmacluster Ion pentru aer curat și proaspăt.", price: 9899, oldPrice: 12999, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Sharp+AY-X12", btu: 12000, inverter: true, energyClass: "A++", rating: 4.5, reviewCount: 19, badge: "-24%" },
  { name: "LG PC09SK Standard Plus", slug: "lg-pc09sk-standard-plus", description: "Condiționer compact cu control prin aplicație ThinQ.", price: 6799, oldPrice: 8799, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=LG+PC09SK", btu: 9000, inverter: true, energyClass: "A++", rating: 4.5, reviewCount: 23, badge: "-23%" },
  { name: "Gree Bora A4 GWH09AAB", slug: "gree-bora-a4-gwh09aab", description: "Design modern cu funcție de auto-curățare și anti-mucegai.", price: 7199, oldPrice: 9299, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Gree+Bora+A4", btu: 9000, inverter: true, energyClass: "A++", rating: 4.4, reviewCount: 16, badge: "-23%" },
  { name: "Daikin Sensira FTXF25E", slug: "daikin-sensira-ftxf25e", description: "Condiționer compact inverter pentru camere mici, silențios.", price: 10499, oldPrice: 13499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Daikin+FTXF25", btu: 9000, inverter: true, energyClass: "A++", rating: 4.7, reviewCount: 21, badge: "-22%" },
  { name: "Haier Pearl HPU-09HF103", slug: "haier-pearl-hpu09hf103", description: "Design perlat cu filtrare antibacteriană și Wi-Fi integrat.", price: 8199, oldPrice: 10699, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Haier+Pearl", btu: 9000, inverter: true, energyClass: "A++", rating: 4.5, reviewCount: 13, badge: "-23%" },
  { name: "Panasonic CS-Z20ZKEW Etherea", slug: "panasonic-cs-z20zkew-etherea", description: "Design minimalist japonez cu nanoe™ X și control vocal.", price: 13499, oldPrice: 17499, image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Panasonic+Z20", btu: 7000, inverter: true, energyClass: "A+++", rating: 4.8, reviewCount: 18, badge: "-23%" },
];

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: "conditioane-rezidentiale" } });
  if (!category) {
    console.error("Categoria 'conditioane-rezidentiale' nu a fost găsită.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.product.create({ data: { ...p, inStock: true, categoryId: category.id } });
    created++;
  }

  console.log(`✔ Adăugate ${created} produse noi, ${skipped} existau deja.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
