import { Check } from "lucide-react";

interface SuccessStateProps {
  title: string;
  description: string;
}

/** Shared "request sent" confirmation block used across modals/forms. */
export function SuccessState({ title, description }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-8" role="status">
      <div className="relative w-14 h-14 mb-4">
        <span className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
        <div className="relative w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center animate-pop">
          <Check className="w-7 h-7" strokeWidth={2.5} aria-hidden />
        </div>
      </div>
      <h3 className="text-lg font-bold text-primary mb-1 animate-pop" style={{ animationDelay: "100ms" }}>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground animate-pop" style={{ animationDelay: "180ms" }}>
        {description}
      </p>
    </div>
  );
}
