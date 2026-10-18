// Setările de accesibilitate ale vizitatorului: tipuri, valori implicite și scriptul care le aplică ÎNAINTE de prima afișare.
// Starea se ține în localStorage (doar pe dispozitivul vizitatorului) și se traduce în clase pe <html> (vezi blocul „a11y-" din globals.css).

export const A11Y_STORAGE_KEY = "site-a11y-v2";
/** Cheia veche (un singur comutator „text mărit + contrast"); o citim o dată ca să nu pierdem alegerea celor care îl foloseau. */
const LEGACY_KEY = "site-a11y-mode";

export const TEXT_LEVELS = 4; // 0 = normal … 3 = maxim

export interface A11ySettings {
  /** 0 = 100 %, 1 = 112,5 %, 2 = 125 %, 3 = 145 % din mărimea de text a browserului. */
  text: number;
  contrast: boolean;
  links: boolean;
  font: boolean;
  spacing: boolean;
  motion: boolean;
  cursor: boolean;
}

export const A11Y_DEFAULTS: A11ySettings = {
  text: 0,
  contrast: false,
  links: false,
  font: false,
  spacing: false,
  motion: false,
  cursor: false,
};

export const A11Y_TOGGLE_KEYS = ["contrast", "links", "font", "spacing", "motion", "cursor"] as const;
export type A11yToggleKey = (typeof A11Y_TOGGLE_KEYS)[number];

export function isActive(s: A11ySettings): boolean {
  return s.text > 0 || A11Y_TOGGLE_KEYS.some((k) => s[k]);
}

/** Validează ce vine din localStorage (poate fi vechi, editat de mână sau stricat). */
export function sanitize(raw: unknown): A11ySettings {
  const out: A11ySettings = { ...A11Y_DEFAULTS };
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  const text = Number(r.text);
  if (Number.isInteger(text) && text >= 0 && text < TEXT_LEVELS) out.text = text;
  for (const k of A11Y_TOGGLE_KEYS) out[k] = r[k] === true;
  return out;
}

export function readStored(): A11ySettings {
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw) return sanitize(JSON.parse(raw));
    if (window.localStorage.getItem(LEGACY_KEY) === "1") return { ...A11Y_DEFAULTS, text: 1, contrast: true };
  } catch {
    // localStorage blocat sau JSON stricat: pornim din valorile implicite
  }
  return { ...A11Y_DEFAULTS };
}

export function writeStored(s: A11ySettings): void {
  try {
    if (isActive(s)) window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(A11Y_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignorat: setarea rămâne valabilă cât ține pagina
  }
}

/** Pune clasele corespunzătoare pe <html>. */
export function applyToDocument(s: A11ySettings): void {
  const cl = document.documentElement.classList;
  for (let i = 1; i < TEXT_LEVELS; i++) cl.toggle(`a11y-text-${i}`, s.text === i);
  for (const k of A11Y_TOGGLE_KEYS) cl.toggle(`a11y-${k}`, s[k]);
}

/**
 * Script inline (în <head>): aplică setările salvate înainte de prima afișare, ca pagina să nu „sară" de la
 * mărimea normală la cea aleasă după încărcare. Trebuie să rămână sincron cu `readStored` / `applyToDocument` de mai sus.
 */
export const A11Y_BOOT_SCRIPT = `(function(){try{var l=localStorage,r=l.getItem(${JSON.stringify(A11Y_STORAGE_KEY)}),s=null;if(r)s=JSON.parse(r);else if(l.getItem(${JSON.stringify(LEGACY_KEY)})==="1")s={text:1,contrast:true};if(!s)return;var c=document.documentElement.classList,t=Number(s.text);if(t>=1&&t<${TEXT_LEVELS})c.add("a11y-text-"+t);${JSON.stringify([...A11Y_TOGGLE_KEYS])}.forEach(function(k){if(s[k]===true)c.add("a11y-"+k)})}catch(e){}})();`;
