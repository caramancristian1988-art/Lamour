"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuthModal } from "./AuthModalProvider";
import { loginAction, type AuthFormState } from "@/lib/authActions";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: AuthFormState = {};

export default function AuthModal() {
  const { mode, close } = useAuthModal();

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="text-center">Intră în cont</DialogTitle>
        <LoginFields />
      </DialogContent>
    </Dialog>
  );
}

function LoginFields() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-email">Email</Label>
        <Input id="auth-email" type="email" name="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-password">Parolă</Label>
        <Input id="auth-password" type="password" name="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" variant="accent" disabled={pending} className="mt-2">
        {pending ? "Se conectează..." : "Conectează-te"}
      </Button>
    </form>
  );
}
