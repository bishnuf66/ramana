-- Updated Orders Schema with Payment Options and Delivery Charges

-- Add new columns to orders table
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
ADD COLUMN IF NOT EXISTS coupon_discount_percentage integer NULL DEFAULT 0,

-- Add constraints
DO $$ 
BEGIN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_payment_method_check CHECK (
        payment_method = ANY (ARRAY['esewa'::text, 'khalti'::text, 'partial_payment'::text])
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_payment_type_check CHECK (
        payment_type = ANY (ARRAY['full'::text, 'partial'::text])
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_partial_payment_percentage_check CHECK (
        partial_payment_percentage >= 1 AND partial_payment_percentage <= 99
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_coupon_discount_check CHECK (
        coupon_discount_percentage >= 0 AND coupon_discount_percentage <= 100
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders USING btree (payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_type ON public.orders USING btree (payment_type);

-- Create coupons table (if not exists)
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  code text NOT NULL UNIQUE,
  discount_percentage integer NOT NULL,
  min_amount numeric(10, 2) NULL,
  max_discount numeric(10, 2) NULL,
  usage_limit integer NULL,
  usage_count integer NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_discount_check CHECK (discount_percentage > 0 AND discount_percentage <= 100)
) TABLESPACE pg_default;

-- Create index for coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons USING btree (code);

-- Insert sample coupons
INSERT INTO public.coupons (code, discount_percentage, min_amount, max_discount, expires_at) VALUES
('WELCOME30', 30, 100, 500, '2024-12-31 23:59:59'::timestamp with time zone),
('SAVE10', 10, 50, 200, '2024-12-31 23:59:59'::timestamp with time zone),
('FIRST20', 20, 200, 1000, '2024-12-31 23:59:59'::timestamp with time zone)
ON CONFLICT (code) DO NOTHING;
