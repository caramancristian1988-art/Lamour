// Culoarea principală a unei poze de produs → o paletă pentru ferestrele care o arată (ex. „Alege cantitatea"): antetul, butoanele și
// treptele de preț iau culoarea ambalajului (mov pentru „Lamour", verde pentru un detergent …), în loc de același vișiniu peste tot.
// Doar în browser (citește pixelii poza printr-un canvas). Fără rezultat clar (poză albă / gri / care nu se încarcă) → null, iar fereastra
// rămâne în culorile site-ului.
export interface Hsl {
  h: number; // 0–360
  s: number; // 0–1
  l: number; // 0–1
}

type Entry = Hsl | null;
const resolved = new Map<string, Entry>();
const pending = new Map<string, Promise<Entry>>();

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

const BINS = 24; // câte o felie de 15° din cercul culorilor

/** Culoarea dominantă dintr-un set de pixeli RGBA: pixelii albi / gri / aproape negri / transparenți nu contează; culoarea cu cea mai mare „masă" câștigă. */
export function dominantFromPixels(data: Uint8ClampedArray): Entry {
  const weight = new Array<number>(BINS).fill(0);
  const sumS = new Array<number>(BINS).fill(0);
  const sumX = new Array<number>(BINS).fill(0); // media circulară a nuanței (sin / cos), ca roșu 350° și 10° să nu se anuleze
  const sumY = new Array<number>(BINS).fill(0);
  let counted = 0;
  const total = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < 0.14 || l > 0.93 || l < 0.1) continue;
    const bin = Math.floor(h / (360 / BINS)) % BINS;
    const w = 0.35 + s; // culorile mai vii cântăresc ceva mai mult decât cele șterse, dar suprafața rămâne principalul criteriu
    weight[bin] += w;
    sumS[bin] += s * w;
    sumX[bin] += Math.cos((h * Math.PI) / 180) * w;
    sumY[bin] += Math.sin((h * Math.PI) / 180) * w;
    counted++;
  }
  if (counted < total * 0.08) return null; // prea puțină culoare în poză

  // o felie + vecinele ei, ca o nuanță aflată la granița dintre două felii să nu fie împărțită în două
  let best = 0, bestW = 0;
  for (let b = 0; b < BINS; b++) {
    const w = weight[b] + 0.6 * (weight[(b + 1) % BINS] + weight[(b + BINS - 1) % BINS]);
    if (w > bestW) { bestW = w; best = b; }
  }
  const w = weight[best];
  if (w === 0) return null;
  let h = (Math.atan2(sumY[best], sumX[best]) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { h, s: sumS[best] / w, l: 0.5 };
}

function loadPixels(src: string): Promise<Uint8ClampedArray | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        // poza se încadrează în pătrat (păstrează proporțiile), pe fundal transparent
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(ctx.getImageData(0, 0, size, size).data);
      } catch {
        resolve(null); // poză dintr-un alt domeniu, fără CORS: nu putem citi pixelii
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Poza mică, prin optimizatorul site-ului (același domeniu → canvas-ul rămâne citibil; aceleași surse permise ca la <Image>). */
function sampleUrl(src: string): string {
  if (/^data:/.test(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=96&q=75`;
}

/** undefined = încă necalculat; null = fără culoare clară; altfel culoarea. Citire instantanee, fără cerere. */
export function peekDominantColor(src: string | null | undefined): Entry | undefined {
  if (!src) return null;
  return resolved.get(src);
}

export function dominantColor(src: string | null | undefined): Promise<Entry> {
  if (!src) return Promise.resolve(null);
  if (resolved.has(src)) return Promise.resolve(resolved.get(src) ?? null);
  const existing = pending.get(src);
  if (existing) return existing;
  const job = loadPixels(sampleUrl(src)).then((pixels) => {
    const color = pixels ? dominantFromPixels(pixels) : null;
    resolved.set(src, color);
    pending.delete(src);
    return color;
  });
  pending.set(src, job);
  return job;
}

const hsl = (h: number, s: number, l: number) => `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;

/**
 * Variabilele CSS ale temei (suprascriu pe elementul ferestrei exact variabilele pe care le folosesc clasele site-ului: bg-accent,
 * text-primary, from-brand-maroon …). Luminozitățile sunt fixe, ca textul alb de pe antet / butoane să aibă mereu contrast bun,
 * indiferent cât de deschisă e culoarea din poză; saturația se limitează ca nici un ambalaj foarte țipător, nici unul șters să nu strice aspectul.
 */
export function themeVars(color: Hsl): Record<string, string> {
  const h = color.h;
  const s = Math.min(Math.max(color.s, 0.32), 0.72);
  const soft = Math.min(s, 0.5);
  return {
    "--foreground": hsl(h, s * 0.7, 0.2),
    "--card-foreground": hsl(h, s * 0.7, 0.2),
    "--brand-maroon-dark": hsl(h, s * 0.9, 0.17),
    "--brand-maroon": hsl(h, s, 0.27),
    "--primary": hsl(h, s, 0.27),
    "--accent": hsl(h, s, 0.4),
    "--brand-red-dark": hsl(h, s, 0.31),
    "--ring": hsl(h, s, 0.4),
    "--brand-rose": hsl(h, soft, 0.82),
    "--brand-rose-light": hsl(h, soft * 0.8, 0.93),
    "--secondary": hsl(h, soft, 0.9),
    "--secondary-foreground": hsl(h, s, 0.18),
    "--muted": hsl(h, soft * 0.7, 0.96),
    "--border": hsl(h, soft * 0.5, 0.87),
  };
}
