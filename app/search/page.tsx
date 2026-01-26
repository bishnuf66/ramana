"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Search, Grid, List } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "../../components/products/ProductCard";
import { toast } from "react-toastify";
import { Tables } from "@/types/database.types";

// Use the generated Supabase type
type Product = Tables<"products">;

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hasSearched, setHasSearched] = useState(false);

  // Search products
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      // Transform API response to match Product interface
      const transformedProducts: Product[] = (data.products || []).map(
        (item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.discount_price || item.price,
          discount_price: item.discount_price,
          originalPrice: item.price,
          category: item.category || "Bouquet",
          mainImage: item.image || "/placeholder.jpg",
          stock: item.stock || 0,
          is_featured: item.isFeatured || false,
          rating: item.rating || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          category_id: item.category_id || null,
          cover_image: item.image || "/placeholder.jpg",
          image_url: item.image || "/placeholder.jpg",
          gallery_images: [],
          is_active: true,
        }),
      );

      setProducts(transformedProducts);
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial search when page loads with query
  useEffect(() => {
    if (initialQuery) {
      searchProducts(initialQuery);
    }
  }, [initialQuery]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      searchProducts(searchQuery.trim());
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            Search Results
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Find the perfect bouquet for your special moment
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search for bouquets..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-sm sm:text-base"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm sm:text-base"
            >
              Search
            </button>

            {/* View Mode */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                aria-label="List view"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>

          {/* Results Count */}
          {hasSearched && (
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Found {products.length} products for &quot;{initialQuery}&quot;
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Searching...
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4 sm:space-y-6"
            }
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!loading && hasSearched && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                No products found
              </h3>
              <p className="text-sm sm:text-base">
                Try searching with different keywords
              </p>
            </div>
          </motion.div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Start searching
              </h3>
              <p className="text-sm sm:text-base">
                Enter keywords to find beautiful bouquets
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
