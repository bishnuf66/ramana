export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          discount_price: number | null;
          image_url: string;
          rating: number;
          category: 'flowers' | 'accessories' | 'fruits';
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          discount_price?: number | null;
          image_url: string;
          rating?: number;
          category: 'flowers' | 'accessories' | 'fruits';
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          discount_price?: number | null;
          image_url?: string;
          rating?: number;
          category?: 'flowers' | 'accessories' | 'fruits';
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: string;
          total_amount: number;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          items: any; // JSON array of order items
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          shipping_address: string;
          total_amount: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          items: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          shipping_address?: string;
          total_amount?: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          items?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'super_admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
      };
    };
  };
}

