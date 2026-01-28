"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Search, ShoppingBag, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useAuthModal } from "@/components/context/AuthModalContext";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/Button";

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
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-200 dark:border-pink-800 border-t-pink-600 dark:border-t-pink-400 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-rose-400/30 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Favorites
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your favorite items...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Please login to access your favorites
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={openLoginModal}
              variant="primary"
              size="lg"
              fullWidth
            >
              Login
            </Button>
            <Button
              onClick={() => router.push("/products")}
              variant="secondary"
              size="lg"
              fullWidth
            >
              Browse Products
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  My Favorites
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/products")}
              variant="outline"
              size="md"
            >
              Browse Products
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Sort by:
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [criteria, order] = e.target.value.split("-");
                  setSortBy(criteria as "name" | "price" | "addedDate");
                  setSortOrder(order as "asc" | "desc");
                }}
                className="border-2 border-gray-200 dark:border-gray-600 p-3 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
        </motion.div>

        {/* Favorites Grid */}
        {transformedFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-16 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-12 h-12 text-pink-400 dark:text-pink-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Start adding your favorite bouquets by clicking the heart icon on
              product pages.
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {transformedFavorites.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode="grid"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Clear All Button */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mt-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  You have {favorites.length} favorite
                  {favorites.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Clear all to start fresh
                </p>
              </div>
              <Button onClick={clearFavorites} variant="destructive" size="lg">
                Clear All Favorites
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
