"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CheckoutItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  cover_image?: string | null;
}

interface CheckoutContextType {
  selectedItems: CheckoutItem[];
  setSelectedItems: (items: CheckoutItem[]) => void;
  clearSelectedItems: () => void;
  addToCheckout: (items: CheckoutItem[]) => void;
  getCheckoutTotal: () => number;
  getCheckoutItemsCount: () => number;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItemsState] = useState<CheckoutItem[]>([]);

  const setSelectedItems = (items: CheckoutItem[]) => {
    setSelectedItemsState(items);
  };

  const clearSelectedItems = () => {
    setSelectedItemsState([]);
  };

  const addToCheckout = (items: CheckoutItem[]) => {
    setSelectedItemsState(items);
  };

  const getCheckoutTotal = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCheckoutItemsCount = () => {
    return selectedItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CheckoutContext.Provider
      value={{
        selectedItems,
        setSelectedItems,
        clearSelectedItems,
        addToCheckout,
        getCheckoutTotal,
        getCheckoutItemsCount,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
