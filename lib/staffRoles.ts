// Ce primește fiecare rol: depozitar = comenzile confirmate (cu butonul Gata de ridicare); contabil = facturile;
// curier = notificare când comanda e gata de ridicare; manager = notificare la fiecare schimbare de etapă.
// Roluri de staff (fără prisma — importabil și din componente client).
export const STAFF_ROLES = [
  { value: "depozitar", label: "Depozitar" },
  { value: "contabil", label: "Contabil" },
  { value: "curier", label: "Curier" },
  { value: "manager", label: "Manager" },
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number]["value"];

export function isStaffRole(value: string): value is StaffRole {
  return STAFF_ROLES.some((r) => r.value === value);
}

export function staffRoleLabel(role: string | null): string | null {
  return STAFF_ROLES.find((r) => r.value === role)?.label ?? null;
}
