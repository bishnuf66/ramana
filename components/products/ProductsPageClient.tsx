"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import ProductCard from "./ProductCard";
import ProductFiltersPanel from "./ProductFiltersPanel";
import Pagination from "../ui/Pagination";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Tables } from "@/types/database.types";

type Product = Tables<"products">;
type ProductReview = Tables<"product_reviews">;
type Category = Tables<"categories">;

type ProductFilters = {
  category_id?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  rating?: number;
};

type ProductSort = {
  field: "name" | "price" | "rating" | "createdAt";
  direction: "asc" | "desc";
};

type ProductWithRating = Product & {
  averageRating?: number;
  reviewCount?: number;
};

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

interface ProductsPageClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialPagination?: PaginationData;
}

function ProductsPageInner({
  initialProducts,
  categories,
  initialPagination,
}: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSort>({
    field: "createdAt",
    direction: "desc",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>(
    initialPagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 12,
    },
  );
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ProductWithRating[]>([]);

  // Initialize with server data, then keep synced
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { data: productsData, error: productsError } =
          await supabase.from("products").select(`
            *,
            product_reviews (
              rating
            )
          `);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          toast.error("Failed to load products");
          return;
        }

        const productsWithRatings: ProductWithRating[] = (
          productsData || []
        ).map((product: any) => {
          const reviews = product.product_reviews || [];
          const validRatings = reviews.filter(
            (review: any) => review.rating != null,
          );

          const averageRating =
            validRatings.length > 0
              ? validRatings.reduce(
                  (sum: number, review: any) => sum + review.rating,
                  0,
                ) / validRatings.length
              : undefined;

          const reviewCount = validRatings.length;
          const { product_reviews: _, ...productData } = product;

          return {
            ...productData,
            averageRating,
            reviewCount,
          };
        });

        setProducts(productsWithRatings);
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = (
      products.length > 0 ? products : (initialProducts as ProductWithRating[])
    ).filter((product) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.title.toLowerCase().includes(query) ||
          (product.description &&
            product.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (filters.category_id && product.category_id !== filters.category_id) {
        return false;
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        const price = product.discount_price || product.price;
        if (price < min || price > max) return false;
      }

      if (
        filters.inStock !== undefined &&
        (product.stock || 0) > 0 !== filters.inStock
      ) {
        return false;
      }

      if (filters.rating && (product.averageRating || 0) < filters.rating) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case "name":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "price":
          aValue = a.discount_price || a.price;
          bValue = b.discount_price || b.price;
          break;
        case "rating":
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case "createdAt":
          aValue = new Date(a.created_at || "").getTime();
          bValue = new Date(b.created_at || "").getTime();
          break;
        default:
          return 0;
      }

      if (sort.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, initialProducts, searchQuery, filters, sort]);

  const displayProducts = products.length > 0 ? products : initialProducts;

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Loading products...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            Our Beautiful Bouquets
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Discover handcrafted arrangements made with love by Ramana
          </p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search bouquets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Sort */}
              <select
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-") as [
                    ProductSort["field"],
                    ProductSort["direction"],
                  ];
                  setSort({ field, direction });
                }}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="createdAt-desc">Newest First</option>
              </select>

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

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedProducts.length} of{" "}
            {displayProducts.length} products
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1"
            >
              <ProductFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
              />
            </motion.div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1 order-1 lg:order-2">
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
              {filteredAndSortedProducts.map((product, index) => (
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

            {/* No Results */}
            {filteredAndSortedProducts.length === 0 && (
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
                    Try adjusting your search or filters
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => {
                  // This will be handled by URL navigation
                  setPagination((prev) => ({ ...prev, currentPage: page }));
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPageClient(props: ProductsPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProductsPageInner {...props} />
    </Suspense>
  );
}
