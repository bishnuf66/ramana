"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Tables } from "@/types/database.types";
import Checkout from "./Checkout";

type CartItem = {
  id: string;
  product_id: string;
  title: string;
  price: number;
  discount_price?: number;
  cover_image: string;
  quantity: number;
  slug: string;
  products?: {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    cover_image: string;
    slug: string;
  };
};

export default function CartWithCheckout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchCartItems();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    setUser(authUser);
  };

  const fetchCartItems = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          products (*)
        `,
        )
        .eq("user_id", authUser.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.product_id));
    }
  };

  const getSelectedItemsTotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.product_id))
      .reduce(
        (total, item) => total + (item.products?.price || 0) * item.quantity,
        0,
      );
  };

  const handleCheckoutComplete = (order: any) => {
    setShowCheckout(false);
    setSelectedItems([]);
    fetchCartItems(); // Refresh cart
    toast.success("Order placed successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Please Log In
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be logged in to view your cart
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add some products to your cart to get started
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shopping Cart ({cartItems.length} items)
            </h1>
            <button
              onClick={selectAllItems}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Check
                className={`w-4 h-4 ${selectedItems.length === cartItems.length ? "text-green-600" : ""}`}
              />
              {selectedItems.length === cartItems.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6"
            >
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.product_id)}
                  onChange={() => toggleItemSelection(item.product_id)}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />

                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {item.products?.cover_image ? (
                    <img
                      src={item.products.cover_image}
                      alt={item.products.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.products?.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    NPR {item.products?.price}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price and Remove */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    NPR {(item.products?.price || 0) * item.quantity}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} of {cartItems.length} items selected
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Total: NPR {getSelectedItemsTotal()}
              </p>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={selectedItems.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Checkout ({selectedItems.length} items)
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          selectedItems={selectedItems}
          onCheckoutComplete={handleCheckoutComplete}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
