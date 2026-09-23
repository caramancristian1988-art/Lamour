// Roluri de staff (fără prisma — importabil și din componente client).
export const STAFF_ROLES = [
  { value: "depozitar", label: "Depozitar" },
  { value: "contabil", label: "Contabil" },
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number]["value"];

export function isStaffRole(value: string): value is StaffRole {
  return STAFF_ROLES.some((r) => r.value === value);
}

export function staffRoleLabel(role: string | null): string | null {
  return STAFF_ROLES.find((r) => r.value === role)?.label ?? null;
}
