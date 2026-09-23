"use client";

import { useActionState, useRef } from "react";
import { AlertCircle, Check } from "lucide-react";
import { registerAction, type AuthFormState } from "@/lib/authActions";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { STAFF_ROLES } from "@/lib/staffRoles";

const initialState: AuthFormState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="max-w-sm">
      <CardContent className="pt-6">
        {state.success && (
          <Alert variant="success" className="mb-4" role="status">
            <Check aria-hidden />
            <AlertDescription>Cont creat cu succes!</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} action={formAction} key={state.success ? "done" : "form"} className="flex flex-col gap-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Input type="text" name="name" required placeholder="Nume complet" aria-label="Nume complet" />
          <Input type="email" name="email" required placeholder="Email" aria-label="Email" />
          <Input type="password" name="password" required minLength={6} placeholder="Parolă (minim 6 caractere)" aria-label="Parolă" />
          <label className="flex flex-col gap-1.5 text-sm text-foreground">
            Rol în comenzi (Telegram)
            <select
              name="staffRole"
              defaultValue=""
              className="border-2 border-input rounded-lg px-3 py-2.5 text-sm bg-card text-foreground focus-visible:outline-none focus-visible:border-accent"
            >
              <option value="">Fără rol</option>
              {STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
            <Checkbox name="isAdmin" />
            Acordă drepturi de administrator
          </label>

          <Button type="submit" variant="accent" disabled={pending}>
            {pending ? "Se creează contul..." : "Creează cont"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
