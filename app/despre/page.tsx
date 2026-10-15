import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/app/components/ui/button";
import { HeadingFlourish } from "@/app/components/ui/motif";
import JsonLd from "@/app/components/JsonLd";
import FacebookVideo from "@/app/components/FacebookVideo";
import { breadcrumbList } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

// Videoclipul de prezentare, publicat pe pagina de Facebook LuminTehnica (se încarcă doar la apăsarea butonului de redare).
const INTRO_VIDEO_URL =
  "https://www.facebook.com/lumintehnica/videos/la-lumintehnica-persoanele-nev%C4%83z%C4%83toare-muncesc-zilnic-pentru-a-crea-produse-de-c/2008314553086274/";
const INTRO_VIDEO_TITLE = "La LuminTehnica, persoanele nevăzătoare muncesc zilnic pentru a crea produse de calitate";

// Al doilea videoclip (vertical, 9:16), în secțiunea „Cine suntem”.
const TEAM_VIDEO_URL =
  "https://www.facebook.com/lumintehnica/videos/lumintehnica-locul-unde-imposibilul-devine-posibil-moldova1lumintehnica-moldova/1266136635565105/";
const TEAM_VIDEO_TITLE = "LuminTehnica – locul unde imposibilul devine posibil";

const DESPRE_TITLE = "Despre noi — povestea LuminTehnica | LuminTehnica";
const DESPRE_DESCRIPTION =
  "LuminTehnica – Lamour este un proiect social al Asociației Nevăzătorilor din Republica Moldova: produse cu grijă, făcute de oameni cu suflet, care creează locuri de muncă pentru persoane cu dizabilități de vedere.";

export const metadata: Metadata = {
  title: { absolute: DESPRE_TITLE },
  description: DESPRE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/despre") },
  openGraph: {
    title: DESPRE_TITLE,
    description: DESPRE_DESCRIPTION,
    url: absoluteUrl("/despre"),
  },
  twitter: {
    title: DESPRE_TITLE,
    description: DESPRE_DESCRIPTION,
  },
};

// Textul din coloanele din stânga începe aliniat cu restul site-ului (max-w-7xl), dar fotografiile din dreapta/stânga
// merg până la marginea ecranului — de aceea secțiunile cu poză „bleed” nu stau într-un container cu lățime maximă.
const COLUMN_INSET = "px-5 sm:px-8 lg:pl-[max(4rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-12";
const COLUMN_INSET_RIGHT = "px-5 sm:px-8 lg:pr-[max(4rem,calc((100vw-80rem)/2+1.5rem))] lg:pl-14";

