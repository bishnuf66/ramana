import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const supabase = await createClient();
    const { orderId } = await params;

    // Fetch payments for the order
    const { data: payments, error: paymentsError } = await supabase
      .from("user_payments")
      .select(
        `
        *,
        payment_option:payment_options(
          payment_type,
          payment_number
        )
      `,
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      payments: payments || [],
    });
  } catch (error) {
    console.error("Error in payments API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
