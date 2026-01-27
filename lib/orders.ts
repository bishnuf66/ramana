import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Tables } from "@/types/database.types";

// Coupon type based on generated database types
export type Coupon = Tables<"coupons">;

export interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: any[];
  total_amount: number;
  payment_method: string; // Updated to accept any string from payment_options table
  payment_type: "full" | "partial";
  partial_payment_percentage?: number; // Default 50%
  payment_screenshot?: File;
  coupon_code?: string;
  notes?: string;
  delivery_location: "inside_kathmandu" | "outside_kathmandu";
  delivery_charge: number;
}

export interface CouponValidationResult {
  coupon_id: string;
  discount_amount: number;
  message: string;
  valid: boolean;
  applicable_products?: string[]; // Only present when product_ids are provided
}

export function calculateDeliveryCharge(
  location: "inside_kathmandu" | "outside_kathmandu",
): number {
  return location === "inside_kathmandu" ? 100 : 200;
}

export function calculatePartialPayment(
  totalAmount: number,
  percentage: number = 50,
): {
  partialAmount: number;
  remainingAmount: number;
} {
  const partialAmount = Math.round((totalAmount * percentage) / 100);
  const remainingAmount = totalAmount - partialAmount;

  return {
    partialAmount,
    remainingAmount,
  };
}

export function calculateOrderTotal(
  itemsTotal: number,
  discountAmount: number,
  deliveryCharge: number,
  partialPaymentPercentage?: number,
): {
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  partialPaymentAmount?: number;
  remainingAmount?: number;
} {
  const subtotal = itemsTotal;
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = totalAfterDiscount + deliveryCharge;

  let partialPaymentAmount: number | undefined;
  let remainingAmount: number | undefined;

  if (partialPaymentPercentage) {
    const partial = calculatePartialPayment(
      totalAmount,
      partialPaymentPercentage,
    );
    partialPaymentAmount = partial.partialAmount;
    remainingAmount = partial.remainingAmount;
  }

  return {
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    partialPaymentAmount,
    remainingAmount,
  };
}

