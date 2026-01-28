"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProductCard from "../products/ProductCard";
import { supabase } from "@/lib/supabase/client";
import { Tables } from "../../types/database.types";

// Use the generated Supabase type
type Product = Tables<"products">;

interface ProductsPage {
  products: Product[];
  hasMore: boolean;
  currentPage: number;
}

const ExploreProducts: React.FC = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["featured-products"],
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        const offset = pageParam * 8;

        const { data, error } = await supabase
          .from("products")
          .select("*", { count: "exact" })
          .eq("is_featured", true) // Only fetch featured products
          .order("created_at", { ascending: false })
          .range(offset, offset + 8 - 1);

        if (error) throw error;

        return {
          products: data || [],
          hasMore: data?.length === 8,
          currentPage: pageParam + 1,
        };
      },
      getNextPageParam: (lastPage: ProductsPage, allPages: ProductsPage[]) => {
        if (lastPage?.hasMore) {
          return lastPage.currentPage;
        }
        return undefined;
      },
      initialPageParam: 0,
    });

  const products = data?.pages.flatMap((page) => page.products) || [];
  const shouldShowLoadMore = hasNextPage && products.length >= 6;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex flex-row justify-between mb-4">
          <div className="font-bold text-2xl">Featured Products</div>
          <div className="primary-red underline">View more</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded"></div>
              <div className="bg-gray-200 h-4 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with View More button */}
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="font-bold text-2xl">Featured Products</div>
        <a
          href="/products"
          className="text-green-600 hover:text-green-700 underline font-medium transition-colors"
        >
          View more
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product: Product, index: number) => (
            <ProductCard key={product.id} product={product} viewMode="grid" />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            <p className="text-lg">
              No featured products available at the moment.
            </p>
            <p className="text-sm mt-2">
              Check back soon for our latest arrangements!
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {shouldShowLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                Load More
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* End of Products Message */}
      {!hasNextPage && products.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            You've reached the end of our featured products.
          </p>
          <a
            href="/products"
            className="text-green-600 hover:text-green-700 underline font-medium mt-2 inline-block"
          >
            View all products
          </a>
        </div>
      )}
    </div>
  );
};

export default ExploreProducts;
