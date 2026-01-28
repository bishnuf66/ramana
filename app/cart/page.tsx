"use client";

import React, { useState, useEffect } from "react";
import { Trash, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/components/context/CartContext";
import { useCheckout } from "@/components/context/CheckoutContext";
import { useAuthModal } from "@/components/context/AuthModalContext";

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
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
          </div>
        </div>
      ) : !userId ? (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to login to access your shopping cart
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
      ) : (
        <>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Shopping Cart
            </h1>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Your cart is empty.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Add some items to get started!
                </p>
              </div>
            ) : (
              <>
                {/* Selection Controls */}
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={selectAllItems}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllItems}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      Deselect All
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {selectedItems.size} of {cart.length} items selected
                    </span>
                  </div>

                  {/* Sorting Dropdown */}
                  <div className="flex items-center gap-2">
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
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                      <option value="quantity-asc">
                        Quantity (Low to High)
                      </option>
                      <option value="quantity-desc">
                        Quantity (High to Low)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {sortedCart.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between border p-4 rounded-xl shadow-sm transition-all duration-200 ${
                        selectedItems.has(item.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 mr-3 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Image
                            src={item.cover_image || "/placeholder.jpg"}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h2 className="font-bold text-gray-900 dark:text-white truncate">
                            {item.title}
                          </h2>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            Rs {item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center space-x-2 mt-3">
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            Rs {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Price and Actions */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-auto">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        Cart Total ({getTotalItems()} items):{" "}
                        <span className="text-green-600 dark:text-green-400 ml-2">
                          Rs {getTotalPrice().toFixed(2)}
                        </span>
                      </p>
                      {selectedItems.size > 0 && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">
                          Selected ({getSelectedItemsCount()} items):{" "}
                          <span className="ml-1">
                            Rs {getSelectedItemsTotal().toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={clearCart}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleCheckout}
              disabled={selectedItems.size === 0}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                selectedItems.size === 0
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              {selectedItems.size === 0
                ? "Select Items to Checkout"
                : `Checkout ${selectedItems.size} Selected Item${
                    selectedItems.size > 1 ? "s" : ""
                  } (Rs ${getSelectedItemsTotal().toFixed(2)})`}
            </button>
          </div>
        </>
      )}
    </>
  );
}
