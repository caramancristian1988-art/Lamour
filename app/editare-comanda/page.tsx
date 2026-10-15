import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { normalizeTiers } from "@/lib/pricing";
import EditSessionHydrator from "./EditSessionHydrator";
import type { CartItem } from "@/app/components/CartProvider";

export const metadata: Metadata = {
  title: "Editare comandă",
  robots: { index: false, follow: false },
};

interface OrderItemEntry {
  productId: string;
  quantity: number;
}

export default async function EditareComandaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const message = token
    ? await prisma.contactMessage.findFirst({ where: { editToken: token, orderStage: "noua" } })
    : null;

  if (!message) {
    return (
      <main className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-extrabold text-primary mb-2">Link invalid</h1>
        <p className="text-muted-foreground text-sm">
          Acest link de editare nu mai este valid — comanda a fost deja procesată sau linkul e greșit.
        </p>
      </main>
    );
  }

  const orderItemsRaw = Array.isArray(message.orderItems) ? (message.orderItems as unknown as OrderItemEntry[]) : [];
  const productIds = orderItemsRaw.map((i) => i.productId).filter(Boolean);
  const products = productIds.length > 0 ? await prisma.product.findMany({ where: { id: { in: productIds } } }) : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: CartItem[] = orderItemsRaw.reduce<CartItem[]>((acc, oi) => {
    const p = byId.get(oi.productId);
    if (!p) return acc;
    acc.push({
      slug: p.slug,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      quantity: Math.max(1, Math.floor(oi.quantity) || 1),
      tiers: normalizeTiers(p),
    });
    return acc;
  }, []);

  return (
    <EditSessionHydrator
      items={items}
      session={{
        messageId: message.id,
        editToken: message.editToken ?? "",
        name: message.name,
        phone: message.phone,
        email: message.email ?? "",
        locality: message.deliveryLocality ?? "",
        address: message.deliveryAddress ?? "",
        zip: message.deliveryZip ?? "",
      }}
    />
  );
}
