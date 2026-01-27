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

// Simple debounce function
function useDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func(...args), delay);
  };
}

// Use the full Product type instead of limited FavoriteProduct
type Product = Tables<"products">;

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
  getTotalFavorites: () => number;
  toggleFavorite: (product: Product) => void;
  loadUserData?: () => Promise<void>;
  syncFavorites?: () => Promise<void>;
  getFavorites?: () => Promise<Product[]>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [lastAction, setLastAction] = useState<{
    type: "add" | "remove" | "clear" | null;
    productName?: string;
  }>({ type: null });

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle toast notifications based on last action
  useEffect(() => {
    if (!lastAction.type) return;

    // Use setTimeout to ensure this runs after the current render cycle
    const timer = setTimeout(() => {
      switch (lastAction.type) {
        case "add":
          toast.success(`${lastAction.productName} added to favorites`);
          break;
        case "remove":
          toast.success("Product removed from favorites");
          break;
        case "clear":
          toast.success("All favorites cleared");
          break;
      }

      // Reset the action after showing the toast
      setLastAction({ type: null });
    }, 0);

    return () => clearTimeout(timer);
  }, [lastAction]);

  // Load favorites from localStorage only on client
  useEffect(() => {
    if (isClient && !userId) {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
        } catch (error) {
          console.error("Error parsing favorites from localStorage:", error);
        }
      }
      setSynced(true);
    }
  }, [isClient, userId]);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
      setSynced(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (userId) return;
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites, userId, isClient]);

  useEffect(() => {
    if (!userId || !synced) return;
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase.from("user_favorites").upsert({
        user_id: userId,
        items: favorites,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("favorites persist error", error);
    }, 500);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [favorites, userId, synced]);

  useEffect(() => {
    if (!isClient) return;

    if (!userId) {
      const localFavs: Product[] =
        JSON.parse(localStorage.getItem("favorites") || "[]") || [];
      setFavorites(localFavs);
      setSynced(true);
      return;
    }

    const sync = async () => {
      const localFavs: Product[] =
        JSON.parse(localStorage.getItem("favorites") || "[]") || [];

      const { data: remoteRow, error } = await supabase
        .from("user_favorites")
        .select("items")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("favorites sync error", error);
        setSynced(true);
        return;
      }

      const remoteFavs: Product[] = remoteRow?.items || [];
      const map = new Map<string, Product>();
      [...remoteFavs, ...localFavs].forEach((fav) => {
        map.set(fav.id, fav);
      });
      const resolved = Array.from(map.values());

      setFavorites(resolved);
      setSynced(true);

      await supabase.from("user_favorites").upsert({
        user_id: userId,
        items: resolved,
        updated_at: new Date().toISOString(),
      });

      localStorage.removeItem("favorites");
    };

    sync();
  }, [userId, isClient]);

  const addToFavorites = useCallback((product: Product) => {
    setFavorites((prevFavorites) => {
      const existingFavorite = prevFavorites.find(
        (fav) => fav.id === product.id,
      );
      if (existingFavorite) {
        return prevFavorites;
      }
      const withAddedAt: Product = {
        ...product,
      };
      setLastAction({ type: "add", productName: product.title });
      return [...prevFavorites, withAddedAt];
    });
  }, []);

  const removeFromFavorites = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
      const product = prevFavorites.find((fav) => fav.id === id);
      if (!product) {
        return prevFavorites;
      }
      setLastAction({ type: "remove" });
      return prevFavorites.filter((fav) => fav.id !== id);
    });
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((prevFavorites) => {
      const existingFavorite = prevFavorites.find(
        (fav) => fav.id === product.id,
      );
      if (existingFavorite) {
        // Remove from favorites
        setLastAction({ type: "remove" });
        return prevFavorites.filter((fav) => fav.id !== product.id);
      } else {
        // Add to favorites - check if already exists to prevent duplicate
        if (prevFavorites.some((fav) => fav.id === product.id)) {
          return prevFavorites; // Already exists, don't add again
        }
        const withAddedAt: Product = {
          ...product,
        };
        setLastAction({ type: "add", productName: product.title });
        return [...prevFavorites, withAddedAt];
      }
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setLastAction({ type: "clear" });
  }, []);

  const isFavorite = useCallback(
    (id: number | string) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites],
  );

  const getTotalFavorites = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = useMemo(
    () => ({
      favorites,
      addToFavorites,
      removeFromFavorites,
      clearFavorites,
      isFavorite,
      getTotalFavorites,
      toggleFavorite,
    }),
    [
      favorites,
      addToFavorites,
      removeFromFavorites,
      clearFavorites,
      isFavorite,
      getTotalFavorites,
      toggleFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
