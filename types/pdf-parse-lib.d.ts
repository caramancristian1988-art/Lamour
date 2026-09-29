// pdf-parse nu publică tipuri pentru intrarea internă (lib/pdf-parse.js), pe care o folosim direct în
// lib/orderFileImport.ts ca să ocolim modul de depanare din index.js (citește un PDF de test la orice require).
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: unknown;
    metadata: unknown;
    version: string;
  }
  // Uint8Array (Buffer e o subclasă): vezi parsePdfRows — un Buffer mic poate fi citit greșit de pdf.js.
  function pdfParse(data: Uint8Array, options?: Record<string, unknown>): Promise<PdfParseResult>;
  export default pdfParse;
}
