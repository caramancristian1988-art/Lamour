"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  href: string;
  label: string;
  divider?: boolean;
  highlighted?: boolean;
}

export default function NavDropdown({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: DropdownItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route changed (including client-side navigation while the mouse never
  // left the trigger) — force the dropdown closed instead of relying on
  // CSS :hover, which can't detect that. Watches search params too, since
  // some items only change the query string (e.g. /produse?oferte=1).
  // Adjusting state during render (not in an effect) per React's guidance
  // for "resetting state when a prop changes".
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    if (open) setOpen(false);
  }

  function openNow() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  }

  function closeSoon() {
    closeTimeout.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <Link
        href={href}
        onFocus={openNow}
        className="flex items-center gap-1 py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded"
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5" aria-hidden />
      </Link>
      <div
        className={`absolute top-full left-0 bg-popover rounded-xl shadow-xl border border-border py-2 min-w-[220px] transition-all duration-150 z-50 ${
          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"
        }`}
      >
        {items.map((item) => (
          <div key={item.href}>
            {item.divider && <div className="my-1.5 border-t border-border" />}
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                item.highlighted ? "font-bold text-accent" : "text-foreground hover:text-accent"
              }`}
            >
              {item.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
