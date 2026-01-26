-- Simple Orders Schema Update - Add Payment and Delivery Columns

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'esewa'::text,
ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT 'full'::text,
ADD COLUMN IF NOT EXISTS partial_payment_percentage integer NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS payment_screenshot text NULL,
ADD COLUMN IF NOT EXISTS discount_amount numeric(10, 2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_charge numeric(10, 2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS partial_payment_amount numeric(10, 2) NULL,
ADD COLUMN IF NOT EXISTS remaining_amount numeric(10, 2) NULL,
ADD COLUMN IF NOT EXISTS coupon_code text NULL,
ADD COLUMN IF NOT EXISTS coupon_discount_percentage integer NULL DEFAULT 0;
