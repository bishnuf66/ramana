"use client";

import { useState } from "react";
import PaymentOrderForm from "@/components/orders/PaymentOrderForm";

// Example usage of the updated payment system
export default function OrderExample() {
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Sample cart items
  const cartItems = [
    {
      id: "1",
      title: "Product 1",
      price: 1500,
      quantity: 2
    },
    {
      id: "2", 
      title: "Product 2",
      price: 800,
      quantity: 1
    }
  ];

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOrderComplete = (order: any) => {
    console.log("Order created successfully:", order);
    console.log("Payment method:", order.payment_method);
    console.log("Payment type:", order.payment_type);
    console.log("Delivery charge:", order.delivery_charge);
    console.log("Partial payment amount:", order.partial_payment_amount);
    console.log("Remaining amount:", order.remaining_amount);
    
    setShowOrderForm(false);
    // You can redirect to order success page here
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Shopping Cart
      </h1>

      {/* Cart Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
        <div className="space-y-3 mb-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  NPR {item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Total: NPR {totalAmount}
            </span>
          </div>
          
          <button
            onClick={() => setShowOrderForm(true)}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Payment Order Form Modal */}
      {showOrderForm && (
        <PaymentOrderForm
          items={cartItems}
          totalAmount={totalAmount}
          onOrderComplete={handleOrderComplete}
          onCancel={() => setShowOrderForm(false)}
        />
      )}

      {/* Features Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
          Payment Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-700 dark:text-blue-300">Payment Methods</h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• eSewa - Full payment with QR code</li>
              <li>• Khalti - Full payment with QR code</li>
              <li>• Partial Payment - Pay 50% now, 50% on delivery</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-700 dark:text-blue-300">Delivery Charges</h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Inside Kathmandu Valley: NPR 100</li>
              <li>• Outside Kathmandu Valley: NPR 200</li>
              <li>• Real-time calculation based on location</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
