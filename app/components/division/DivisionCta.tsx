import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Props {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

export default function DivisionCta({ title, description, ctaLabel, ctaHref, className = "" }: Props) {
  return (
    <section className={`max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pb-16 pt-4 ${className}`}>
      <div className="bg-primary rounded-2xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-lg">{title}</p>
          <p className="text-white/70 text-sm mt-0.5">{description}</p>
        </div>
        <Button asChild variant="accent" size="lg" className="shrink-0">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
