"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tables } from "../../types/database.types";

type Product = Tables<"products">;
interface ProductSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ProductSearch({
  onSearch,
  placeholder = "Search products...",
  className = "",
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search products
  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data.products || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchProducts(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleResultClick = (product: Product) => {
    setQuery("");
    setShowResults(false);
    router.push(`/products/${product.id}`);
  };

  const handleSeeAllResults = () => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleSearchIconClick = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-sm sm:text-base"
          />

          {/* Search Icon */}
          <button
            type="button"
            onClick={handleSearchIconClick}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 sm:max-h-96 overflow-y-auto z-50"
          >
            {isLoading ? (
              <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm sm:text-base">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                    className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(product)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Image
                        src={product.cover_image || "/placeholder.jpg"}
                        alt={product.title}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                        width={32}
                        height={32}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">
                            {product.category_id || "General"}
                          </span>
                          <span className="font-medium">
                            NPR {product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : query ? (
              <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                No products found for &quot;{query}&quot;
              </div>
            ) : null}

            {/* See all results button */}
            {query && results.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                  onClick={handleSeeAllResults}
                  className="w-full text-left px-3 sm:px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors font-medium"
                >
                  See all results for "{query}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
