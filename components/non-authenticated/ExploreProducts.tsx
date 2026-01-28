"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "../products/ProductCard";
import { supabase } from "@/lib/supabase/client";
import { Tables } from "../../types/database.types";

// Use the generated Supabase type
type Product = Tables<"products">;

const ExploreProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    try {
      const offset = (page - 1) * productsPerPage;

      const { data, error } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_featured", true) // Only fetch featured products
        .order("created_at", { ascending: false })
        .range(offset, offset + productsPerPage - 1);

      if (error) throw error;

      const newHasMore = data?.length === productsPerPage;

      if (append) {
        setProducts((prev) => [...prev, ...(data || [])]);
      } else {
        setProducts(data || []);
      }

      setHasMore(newHasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchProducts(currentPage + 1, true);
    }
  };

  if (loading) {
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
      {hasMore && products.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {loadingMore ? (
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
      {!hasMore && products.length > 0 && (
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
