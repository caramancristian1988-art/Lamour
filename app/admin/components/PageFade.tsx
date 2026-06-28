"use client";

// Remounts (via key) and replays a fade/slide-in animation whenever pageKey
// changes, so paging through a server-rendered list feels animated instead
// of just snapping to new content.
export default function PageFade({ pageKey, children }: { pageKey: string | number; children: React.ReactNode }) {
  return <div key={pageKey} className="animate-page-fade">{children}</div>;
}
