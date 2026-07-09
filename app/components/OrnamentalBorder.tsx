export default function OrnamentalBorder({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-[30px] w-full bg-ornamental-border ${className}`} />;
}
