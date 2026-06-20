const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const brandOrigin = {
  Daikin: "Japonia",
  "Mitsubishi Electric": "Japonia",
  Gree: "China",
  Midea: "China",
  "Cooper&Hunter": "SUA",
  Electrolux: "Suedia",
  LG: "Coreea de Sud",
  Samsung: "Coreea de Sud",
  Haier: "China",
  Panasonic: "Japonia",
  Fujitsu: "Japonia",
  Hitachi: "Japonia",
  Carrier: "SUA",
  Trane: "SUA",
  Bosch: "Germania",
  Toshiba: "Japonia",
  Ariston: "Italia",
  Hisense: "China",
  Whirlpool: "SUA",
  Sharp: "Japonia",
};

function modelFromName(name, brand) {
  if (!brand) return name;
  const idx = name.toLowerCase().indexOf(brand.toLowerCase());
  if (idx === -1) return name;
  return name.slice(idx + brand.length).trim() || name;
}

function btuBucketSpecs(btu) {
  if (!btu || btu <= 9000) {
    return {
      noiseInt: "19-32 dB",
      noiseExt: "50-54 dB",
      airflow: "550 m³/h",
      dimsInt: "770 x 280 x 190 mm",
      weightInt: "8 kg",
      dimsExt: "700 x 550 x 250 mm",
      weightExt: "26 kg",
    };
  }
  if (btu <= 12000) {
    return {
      noiseInt: "21-36 dB",
      noiseExt: "52-56 dB",
      airflow: "650 m³/h",
      dimsInt: "800 x 300 x 200 mm",
      weightInt: "9 kg",
      dimsExt: "770 x 555 x 265 mm",
      weightExt: "31 kg",
    };
  }
  if (btu <= 18000) {
    return {
      noiseInt: "23-40 dB",
      noiseExt: "54-58 dB",
      airflow: "750 m³/h",
      dimsInt: "955 x 325 x 210 mm",
      weightInt: "11 kg",
      dimsExt: "845 x 702 x 363 mm",
      weightExt: "38 kg",
    };
  }
  return {
    noiseInt: "26-42 dB",
    noiseExt: "56-60 dB",
    airflow: "900 m³/h",
    dimsInt: "1100 x 327 x 215 mm",
    weightInt: "14 kg",
    dimsExt: "946 x 810 x 363 mm",
    weightExt: "52 kg",
  };
}

function specsForAcUnit(product, categorySlug) {
  const refrigerant = product.technology === "Inverter" ? "R32" : "R410A";
  const origin = (product.brand && brandOrigin[product.brand]) || "China";
  const model = modelFromName(product.name, product.brand);
  const base = [
    { label: "Model", value: model },
    { label: "Agent frigorific", value: refrigerant },
    { label: "Țara de fabricație", value: origin },
    { label: "Garanție", value: "3 ani" },
  ];

  if (categorySlug === "conditioane-portabile") {
    return [
      ...base,
      { label: "Nivel de zgomot", value: "52-65 dB" },
      { label: "Dimensiuni unitate", value: "470 x 365 x 765 mm" },
      { label: "Greutate", value: "27 kg" },
      { label: "Debit de aer", value: "350 m³/h" },
    ];
  }

  const b = btuBucketSpecs(product.btu);
  return [
    ...base,
    { label: "Nivel de zgomot (interior)", value: b.noiseInt },
    { label: "Nivel de zgomot (exterior)", value: b.noiseExt },
    { label: "Debit de aer", value: b.airflow },
    { label: "Dimensiuni unitate interioară", value: b.dimsInt },
    { label: "Greutate unitate interioară", value: b.weightInt },
    { label: "Dimensiuni unitate exterioară", value: b.dimsExt },
    { label: "Greutate unitate exterioară", value: b.weightExt },
  ];
}

const accessorySpecs = {
  "telecomanda-universala-ac": [
    { label: "Compatibilitate", value: "Universală, peste 1000 de modele" },
    { label: "Alimentare", value: "2 x baterii AAA (incluse)" },
    { label: "Rază de acțiune", value: "8-10 m" },
    { label: "Garanție", value: "2 ani" },
  ],
  "suport-montaj-unitate-exterioara": [
    { label: "Material", value: "Oțel galvanizat" },
    { label: "Capacitate susținere", value: "până la 80 kg" },
    { label: "Compatibilitate", value: "Unități exterioare standard" },
    { label: "Garanție", value: "2 ani" },
  ],
  "freon-r32-1kg": [
    { label: "Tip agent frigorific", value: "R32" },
    { label: "Cantitate", value: "1 kg" },
    { label: "Puritate", value: "99.9%" },
    { label: "Garanție", value: "Sigilat din fabrică" },
  ],
  "kit-conducte-cupru-izolate-3m": [
    { label: "Diametru", value: "1/4″ + 3/8″" },
    { label: "Lungime", value: "3 m" },
    { label: "Izolație", value: "9 mm spumă elastomerică" },
    { label: "Garanție", value: "2 ani" },
  ],
  "pompa-condens-ac": [
    { label: "Debit", value: "12 l/h" },
    { label: "Nivel de zgomot", value: "< 22 dB" },
    { label: "Alimentare", value: "220-240V" },
    { label: "Garanție", value: "2 ani" },
  ],
};

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  let updated = 0;

  for (const product of products) {
    const specifications = accessorySpecs[product.slug] ?? specsForAcUnit(product, product.category.slug);
    await prisma.product.update({ where: { id: product.id }, data: { specifications } });
    updated++;
  }

  console.log(`✔ Adăugate specificații tehnice pentru ${updated} produse.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
