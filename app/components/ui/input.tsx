import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
