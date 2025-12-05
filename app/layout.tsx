import type { Metadata } from "next";
import { CartProvider } from "@/components/context/CartContext";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import MobileHeader from "@/components/global/MobileHeader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Small Shop - Fresh Fruits",
  description: "Your one-stop shop for fresh fruits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div>
            {/* Mobile Header */}
            <div className="block md:hidden">
              <MobileHeader />
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block">
              <Header />
            </div>
          </div>
          {children}
          <Footer />
          <ToastContainer />
        </CartProvider>
      </body>
    </html>
  );
}

