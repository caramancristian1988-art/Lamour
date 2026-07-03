import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-2xl border-2 p-4 flex gap-3 items-start [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        default: "bg-muted border-border text-foreground [&>svg]:text-foreground",
        success: "bg-success/10 border-success/30 text-success [&>svg]:text-success",
        destructive: "bg-destructive/10 border-destructive/30 text-destructive [&>svg]:text-destructive",
        accent: "bg-accent/10 border-accent/30 text-accent [&>svg]:text-accent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("font-bold leading-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm leading-relaxed [&:not(:first-child)]:mt-1", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
