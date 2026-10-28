import { allocateSiteOrderNumber } from "./orderNumberRegistry";

/**
 * Următorul număr de comandă, alocat atomic prin registrul COMUN cu CRM-ul (lib/orderNumberRegistry.ts): același allocator și același index
 * unic ca la rezervările CRM-ului, deci site-ul și CRM-ul nu pot da niciodată același număr.
 */
export async function nextOrderNumber(): Promise<string> {
  return allocateSiteOrderNumber();
}
