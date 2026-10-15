import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";
import ReviewsMarquee, { type MarqueeItem } from "@/app/components/ReviewsMarquee";
import { facebookTestimonials } from "@/lib/testimonials";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  product: string | null;
}

interface Props {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: Props) {
  const reviewItems: MarqueeItem[] = reviews.map((r) => ({
    kind: "review",
    id: r.id,
    name: r.name,
    rating: r.rating,
    text: r.text,
    product: r.product,
  }));
  const facebookItems: MarqueeItem[] = facebookTestimonials.map((t) => ({ kind: "facebook", id: t.id, name: t.author, text: t.text, image: t.image }));

  // Mărturiile de pe Facebook se intercalează printre recenzii (nu toate la un loc), apoi mesajul final al magazinului.
  const items: MarqueeItem[] = [];
  const every = Math.max(2, Math.floor(reviewItems.length / (facebookItems.length + 1)) || 2);
  let fb = 0;
  reviewItems.forEach((item, i) => {
    items.push(item);
    if ((i + 1) % every === 0 && fb < facebookItems.length) items.push(facebookItems[fb++]);
  });
  while (fb < facebookItems.length) items.push(facebookItems[fb++]);
  items.push({ kind: "cta", id: "cta" });

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 bg-background">
      <MotifBackground />
      <div className="relative">
        <div className="text-center mb-6 px-4">
          <h2 className="flex items-center justify-center gap-2.5 text-3xl font-bold text-primary tracking-tight">
            Ce spun clienții noștri
            <HeadingFlourish />
          </h2>
          <p className="text-muted-foreground mt-2">Recenzii de la familii care ne-au ales din toată Moldova</p>
        </div>

        <ReviewsMarquee items={items} />
      </div>
    </section>
  );
}
