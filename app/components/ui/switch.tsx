"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-transparent bg-muted transition-colors",
      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-accent",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform",
        "translate-x-0.5 data-[state=checked]:translate-x-[1.6rem]"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
