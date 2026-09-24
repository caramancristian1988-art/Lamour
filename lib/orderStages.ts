// Sursa cu care sunt create mesajele din coș — după ea se recunosc comenzile (flux operator -> depozitar -> curier).
export const CART_ORDER_SOURCE = "Comandă din coș";

// Fluxul de fulfillment pentru comenzile din coș — separat de MESSAGE_STATUSES
// (folosit doar de cereri de ofertă/mesaje de contact). Operator confirmă ->
// depozitar pregătește și predă -> curier (EVS Express, automat).
export const ORDER_STAGES = [
  { value: "noua", label: "Comandă nouă" },
  { value: "confirmata", label: "Confirmată — la pregătire" },
  { value: "predata_curier", label: "Predată curierului" },
  { value: "anulata", label: "Anulată" },
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number]["value"];

export function orderStageLabel(stage: string | null): string {
  return ORDER_STAGES.find((s) => s.value === stage)?.label ?? "Comandă nouă";
}
