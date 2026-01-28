import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Tables } from "@/types/database.types";

// Coupon type based on generated database types
export type Coupon = Tables<"coupons">;
export type Order = Tables<"orders">;
export type UserPayment = Tables<"user_payments">;
export type PaymentOption = Tables<"payment_options">;

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
    console.log("Manually validating coupon:", {
      code,
      customerEmail,
      orderTotal,
      productIds,
    });

    // Get current user to check usage
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    // Get customer's coupon usage history by user_id
    let usageHistory = [];
    if (user) {
      const { data: history, error: usageError } = await supabase
        .from("coupon_usage")
        .select("*")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id);

      if (usageError) {
        console.error("Error fetching coupon usage:", usageError);
        return {
          coupon_id: coupon.id,
          discount_amount: 0,
          message: "Error validating coupon usage",
          valid: false,
        };
      }
      usageHistory = history || [];
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

    // Check usage limit
    if (
      coupon.usage_limit &&
      usageHistory &&
      usageHistory.length >= coupon.usage_limit
    ) {
      return {
        coupon_id: coupon.id,
        discount_amount: 0,
        message: "Coupon usage limit exceeded",
        valid: false,
      };
    }

    // Check first-time only restriction
    if (coupon.first_time_only && usageHistory && usageHistory.length > 0) {
      return {
        coupon_id: coupon.id,
        discount_amount: 0,
        message: "Coupon is for first-time customers only",
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

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal);

    return {
      coupon_id: coupon.id,
      discount_amount: discountAmount,
      message: "Coupon applied successfully",
      valid: true,
    };
  } catch (error) {
    console.error("Error in manual coupon validation:", error);
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
    // Get current user to get user_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found for coupon usage");
      return false;
    }

    // Insert coupon usage record directly instead of using RPC function
    const { error } = await supabase.from("coupon_usage").insert({
      coupon_id: couponId,
      user_id: user.id, // Use user_id instead of customer_email
      discount_amount: discountAmount,
      order_id: orderId,
      used_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error applying coupon usage:", error);
      return false;
    }

    return true;
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
    console.log("=== CREATE ORDER STARTED ===");
    console.log("Order data received:", orderData);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("Authenticated user:", user?.id || "No user");

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

    console.log("Order totals calculated:", orderTotals);

    // Prepare order data using generated types
    const orderPayload = {
      user_id: user?.id || "", // Required field, use empty string if no user
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone || undefined,
      shipping_address: orderData.shipping_address,
      total_amount: orderData.total_amount,
      discount_amount: discountAmount,
      delivery_charge: orderData.delivery_charge,
      remaining_amount: orderTotals.remainingAmount || null,
      coupon_code: orderData.coupon_code?.toUpperCase() || null,
      coupon_discount_percentage:
        (discountAmount / orderData.total_amount) * 100 || null,
      items: orderData.items,
      notes: orderData.notes || null,
      // Set default values for required fields
      order_status: "pending",
      payment_status:
        orderData.payment_type === "full" ? "paid" : "partially_paid",
      cancellation_request: null,
      cancellation_requested_at: null,
      cancellation_reason: null,
      return_request: null,
      return_requested_at: null,
      return_reason: null,
    };

    // Create order
    console.log("Creating order with payload:", orderPayload);
    const { data: order, error } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (error) {
      console.error("Order creation failed:", error);
      throw error;
    }

    console.log("Order created successfully:", order.id);

    // Create payment record in user_payments table
    console.log("Creating payment record with payload:", {
      order_id: order.id,
      user_id: user?.id || null,
      payment_option_id: orderData.payment_method, // Now this is the UUID directly
      payment_type: orderData.payment_type,
      paid_amount: orderTotals.partialPaymentAmount || orderTotals.totalAmount,
      remaining_amount: orderTotals.remainingAmount || 0,
      paid_amount_percentage:
        orderData.payment_type === "partial"
          ? orderData.partial_payment_percentage || 50
          : 100,
      payment_screenshot: paymentScreenshotUrl || "",
      is_verified: false,
    });

    const { data: payment, error: paymentError } = await supabase
      .from("user_payments")
      .insert({
        order_id: order.id,
        user_id: user?.id || null,
        payment_option_id: orderData.payment_method, // Now this is the UUID directly
        payment_type: orderData.payment_type,
        paid_amount:
          orderTotals.partialPaymentAmount || orderTotals.totalAmount,
        remaining_amount: orderTotals.remainingAmount || 0,
        paid_amount_percentage:
          orderData.payment_type === "partial"
            ? orderData.partial_payment_percentage || 50
            : 100,
        payment_screenshot: paymentScreenshotUrl || "",
        is_verified: false, // Will be verified by admin
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      console.error("Payment payload that failed:", {
        order_id: order.id,
        user_id: user?.id || null,
        payment_option_id: orderData.payment_method,
        payment_type: orderData.payment_type,
        paid_amount:
          orderTotals.partialPaymentAmount || orderTotals.totalAmount,
        remaining_amount: orderTotals.remainingAmount || 0,
        paid_amount_percentage:
          orderData.payment_type === "partial"
            ? orderData.partial_payment_percentage || 50
            : 100,
        payment_screenshot: paymentScreenshotUrl || "",
        is_verified: false,
      });
      // Don't throw error here, order is already created
      // But log the error for debugging
    } else {
      console.log("Payment record created successfully:", payment);
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

// Simple cancellation request functions
export async function requestOrderCancellation(
  orderId: string,
  reason: string,
  userId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        message: "Order not found or you don't have permission to cancel it",
      };
    }

    // Check if order can be cancelled (within 24 hours and not already processed)
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const hoursSinceOrder =
      (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceOrder > 24) {
      return {
        success: false,
        message: "Orders can only be cancelled within 24 hours of placement",
      };
    }

    if (
      order.status === "cancelled" ||
      order.status === "shipped" ||
      order.status === "delivered"
    ) {
      return {
        success: false,
        message: "This order cannot be cancelled",
      };
    }

    // Update order with cancellation request
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        cancellation_request: true,
        cancellation_reason: reason,
        cancellation_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating cancellation request:", updateError);
      return {
        success: false,
        message: "Failed to submit cancellation request. Please try again.",
      };
    }

    return {
      success: true,
      message:
        "Cancellation request submitted successfully. We'll process it within 24 hours.",
    };
  } catch (error) {
    console.error("Error requesting cancellation:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function withdrawCancellationRequest(
  orderId: string,
  userId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        cancellation_request: false,
        cancellation_reason: null,
        cancellation_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error withdrawing cancellation request:", error);
      return {
        success: false,
        message: "Failed to withdraw cancellation request. Please try again.",
      };
    }

    return {
      success: true,
      message: "Cancellation request withdrawn successfully.",
    };
  } catch (error) {
    console.error("Error withdrawing cancellation request:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

// Helper function to get welcome message for non-logged users
export function getWelcomeMessage(): string {
  return "Sign up and get up to 30% off on your first order!";
}
