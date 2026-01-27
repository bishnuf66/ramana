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

// Cart item type that extends Product with quantity
type CartItem = Product & {
  quantity: number;
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
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track auth changes
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
      setSynced(false); // re-sync on login/logout
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Persist to Supabase when logged in
  useEffect(() => {
    if (!userId || !synced) return;
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase.from("user_cart").upsert({
        user_id: userId,
        items: cart,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("cart persist error", error);
    }, 500);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [cart, userId, synced]);

  // Load cart from Supabase when logged in
  useEffect(() => {
    if (!userId) {
      setCart([]);
      setSynced(true);
      return;
    }

    const loadCart = async () => {
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

        const remoteCart: CartItem[] = (remoteRow?.items || []).map(
          (item: any) => ({
            ...item,
            quantity: item.quantity || 1,
          }),
        );

        setCart(remoteCart);
        setSynced(true);
      } catch (error) {
        console.error("Error loading cart:", error);
        setSynced(true);
      }
    };

    loadCart();
  }, [userId]);

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

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: (item.quantity || 0) + (product.quantity || 1),
                }
              : item,
          );
        }
        return [
          ...prevCart,
          { ...product, quantity: product.quantity || 1 } as CartItem,
        ];
      });
      toast.success(`${product.title} added to cart`);
    },
    [userId],
  );

  const increaseQuantity = useCallback(
    (id: number | string) => {
      if (!userId) {
        toast.error("Please login to modify cart");
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item,
        ),
      );
      toast.success("Quantity increased");
    },
    [userId],
  );

  const decreaseQuantity = useCallback(
    (id: number | string) => {
      if (!userId) {
        toast.error("Please login to modify cart");
        return;
      }

      setCart((prevCart) =>
        prevCart
          .map((item) =>
            item.id === id
              ? { ...item, quantity: (item.quantity || 0) - 1 }
              : item,
          )
          .filter((item) => (item.quantity || 0) > 0),
      );
      toast.success("Quantity decreased");
    },
    [userId],
  );

  const removeFromCart = useCallback(
    (id: number | string) => {
      if (!userId) {
        toast.error("Please login to modify cart");
        return;
      }

      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
      toast.error("Item removed from cart");
    },
    [userId],
  );

  const clearCart = useCallback(() => {
    if (!userId) {
      toast.error("Please login to modify cart");
      return;
    }

    setCart([]);
    toast.error("Cart cleared");
  }, [userId]);

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
      clearCart,
      getTotalPrice,
      getTotalItems,
    }),
    [
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      getTotalPrice,
      getTotalItems,
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
