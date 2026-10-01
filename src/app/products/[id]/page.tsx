import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — ShopNext`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 4,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-800">Home</Link>
        <span>/</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-800">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {product.featured && (
            <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-blue-600 font-medium mb-2">{product.category}</p>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-4xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</p>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                product.stock === 0
                  ? "bg-red-400"
                  : product.stock <= 5
                  ? "bg-orange-400"
                  : "bg-green-400"
              }`}
            />
            <span className="text-sm text-gray-600">
              {product.stock === 0
                ? "Out of stock"
                : product.stock <= 5
                ? `Only ${product.stock} left in stock`
                : `In stock (${product.stock} available)`}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More from {product.category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">${Number(p.price).toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
