"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { loginAction, type AuthFormState } from "@/lib/authActions";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: AuthFormState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-sm">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 justify-center" aria-label="Fir de ariadnă">
        <Link href="/" className="hover:text-accent transition-colors rounded">
          Acasă
        </Link>
        <span aria-hidden>›</span>
        <span className="text-foreground font-medium">Autentificare</span>
      </nav>

      <h1 className="text-2xl font-bold text-primary text-center mb-1 tracking-tight">
        Conectează-te la <span className="text-accent">contul tău</span>
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">Conturile sunt create de un administrator.</p>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" name="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Parolă</Label>
          <Input id="login-password" type="password" name="password" required autoComplete="current-password" />
        </div>

        <Button type="submit" variant="accent" disabled={pending} className="mt-1">
          {pending ? "Se conectează..." : "Conectează-te"}
        </Button>
      </form>
    </div>
  );
}