export async function uploadPaymentScreenshot(file: File): Promise<string> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("File size must be less than 5MB");
    }

    // Generate unique filename
    const fileName = `payment-screenshots/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage (using existing product-images bucket)
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(
        `Failed to upload payment screenshot: ${uploadError.message}`,
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading payment screenshot:", error);
    throw error;
  }
}

// Fallback function using direct table queries if RPC function is deleted
async function validateCouponDirect(
  code: string,
  customerEmail: string,
  orderTotal: number,
  productIds?: string[],
): Promise<CouponValidationResult | null> {
  try {
    // Get coupon details
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return {
        coupon_id: "",
        discount_amount: 0,
        message: "Invalid or inactive coupon code",
        valid: false,
      };
    }

    // Basic validation checks
    const now = new Date();
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
    const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;

    // Check if coupon is expired
    if (expiresAt && now > expiresAt) {
      return {
        coupon_id: coupon.id,
        discount_amount: 0,
        message: "Coupon has expired",
        valid: false,
      };
    }

    // Check if coupon has started
    if (startsAt && now < startsAt) {
      return {
        coupon_id: coupon.id,
        discount_amount: 0,
        message: "Coupon is not yet active",
        valid: false,
      };
    }

    // Check minimum order amount
    if (
      coupon.minimum_order_amount &&
      orderTotal < coupon.minimum_order_amount
    ) {
      return {
        coupon_id: coupon.id,
        discount_amount: 0,
        message: `Minimum order amount of ${coupon.minimum_order_amount} required`,
        valid: false,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderTotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    return {
      coupon_id: coupon.id,
      discount_amount: Math.min(discountAmount, orderTotal),
      message: "Coupon applied successfully",
      valid: true,
    };
  } catch (error) {
    console.error("Error in direct coupon validation:", error);
    return null;
  }
}

export async function validateCouponCode(
  code: string,
  customerEmail: string,
  orderTotal: number,
  productIds?: string[],
): Promise<CouponValidationResult | null> {
  try {
    console.log("Validating coupon:", {
      code,
      customerEmail,
      orderTotal,
      productIds,
    });

    // Try the RPC function first
    const { data, error } = await supabase.rpc("validate_coupon", {
      coupon_code: code,
      customer_email: customerEmail,
      order_total: orderTotal,
      product_ids: productIds || null,
    });

    if (error) {
      console.error("RPC function error:", error);

      // Fallback to direct table validation if RPC function is deleted/broken
      console.log("Falling back to direct table validation...");
      return await validateCouponDirect(
        code,
        customerEmail,
        orderTotal,
        productIds,
      );
    }

    // Return the first result (or null if no results)
    const result = data && data.length > 0 ? data[0] : null;

    // Enhanced validation based on coupon schema
    if (result && result.valid) {
      // Additional client-side validation can be added here if needed
      // For now, we trust the database function validation
      console.log("Coupon validated successfully:", {
        coupon_id: result.coupon_id,
        discount_amount: result.discount_amount,
        applicable_products: result.applicable_products,
      });
    }

    return result;
  } catch (error) {
    console.error("Error validating coupon:", error);
    return null;
  }
}

// Helper function to get coupon details for debugging
export async function getCouponDetails(code: string): Promise<Coupon | null> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error) {
      console.error("Error fetching coupon details:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    return null;
  }
}

export async function applyCouponUsage(
  couponId: string,
  customerEmail: string,
  discountAmount: number,
  orderId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("apply_coupon_usage", {
      coupon_id: couponId,
      customer_email: customerEmail,
      discount_amount: discountAmount,
      order_id: orderId,
    });

    if (error) {
      console.error("Error applying coupon usage:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error applying coupon usage:", error);
    return false;
  }
}

export async function checkFirstTimeDiscount(
  customerEmail: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("customer_discounts")
      .select("first_purchase_discount_applied")
      .eq("customer_email", customerEmail)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking customer discount:", error);
      return false;
    }

    // If no record exists or discount not applied, customer is eligible
    return !data || !data.first_purchase_discount_applied;
  } catch (error) {
    console.error("Error checking first-time discount:", error);
    return false;
  }
}

export function calculateDiscount(
  totalAmount: number,
  discountAmount: number,
): {
  discountAmount: number;
  finalAmount: number;
} {
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  return {
    discountAmount,
    finalAmount,
  };
}

export async function createOrder(orderData: OrderData): Promise<any> {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Validate coupon if provided
    let couponValidation = null;
    let discountAmount = 0;
    let finalAmount = orderData.total_amount;

    if (orderData.coupon_code) {
      couponValidation = await validateCouponCode(
        orderData.coupon_code,
        orderData.customer_email,
        orderData.total_amount,
        orderData.items?.map((item: any) => item.product_id) || [],
      );

      if (couponValidation && couponValidation.valid) {
        discountAmount = couponValidation.discount_amount;
        const calculation = calculateDiscount(
          orderData.total_amount,
          discountAmount,
        );
        finalAmount = calculation.finalAmount;
      } else {
        toast.error("Invalid or expired coupon code");
      }
    }

    // Auto coupon logic removed - customers must manually enter and apply coupons
    let isFirstTimeCustomer = false;

    // Upload payment screenshot if provided (required for all payment methods now)
    let paymentScreenshotUrl = null;
    if (orderData.payment_screenshot) {
      paymentScreenshotUrl = await uploadPaymentScreenshot(
        orderData.payment_screenshot,
      );
    }

    // Calculate order totals
    const orderTotals = calculateOrderTotal(
      orderData.total_amount,
      discountAmount,
      orderData.delivery_charge,
      orderData.payment_type === "partial"
        ? orderData.partial_payment_percentage
        : undefined,
    );

    // Prepare order data using simplified schema
    const orderPayload = {
      user_id: user?.id || null,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone || null,
      shipping_address: orderData.shipping_address,
      total_amount: orderData.total_amount,
      discount_amount: discountAmount,
      delivery_charge: orderData.delivery_charge,
      partial_payment_amount: orderTotals.partialPaymentAmount || null,
      remaining_amount: orderTotals.remainingAmount || null,
      coupon_code: orderData.coupon_code?.toUpperCase() || null,
      coupon_discount_percentage:
        (discountAmount / orderData.total_amount) * 100 || null,
      payment_method: orderData.payment_method,
      payment_type: orderData.payment_type,
      partial_payment_percentage: orderData.partial_payment_percentage || 50,
      payment_screenshot: paymentScreenshotUrl,
      items: orderData.items,
      notes: orderData.notes || null,
    };

    // Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Apply coupon usage if coupon was used
    if (couponValidation && couponValidation.valid) {
      await applyCouponUsage(
        couponValidation.coupon_id,
        orderData.customer_email,
        discountAmount,
        order.id,
      );
    }

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

// Helper function to get welcome message for non-logged users
export function getWelcomeMessage(): string {
  return "Sign up and get up to 30% off on your first order!";
}
