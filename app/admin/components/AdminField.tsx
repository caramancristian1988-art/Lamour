import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
}

export function AdminInput({
  label,
  name,
  required,
  type = "text",
  defaultValue,
  placeholder,
}: FieldProps & { type?: string; defaultValue?: string | number; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`field-${name}`}>
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      <Input
        id={`field-${name}`}
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
}

export function AdminSelect({
  label,
  name,
  required,
  defaultValue,
  children,
}: FieldProps & { defaultValue?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`field-${name}`}>
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      <select
        id={`field-${name}`}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="flex h-12 w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-base text-foreground transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}

export function AdminTextarea({
  label,
  name,
  required,
  defaultValue,
  rows = 4,
  placeholder,
}: FieldProps & { defaultValue?: string; rows?: number; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`field-${name}`}>
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      <Textarea
        id={`field-${name}`}
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="resize-none"
      />
    </div>
  );
}
