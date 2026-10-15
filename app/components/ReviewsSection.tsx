import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";
import ReviewsCarousel, { type CarouselItem } from "@/app/components/ReviewsCarousel";
import { facebookTestimonials } from "@/lib/testimonials";

// Pe prima pagină apar DOAR capturile de ecran ale comentariilor reale de pe Facebook (inspiră mai multă încredere
// decât un text rescris). Mărturiile fără captură rămân în lib/testimonials.ts și apar aici imediat ce li se adaugă `image`.
export default function ReviewsSection() {
  const items: CarouselItem[] = facebookTestimonials.flatMap((t) =>
    t.image ? [{ id: t.id, name: t.author, text: t.text, image: t.image }] : []
  );
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 bg-background">
      <MotifBackground />
      <div className="relative">
        <div className="text-center mb-6 px-4">
          <h2 className="flex items-center justify-center gap-2.5 text-3xl font-bold text-primary tracking-tight">
            Ce spun clienții noștri
            <HeadingFlourish />
          </h2>
          <p className="text-muted-foreground mt-2">Comentarii reale de la oameni care ne-au ales, direct de pe Facebook</p>
        </div>

        <ReviewsCarousel items={items} />
      </div>
    </section>
  );
}
