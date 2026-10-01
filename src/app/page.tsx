import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/products/ProductGrid";

interface HomePageProps {
  searchParams: { category?: string; q?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category, q } = searchParams;

  const products = await prisma.product.findMany({
    where: {
      ...(category && category !== "All" ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const categories = await prisma.product
    .findMany({ distinct: ["category"], select: { category: true } })
    .then((rows) => rows.map((r) => r.category));

  const activeCategory = category ?? "All";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      {!q && activeCategory === "All" && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 mb-10 text-white">
          <h1 className="text-4xl font-extrabold mb-3">Shop the Latest</h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Discover premium electronics, clothing, and home goods — curated for quality and value.
          </p>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            {/* preserve category when searching */}
            {activeCategory !== "All" && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
          </div>
        </form>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {["All", ...categories].map((cat) => (
            <a
              key={cat}
              href={cat === "All" ? (q ? `/?q=${q}` : "/") : `/?category=${encodeURIComponent(cat)}${q ? `&q=${q}` : ""}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">
        {q || activeCategory !== "All" ? (
          <>
            {products.length} result{products.length !== 1 ? "s" : ""}
            {q && <> for &ldquo;{q}&rdquo;</>}
            {activeCategory !== "All" && <> in {activeCategory}</>}
          </>
        ) : (
          <>{products.length} products available</>
        )}
      </p>

      <ProductGrid products={products} />
    </div>
  );
}
