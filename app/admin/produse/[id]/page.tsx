import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import ProductForm from "../ProductForm";
import { updateProductAction } from "@/lib/adminProductActions";
import { deleteProductFaqAction } from "@/lib/adminProductFaqActions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, brandRows] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
  ]);
  if (!product) notFound();
  const brands = brandRows.map((b) => b.brand!).filter(Boolean);

  // Isolated from the Promise.all above so a hiccup fetching FAQs can't 500
  // the whole edit page.
  let faqs: Awaited<ReturnType<typeof prisma.productFaq.findMany>> = [];
  try {
    faqs = await prisma.productFaq.findMany({ where: { productId: id }, orderBy: { order: "asc" } });
  } catch {
    faqs = [];
  }

  return (
    <div>
      <AdminPageHeader
        title="Editează produs"
        action={
          <Link
            href={`/produse/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#c7092b] transition-colors"
          >
            Vezi pe site
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        }
      />
      <ProductForm action={updateProductAction} defaults={product} categories={categories} brands={brands} submitLabel="Salvează modificările" />

      <div className="mt-8">
        <AdminPageHeader
          title="Întrebări frecvente despre acest produs"
          description="Apar pe pagina produsului, sub recenzii. Opțional — dacă nu adaugi nimic, secțiunea nu apare deloc."
          action={
            <Link
              href={`/admin/produse/${product.id}/faq/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă întrebare
            </Link>
          }
        />

        {faqs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nu există întrebări adăugate pentru acest produs.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {faqs.map((faq) => (
                <div key={faq.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1d2353] truncate">{faq.question}</p>
                    <p className="text-xs text-gray-500 truncate">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/produse/${product.id}/faq/${faq.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteProductFaqAction} id={faq.id} confirmText="Sigur vrei să ștergi această întrebare?" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
