"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";

// Use the generated Supabase type
type Product = Tables<"products">;

// Cart item reference stored in database
type CartItemReference = {
  product_id: string;
  quantity: number;
  added_at: string;
};

// Cart item type with full product data (for UI)
type CartItem = Product & {
  quantity: number;
  added_at: string;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Omit<Partial<Product>, "id"> & {
      id: string | number;
      quantity?: number;
    },
  ) => void;
  increaseQuantity: (id: number | string) => void;
  decreaseQuantity: (id: number | string) => void;
  removeFromCart: (id: number | string) => void;
  removeFromCartWithConfirmation: (
    id: number | string,
    productName: string,
  ) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  refreshCart: () => void; // New function to refresh cart with current data
  updateQuantity: (id: number | string, quantity: number) => void; // New function to set specific quantity
  confirmModal: {
    isOpen: boolean;
    itemToRemove: number | string | null;
    itemName: string;
  };
  closeConfirmModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReferences, setCartReferences] = useState<CartItemReference[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    itemToRemove: null as number | string | null,
    itemName: "",
  });

  // Track auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log("Initial auth check - user ID:", data.user?.id);
      setUserId(data.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, "user ID:", session?.user?.id);
      setUserId(session?.user?.id ?? null);
      setSynced(false); // re-sync on login/logout
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Function to enrich cart references with current product data
  const enrichCartWithProductData = useCallback(
    async (references: CartItemReference[]): Promise<CartItem[]> => {
      if (references.length === 0) return [];

      try {
        const productIds = references.map((ref) => ref.product_id);
        console.log("Fetching products for IDs:", productIds);

        // Fetch current product data
        const { data: products, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (error) {
          console.error("Error fetching products for cart:", error);
          return [];
        }

        console.log("Fetched products:", products);

        // Merge cart references with current product data
        return references
          .map((ref) => {
            const product = products.find((p) => p.id === ref.product_id);
            if (!product) {
              console.warn(
                `Product ${ref.product_id} not found, removing 
                
                + cart`,
              );
              return null;
            }

            return {
              ...product,
              quantity: ref.quantity,
              added_at: ref.added_at,
            };
          })
          .filter(Boolean) as CartItem[];
      } catch (error) {
        console.error("Error enriching cart:", error);
        return [];
      }
    },
    [],
  );

  // Refresh cart with current product data
  const refreshCart = useCallback(async () => {
    if (!userId || cartReferences.length === 0) return;

    const enrichedCart = await enrichCartWithProductData(cartReferences);
    setCart(enrichedCart);
  }, [userId, cartReferences, enrichCartWithProductData]);

  // Auto-enrich cart when cartReferences changes (for immediate UI updates)
  useEffect(() => {
    if (!userId || !synced || cartReferences.length === 0) return;

    const enrichCart = async () => {
      console.log("Auto-enriching cart due to cartReferences change");
      const enrichedCart = await enrichCartWithProductData(cartReferences);
      setCart(enrichedCart);
    };

    enrichCart();
  }, [cartReferences, userId, synced, enrichCartWithProductData]);

  // Persist to Supabase when logged in (store only references)
  useEffect(() => {
    console.log("Persistence useEffect triggered:");
    console.log("- userId:", userId);
    console.log("- synced:", synced);
    console.log("- cartReferences length:", cartReferences.length);

    if (!userId) {
      console.log("Skipping persistence - no userId");
      return;
    }

    // Skip persistence if not synced yet (still loading from database)
    if (!synced) {
      console.log("Skipping persistence - not synced yet");
      return;
    }

    // Only persist if there are items or if we're clearing an existing cart
    if (cartReferences.length === 0 && synced) {
      console.log("Skipping persistence - empty cart after sync");
      return;
    }

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(async () => {
      console.log("Persisting cart to database...");
      console.log("Data to persist:", cartReferences);

      const { error } = await supabase.from("user_cart").upsert({
        user_id: userId,
        items: cartReferences,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Cart persist error:", error);
        toast.error("Failed to save cart to database");
      } else {
        console.log("Cart successfully persisted to database");
      }
    }, 0); // Immediate persistence for instant UI feedback

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [cartReferences, userId, synced]);

  // Load cart references from Supabase when logged in
  useEffect(() => {
    console.log("Load cart useEffect triggered - userId:", userId);

    if (!userId) {
      console.log("No userId, clearing cart");
      setCart([]);
      setCartReferences([]);
      setSynced(true);
      return;
    }

    const loadCart = async () => {
      console.log("Loading cart for user:", userId);
      try {
        const { data: remoteRow, error } = await supabase
          .from("user_cart")
          .select("items")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Cart load error:", error);
          setSynced(true);
          return;
        }

        const references: CartItemReference[] = (remoteRow?.items || []).map(
          (item: any) => ({
            product_id: item.product_id || item.id, // Handle both old and new format
            quantity: item.quantity || 1,
            added_at: item.added_at || new Date().toISOString(),
          }),
        );

        console.log("Loaded cart references:", references);
        setCartReferences(references);

        // Enrich with current product data
        console.log("Enriching cart with product data...");
        const enrichedCart = await enrichCartWithProductData(references);
        console.log("Enriched cart:", enrichedCart);
        setCart(enrichedCart);

        console.log("Setting synced to true");
        setSynced(true);
      } catch (error) {
        console.error("Error loading cart:", error);
        setSynced(true);
      }
    };

    loadCart();
  }, [userId, enrichCartWithProductData]);

  const addToCart = useCallback(
    (
      product: Omit<Partial<Product>, "id"> & {
        id: string | number;
        quantity?: number;
      },
    ) => {
      if (!userId) {
        toast.error("Please login to add items to cart");
        return;
      }

      console.log("Adding to cart:", product);
      console.log("Current userId:", userId);
      console.log("Current synced state:", synced);

      setCartReferences((prevReferences) => {
        const existingRef = prevReferences.find(
          (ref) => ref.product_id === product.id,
        );
        let newReferences;

        if (existingRef) {
          // Add selected quantity to existing quantity (accumulate)
          newReferences = prevReferences.map((ref) =>
            ref.product_id === product.id
              ? {
                  ...ref,
                  quantity: ref.quantity + (product.quantity || 1),
                }
              : ref,
          );
        } else {
          // Add new reference
          const newRef: CartItemReference = {
            product_id: String(product.id),
            quantity: product.quantity || 1,
            added_at: new Date().toISOString(),
          };
          newReferences = [...prevReferences, newRef];
        }

        console.log("New cart references:", newReferences);
        return newReferences;
      });

      toast.success("Added to cart!");
    },
    [userId, synced],
  );

  const increaseQuantity = useCallback((id: number | string) => {
    setCartReferences((prevReferences) => {
      const newReferences = prevReferences.map((ref) =>
        ref.product_id === String(id)
          ? { ...ref, quantity: ref.quantity + 1 }
          : ref,
      );

      return newReferences;
    });
  }, []);

  const decreaseQuantity = useCallback(
    (id: number | string) => {
      setCartReferences((prevReferences) => {
        const newReferences = prevReferences.map((ref) =>
          ref.product_id === String(id) && ref.quantity > 1
            ? { ...ref, quantity: ref.quantity - 1 }
            : ref,
        );

        return newReferences;
      });
    },
    [userId],
  );

  const removeFromCart = useCallback((id: number | string) => {
    setCartReferences((prevReferences) => {
      const newReferences = prevReferences.filter(
        (ref) => ref.product_id !== String(id),
      );

      return newReferences;
    });

    toast.success("Removed from cart");
  }, []);

  const removeFromCartWithConfirmation = useCallback(
    (id: number | string, productName: string) => {
      setConfirmModal({
        isOpen: true,
        itemToRemove: id,
        itemName: productName,
      });
    },
    [],
  );

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      itemToRemove: null,
      itemName: "",
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartReferences([]);
    setCart([]);
    toast.success("Cart cleared");
  }, []);

  const updateQuantity = useCallback(
    (id: number | string, newQuantity: number) => {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        setCartReferences((prevReferences) => {
          const newReferences = prevReferences.filter(
            (ref) => ref.product_id !== String(id),
          );

          return newReferences;
        });

        toast.success("Item removed from cart");
      } else {
        // Update quantity
        setCartReferences((prevReferences) => {
          const newReferences = prevReferences.map((ref) =>
            ref.product_id === String(id)
              ? { ...ref, quantity: newQuantity }
              : ref,
          );

          return newReferences;
        });
      }
    },
    [],
  );

  const getTotalPrice = useCallback(() => {
    return cart.reduce(
      (total, item) => total + item.price * (item.quantity || 0),
      0,
    );
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      removeFromCartWithConfirmation,
      clearCart,
      getTotalPrice,
      getTotalItems,
      refreshCart,
      updateQuantity,
      confirmModal,
      closeConfirmModal,
    }),
    [
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      removeFromCartWithConfirmation,
      clearCart,
      getTotalPrice,
      getTotalItems,
      refreshCart,
      updateQuantity,
      confirmModal,
      closeConfirmModal,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
