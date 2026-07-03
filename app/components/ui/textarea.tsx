import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-32 w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
