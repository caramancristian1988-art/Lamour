"use client";

// „Sari la conținut": primul element care primește focus la Tab (invizibil până atunci). Cine navighează cu tastatura sau cu
// cititor de ecran nu mai parcurge antetul (logo, căutare, meniuri) la fiecare pagină. Ținta e primul <main> al paginii.
export default function SkipToContent() {
  return (
    <a
      href="#continut"
      onClick={(e) => {
        const main = document.querySelector<HTMLElement>("main");
        if (!main) return;
        e.preventDefault();
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: "start" });
      }}
      className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
    >
      Sari la conținut
    </a>
  );
}
