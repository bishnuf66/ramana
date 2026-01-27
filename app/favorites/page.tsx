"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Search } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useAuthModal } from "@/components/context/AuthModalContext";
import { motion } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { Tables } from "@/types/database.types";

type Product = Tables<"products">;

export default function FavoritesPage() {
  const router = useRouter();
  const { openLoginModal } = useAuthModal();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "addedDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug: Log favorites data
  useEffect(() => {
    console.log("Favorites page - favorites data:", favorites);
    console.log("Favorites page - favorites length:", favorites.length);
  }, [favorites]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
        console.log("Favorites page - user ID:", user?.id);
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter((favorite) =>
    favorite.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort favorites based on selected criteria
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "addedDate") {
      comparison =
        new Date(b.added_at || "").getTime() -
        new Date(a.added_at || "").getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Since we're now storing full Product objects, we don't need transformation
  const transformedFavorites = sortedFavorites;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading favorites...
          </p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to access your favorites
          </p>
          <button
            onClick={openLoginModal}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-4"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your favorite bouquets and arrangements
          </p>
        </div>

        {/* Search and Sort */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="font-semibold mr-2">Sort by:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [criteria, order] = e.target.value.split("-");
                setSortBy(criteria as "name" | "price" | "addedDate");
                setSortOrder(order as "asc" | "desc");
              }}
              className="border p-2 rounded-lg"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="addedDate-asc">Date (Oldest to Newest)</option>
              <option value="addedDate-desc">Date (Newest to Oldest)</option>
            </select>
          </div>
        </div>

        {/* Favorites Grid */}
        {transformedFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding your favorite bouquets by clicking the heart icon on
              product pages.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {transformedFavorites.map((product) => (
              <ProductCard key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        )}

        {/* Clear All Button */}
        {favorites.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={clearFavorites}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All Favorites
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
