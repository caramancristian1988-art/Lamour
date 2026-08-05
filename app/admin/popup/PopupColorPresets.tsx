"use client";

const PRESETS = [
  { label: "Verde & Bordo", button: "#185830", banner: "#681818" },
  { label: "Albastru", button: "#4C4A67", banner: "#30304F" },
] as const;

function applyPreset(button: string, banner: string) {
  const buttonInput = document.getElementById("field-popupButtonColor") as HTMLInputElement | null;
  const bannerInput = document.getElementById("field-popupBannerColor") as HTMLInputElement | null;
  if (buttonInput) buttonInput.value = button;
  if (bannerInput) bannerInput.value = banner;
}

export default function PopupColorPresets() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Presetări rapide</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset.button, preset.banner)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 border-2 border-input rounded-full hover:border-accent transition-colors"
          >
            <span className="flex -space-x-1.5">
              <span
                className="w-5 h-5 rounded-full border-2 border-card"
                style={{ backgroundColor: preset.button }}
                aria-hidden
              />
              <span
                className="w-5 h-5 rounded-full border-2 border-card"
                style={{ backgroundColor: preset.banner }}
                aria-hidden
              />
            </span>
            <span className="text-sm font-bold text-foreground">{preset.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Completează câmpurile de mai jos — apasă &quot;Salvează culorile&quot; ca să se aplice.
      </p>
    </div>
  );
}
