"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

export default function SaveButton({ label = "Salvează setările" }: { label?: string }) {
  const { pending } = useFormStatus();
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setJustSaved(true);
      const timeout = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <Button
      type="submit"
      variant="accent"
      disabled={pending}
      className={cn(
        "self-start transition-colors duration-300",
        pending && "animate-pulse",
        justSaved && "bg-success hover:bg-success"
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          Se salvează...
        </>
      ) : justSaved ? (
        <span key="saved" className="flex items-center gap-2 animate-pop">
          <Check className="w-4 h-4 animate-bump" aria-hidden />
          Salvat!
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
