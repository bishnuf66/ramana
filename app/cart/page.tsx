"use client";

import React, { useState, useEffect } from "react";
import {
  Trash,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/components/context/CartContext";
import { useCheckout } from "@/components/context/CheckoutContext";
import { useAuthModal } from "@/components/context/AuthModalContext";
import { Button } from "@/components/ui/Button";

export default function Cart() {
  const router = useRouter();
  const { openLoginModal } = useAuthModal();
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    refreshCart,
  } = useCart();

  // Debug: Log cart data when it changes
  useEffect(() => {
    console.log("Cart page - cart data:", cart);
    console.log("Cart page - cart length:", cart.length);
  }, [cart]);

  const { addToCheckout } = useCheckout();

  const [sortBy, setSortBy] = useState<"name" | "price" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh cart when component mounts to ensure latest data
  useEffect(() => {
    if (userId) {
      console.log("Cart page mounted - refreshing cart data");
      refreshCart();
    }
  }, [userId, refreshCart]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Function to sort cart items based on selected criteria and order
  const handleSort = (
    criteria: "name" | "price" | "quantity",
    order: "asc" | "desc",
  ) => {
    setSortBy(criteria);
    setSortOrder(order);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Select all items
  const selectAllItems = () => {
    const allItemIds = new Set(cart.map((item) => item.id));
    setSelectedItems(allItemIds);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  // Calculate selected items total
  const getSelectedItemsTotal = () => {
    return cart
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get selected items count
  const getSelectedItemsCount = () => {
    return cart
      .filter((item) => selectedItems.has(item.id))
      .reduce((count, item) => count + item.quantity, 0);
  };

  // Sort cart based on selected option and order
  const sortedCart = [...cart].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "quantity") {
      comparison = (a.quantity || 0) - (b.quantity || 0);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleCheckout = () => {
    if (!userId) {
      toast.error("Please login to proceed to checkout");
      openLoginModal();
      return;
    }

    const selectedCartItems = cart.filter((item) =>
      selectedItems.has(item.id),
    ) as any[];
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to checkout");
      return;
    }

    console.log(
      "Adding selected items to checkout context:",
      selectedCartItems,
    );

    // Store selected items in checkout context
    addToCheckout(selectedCartItems);

    router.push("/checkout");
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400/30 rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Cart
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Preparing your shopping experience...
            </p>
          </motion.div>
        </div>
      ) : !userId ? (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Please Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              You need to login to access your shopping cart
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
      ) : (
        <>
          <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Shopping Cart
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getTotalItems()} items • Rs{" "}
                        {getTotalPrice().toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/products")}
                    variant="outline"
                    size="md"
                  >
                    Continue Shopping
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-16 text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Your cart is empty
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                    Add some beautiful items to get started!
                  </p>
                  <Button
                    onClick={() => router.push("/products")}
                    variant="primary"
                    size="lg"
                  >
                    Browse Products
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Selection Controls */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-6"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          onClick={selectAllItems}
                          variant="primary"
                          size="sm"
                        >
                          Select All
                        </Button>
                        <Button
                          onClick={deselectAllItems}
                          variant="secondary"
                          size="sm"
                        >
                          Deselect All
                        </Button>
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium">
                          {selectedItems.size} of {cart.length} items selected
                        </div>
                      </div>

                      {/* Sorting Dropdown */}
                      <div className="flex items-center gap-3">
                        <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                          Sort by:
                        </label>
                        <select
                          onChange={(e) => {
                            const [criteria, order] = e.target.value.split("-");
                            handleSort(
                              criteria as "name" | "price" | "quantity",
                              order as "asc" | "desc",
                            );
                          }}
                          value={`${sortBy}-${sortOrder}`}
                          className="border-2 border-gray-200 dark:border-gray-600 p-3 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="price-asc">Price (Low to High)</option>
                          <option value="price-desc">
                            Price (High to Low)
                          </option>
                          <option value="quantity-asc">
                            Quantity (Low to High)
                          </option>
                          <option value="quantity-desc">
                            Quantity (High to Low)
                          </option>
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {sortedCart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex items-center justify-between p-6 rounded-2xl shadow-lg transition-all duration-300 ${
                          selectedItems.has(item.id)
                            ? "border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-xl"
                            : "border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-xl hover:border-green-300 dark:hover:border-green-600"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-6 h-6 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center flex-1 min-w-0 ml-4">
                          <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl blur-sm opacity-30"></div>
                            <Image
                              src={item.cover_image || "/placeholder.jpg"}
                              alt={item.title}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-xl relative z-10"
                            />
                          </div>
                          <div className="ml-6 flex-1 min-w-0">
                            <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2 truncate">
                              {item.title}
                            </h2>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                              Rs {item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-xl text-gray-900 dark:text-white min-w-[3rem] text-center bg-gray-100 dark:bg-gray-700 rounded-xl py-2">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Total
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              Rs {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <Button
                            onClick={() => removeFromCart(item.id)}
                            variant="destructive"
                            size="icon"
                            className="rounded-xl"
                          >
                            <Trash className="w-5 h-5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Total Price and Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mt-8"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="w-full lg:w-auto">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg text-gray-600 dark:text-gray-400">
                              Cart Total ({getTotalItems()} items)
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              Rs {getTotalPrice().toFixed(2)}
                            </span>
                          </div>
                          {selectedItems.size > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                Selected ({getSelectedItemsCount()} items)
                              </span>
                              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                Rs {getSelectedItemsTotal().toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={clearCart}
                        variant="destructive"
                        size="lg"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* Checkout Button */}
            <div className="sticky bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/50 p-6">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div className="text-center sm:text-left">
                    {selectedItems.size > 0 && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ready to checkout
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedItems.size} item
                          {selectedItems.size > 1 ? "s" : ""} • Rs{" "}
                          {getSelectedItemsTotal().toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                    variant="primary"
                    size="lg"
                    className="px-8 py-4 text-lg"
                    fullWidth
                  >
                    {selectedItems.size === 0 ? (
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Select Items to Checkout
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