/** Etichetă de secțiune: text în majuscule + linie cu floare mică (ca în machetă). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[13px] sm:text-sm font-semibold uppercase tracking-[0.2em] text-accent">
      {children}
      <span aria-hidden className="flex items-center gap-1.5 text-accent">
        <span className="h-px w-8 sm:w-12 bg-accent/60" />
        <HeadingFlourish className="w-4 h-4" />
        <span className="h-px w-8 sm:w-12 bg-accent/60" />
      </span>
    </p>
  );
}

function Rule() {
  return <div aria-hidden className="my-6 h-px w-14 bg-accent/70" />;
}

const body = "text-base lg:text-[17px] leading-relaxed text-foreground/80";
const h2 = "mt-4 mb-6 font-serif font-normal text-primary text-3xl sm:text-4xl lg:text-[2.7rem] leading-[1.12] tracking-tight";
const quote = "font-serif italic text-lg sm:text-xl leading-snug text-primary";

export default async function DesprePage() {
  const { despreEnabled } = await getSectionFlags();
  if (!despreEnabled) notFound();

  return (
    <main className="bg-background">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Despre noi", path: "/despre" }])} />

      {/* ── POVESTEA NOASTRĂ (hero) ── */}
      <section id="istorie" className="relative scroll-mt-24 overflow-hidden bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] lg:min-h-[560px]">
          <div className={`${COLUMN_INSET} py-8 lg:py-14 flex flex-col justify-center`}>
            <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-8 lg:mb-10">
              <Link href="/" className="font-semibold text-primary hover:text-accent transition-colors rounded">
                Acasă
              </Link>
              <span aria-hidden>›</span>
              <span>Despre noi</span>
            </nav>

            <SectionLabel>Despre noi</SectionLabel>

            <h1 className="mt-6 font-serif font-normal text-primary text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.05] tracking-tight">
              Povestea noastră
            </h1>
            <p className="mt-4 font-serif italic text-2xl sm:text-3xl text-primary leading-snug">
              Produse cu grijă. Oameni cu suflet.
            </p>

            <div className={`mt-8 space-y-4 max-w-xl ${body}`}>
              <p>
                {SITE_NAME} – Lamour este un proiect social al Asociației Nevăzătorilor din Republica Moldova, născut din dorința de a
                crea oportunități reale de muncă și incluziune pentru persoane cu dizabilități de vedere.
              </p>
              <p>
                Fiecare produs pe care îl realizăm poartă în el mai mult decât utilitate – poartă o poveste despre oameni, muncă,
                dăruire și încredere.
              </p>
            </div>

          </div>

          {/* Banda verticală cu motiv popular, între text și fotografie */}
          <div
            aria-hidden
            className="hidden lg:block w-12 bg-repeat-y"
            style={{ backgroundImage: "url(/despre/motiv-vertical.jpg)", backgroundSize: "100% auto" }}
          />

          <FacebookVideo
            videoUrl={INTRO_VIDEO_URL}
            poster="/despre/video-poster.jpg"
            title={INTRO_VIDEO_TITLE}
            priority
            className="aspect-video w-full lg:aspect-auto lg:h-full"
          />
        </div>
      </section>

      {/* ── CINE SUNTEM ── */}
      <section id="cine-suntem" className="scroll-mt-24 py-14 lg:py-20">
        <span id="misiune-sociala" className="block scroll-mt-24" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <FacebookVideo
            videoUrl={TEAM_VIDEO_URL}
            poster="/despre/video-poster-2.jpg"
            title={TEAM_VIDEO_TITLE}
            orientation="portrait"
            className="mx-auto w-full max-w-[300px] sm:max-w-[330px] aspect-[9/16] rounded-md shadow-lg"
          />

          <div>
            <SectionLabel>Cine suntem</SectionLabel>
            <h2 className={h2}>O echipă de oameni dedicați</h2>
            <div className={`space-y-4 ${body}`}>
              <p>
                Suntem parte a Asociației Nevăzătorilor din Republica Moldova și ne propunem să oferim locuri de muncă stabile,
                condiții corecte și un mediu în care fiecare om își poate valorifica talentul, indiferent de limitările de vedere.
              </p>
              <p>Credem în oameni, în puterea lor de a crea și în valoarea muncii sincere.</p>
            </div>
            <Rule />
            <p className={quote}>Împreună construim o societate mai incluzivă și mai deschisă.</p>
          </div>
        </div>
      </section>

      {/* ── CE FACEM ── */}
      <section className="overflow-hidden pb-14 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className={`${COLUMN_INSET} py-6 lg:py-16`}>
            <SectionLabel>Ce facem</SectionLabel>
            <h2 className={`${h2} max-w-md`}>Produse utile pentru fiecare casă</h2>
            <div className={`space-y-4 max-w-xl ${body}`}>
              <p>
                Realizăm produse de uz casnic, precum hârtie igienică, prosoape de hârtie și alte articole atent selectate,
                fabricate cu grijă și responsabilitate în Moldova.
              </p>
              <p>
                Ne concentrăm pe calitate, siguranță și utilitate, astfel încât fiecare client să se bucure de produse de încredere,
                realizate de oameni dedicați.
              </p>
            </div>
            <Rule />
            <p className={`${quote} max-w-xl`}>
              Fiecare achiziție contribuie direct la susținerea locurilor de muncă și la dezvoltarea proiectului nostru social.
            </p>
          </div>

          <div className="relative aspect-[474/305] w-full lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <Image
              src="/despre/ce-facem.jpg"
              alt="Atelier cu rafturi, flori și role de hârtie cu model popular, în fundal o angajată la lucru"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── MISIUNEA NOASTRĂ ── */}
      <section id="misiune" className="scroll-mt-24 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <div className="relative aspect-[500/256] w-full lg:aspect-auto lg:min-h-[400px]">
            <Image
              src="/despre/misiune.jpg"
              alt="Detaliu al ambalajului Lamour Cu Dragoste, cu model în relief și flori de câmp"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className={`${COLUMN_INSET_RIGHT} bg-brand-rose-light/25 py-12 lg:py-16 flex flex-col justify-center`}>
            <SectionLabel>Misiunea noastră</SectionLabel>
            <h2 className={h2}>Mai mult decât produse</h2>
            <p className={`max-w-xl ${body}`}>
              Misiunea noastră este să aducem mai multă lumină în viața oamenilor – prin produse de calitate, prin incluziune
              socială și prin o comunitate mai puternică. Credem că fiecare gest contează, iar sprijinul vostru ne ajută să
              continuăm această poveste.
            </p>
            <div className="mt-8">
              <Button asChild variant="primary" size="lg">
                <Link href="/produse">
                  Află cum poți susține
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
