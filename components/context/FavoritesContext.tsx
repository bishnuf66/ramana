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

// Favorite item reference stored in database
type FavoriteItemReference = {
  product_id: string;
  added_at: string;
};

// Favorite item type with full product data (for UI)
type FavoriteItem = Product & {
  added_at: string;
};

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
  getTotalFavorites: () => number;
  toggleFavorite: (product: Product) => void;
  refreshFavorites: () => void; // New function to refresh favorites with current data
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteReferences, setFavoriteReferences] = useState<
    FavoriteItemReference[]
  >([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to enrich favorite references with current product data
  const enrichFavoritesWithProductData = useCallback(
    async (references: FavoriteItemReference[]): Promise<FavoriteItem[]> => {
      if (references.length === 0) return [];

      try {
        const productIds = references.map((ref) => ref.product_id);
        console.log("Fetching favorite products for IDs:", productIds);

        // Fetch current product data
        const { data: products, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (error) {
          console.error("Error fetching products for favorites:", error);
          return [];
        }

        console.log("Fetched favorite products:", products);

        // Merge favorite references with current product data
        return references
          .map((ref) => {
            const product = products.find((p) => p.id === ref.product_id);
            if (!product) {
              console.warn(
                `Product ${ref.product_id} not found, removing from favorites`,
              );
              return null;
            }

            return {
              ...product,
              added_at: ref.added_at,
            };
          })
          .filter(Boolean) as FavoriteItem[];
      } catch (error) {
        console.error("Error enriching favorites:", error);
        return [];
      }
    },
    [],
  );

  // Refresh favorites with current product data
  const refreshFavorites = useCallback(async () => {
    if (!userId || favoriteReferences.length === 0) return;

    const enrichedFavorites =
      await enrichFavoritesWithProductData(favoriteReferences);
    setFavorites(enrichedFavorites);
  }, [userId, favoriteReferences, enrichFavoritesWithProductData]);

  // Persist to Supabase when logged in (store only references)
  useEffect(() => {
    console.log("Favorites persistence useEffect triggered:");
    console.log("- userId:", userId);
    console.log("- synced:", synced);
    console.log("- favoriteReferences length:", favoriteReferences.length);

    if (!userId) {
      console.log("Skipping favorites persistence - no userId");
      return;
    }

    // Allow persistence even if not synced, as long as we have userId and favorite data
    if (!synced && favoriteReferences.length === 0) {
      console.log(
        "Skipping favorites persistence - not synced and no favorite data",
      );
      return;
    }

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(async () => {
      console.log("Persisting favorites to database...");
      console.log("Data to persist:", favoriteReferences);

      const { error } = await supabase.from("user_favorites").upsert({
        user_id: userId,
        items: favoriteReferences,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Favorites persist error:", error);
        toast.error("Failed to save favorites to database");
      } else {
        console.log("Favorites successfully persisted to database");
      }
    }, 500);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [favoriteReferences, userId, synced]);

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

  // Load favorite references from Supabase when logged in
  useEffect(() => {
    console.log("Load favorites useEffect triggered - userId:", userId);

    if (!userId) {
      console.log("No userId, clearing favorites");
      setFavorites([]);
      setFavoriteReferences([]);
      setSynced(true);
      return;
    }

    const loadFavorites = async () => {
      console.log("Loading favorites for user:", userId);
      try {
        const { data: remoteRow, error } = await supabase
          .from("user_favorites")
          .select("items")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Favorites load error:", error);
          setSynced(true);
          return;
        }

        const references: FavoriteItemReference[] = (
          remoteRow?.items || []
        ).map((item: any) => ({
          product_id: item.product_id || item.id, // Handle both old and new format
          added_at: item.added_at || new Date().toISOString(),
        }));

        console.log("Loaded favorite references:", references);
        setFavoriteReferences(references);

        // Enrich with current product data
        const enrichedFavorites =
          await enrichFavoritesWithProductData(references);
        setFavorites(enrichedFavorites);

        console.log("Setting synced to true");
        setSynced(true);
      } catch (error) {
        console.error("Error loading favorites:", error);
        setSynced(true);
      }
    };

    loadFavorites();
  }, [userId, enrichFavoritesWithProductData]);

  const addToFavorites = useCallback(
    (product: Product) => {
      if (!userId) {
        toast.error("Please login to add items to favorites");
        return;
      }

      setFavoriteReferences((prevReferences) => {
        const existingRef = prevReferences.find(
          (ref) => ref.product_id === product.id,
        );
        if (existingRef) {
          return prevReferences; // Already in favorites
        }

        // Add new reference
        const newRef: FavoriteItemReference = {
          product_id: String(product.id),
          added_at: new Date().toISOString(),
        };

        toast.success(`${product.title} added to favorites`);
        return [...prevReferences, newRef];
      });
    },
    [userId],
  );

  const removeFromFavorites = useCallback((id: string) => {
    if (!userId) {
      toast.error("Please login to modify favorites");
      return;
    }

    setFavoriteReferences((prevReferences) =>
      prevReferences.filter((ref) => ref.product_id !== String(id)),
    );
    toast.success("Product removed from favorites");
  }, []);

  const toggleFavorite = useCallback(
    (product: Product) => {
      if (!userId) {
        toast.error("Please login to add items to favorites");
        return;
      }

      setFavoriteReferences((prevReferences) => {
        const existingRef = prevReferences.find(
          (ref) => ref.product_id === product.id,
        );
        if (existingRef) {
          // Remove from favorites
          toast.success("Product removed from favorites");
          return prevReferences.filter((ref) => ref.product_id !== product.id);
        } else {
          // Add to favorites
          const newRef: FavoriteItemReference = {
            product_id: String(product.id),
            added_at: new Date().toISOString(),
          };
          toast.success(`${product.title} added to favorites`);
          return [...prevReferences, newRef];
        }
      });
    },
    [userId],
  );

  const clearFavorites = useCallback(() => {
    if (!userId) {
      toast.error("Please login to modify favorites");
      return;
    }

    setFavoriteReferences([]);
    setFavorites([]);
    toast.success("All favorites cleared");
  }, [userId]);

  const isFavorite = useCallback(
    (id: number | string) => {
      return favoriteReferences.some((ref) => ref.product_id === String(id));
    },
    [favoriteReferences],
  );

  const getTotalFavorites = useCallback(() => {
    return favoriteReferences.length;
  }, [favoriteReferences]);

  const value = useMemo(
    () => ({
      favorites,
      addToFavorites,
      removeFromFavorites,
      clearFavorites,
      isFavorite,
      getTotalFavorites,
      toggleFavorite,
      refreshFavorites,
    }),
    [
      favorites,
      addToFavorites,
      removeFromFavorites,
      clearFavorites,
      isFavorite,
      getTotalFavorites,
      toggleFavorite,
      refreshFavorites,
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
