import { Quote } from "lucide-react";
import { StarRating } from "@/app/components/ui/star-rating";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ReviewsSection({ reviews }: Props) {
  return (
    <section className="py-16 sm:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary tracking-tight">Ce spun beneficiarii noștri</h2>
          <p className="text-muted-foreground mt-2">Mărturii din comunitatea noastră din Moldova</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-muted border border-border rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <Quote className="w-7 h-7 text-accent/25 mb-3" aria-hidden />
              <StarRating rating={review.rating} />
              <p className="text-sm text-muted-foreground mt-3 flex-1 leading-relaxed">„{review.text}”</p>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-white text-xs">{getInitials(review.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-bold text-foreground">{review.name}</div>
                  {review.product && (
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">{review.product}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
