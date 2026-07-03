"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-fade-in", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-4 bg-card p-6 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-full w-full max-w-sm border-l border-border data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
        left: "inset-y-0 left-0 h-full w-full max-w-sm border-r border-border data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
        top: "inset-x-0 top-0 border-b border-border data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
        bottom: "inset-x-0 bottom-0 border-t border-border data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
      },
    },
    defaultVariants: { side: "right" },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <DialogPrimitive.Close
          aria-label="Închide meniul"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:rotate-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30"
        >
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-xl font-bold text-foreground", className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
