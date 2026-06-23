import Link from "next/link";

interface LinkableProduct {
  name: string;
  slug: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Renders text with any mentioned product names turned into plain-looking
// clickable links to that product's page — same "invisible link" idea used
// in the Telegram notifications, applied here too.
export default function LinkedProductText({ text, products }: { text: string; products: LinkableProduct[] }) {
  if (!text || products.length === 0) return <>{text}</>;

  const sorted = [...products].sort((a, b) => b.name.length - a.name.length);
  const pattern = new RegExp(`(${sorted.map((p) => escapeRegExp(p.name)).join("|")})`, "g");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const match = sorted.find((p) => p.name === part);
        if (!match) return part;
        return (
          <Link
            key={i}
            href={`/produse/${match.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:decoration-dotted hover:underline-offset-2 hover:text-[#c7092b] transition-colors"
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}
