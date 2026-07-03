"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function DeleteButton({
  action,
  id,
  confirmText = "Sigur vrei să ștergi acest element?",
  label = "Șterge",
}: {
  action: (formData: FormData) => void;
  id: string;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="icon" aria-label={label}>
        <Trash2 className="w-4 h-4" aria-hidden />
      </Button>
    </form>
  );
}
