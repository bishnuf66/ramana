import type { Metadata } from "next";
import { CartProvider } from "@/components/context/CartContext";
import { CheckoutProvider } from "@/components/context/CheckoutContext";
import { ThemeProvider } from "@/components/context/ThemeContext";
import { FavoritesProvider } from "@/components/context/FavoritesContext";
import { AuthModalProvider } from "@/components/context/AuthModalContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import PremiumHeader from "@/components/non-authenticated/PremiumHeader";
import PremiumFooter from "@/components/global/PremiumFooter";
import FloatingContact from "@/components/global/FloatingContact";
import FaviconSwitcher from "@/components/FaviconSwitcher";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import StructuredData from "@/components/seo/StructuredData";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramana - Handmade Bouquets | Kathmandu Valley, Nepal",
  description:
    "Beautiful handmade bouquets crafted with love by Ramana. Premium quality floral arrangements for every special moment in Kathmandu Valley, Nepal. Hand made by Ramana with passion and care.",
  keywords: [
    "handmade bouquets",
    "flowers Kathmandu",
    "Nepal flowers",
    "custom bouquets",
    "floral arrangements Kathmandu Valley",
    "handcrafted flowers Nepal",
    "Ramana bouquets",
    "wedding flowers",
    "birthday flowers",
    "anniversary bouquets",
    "flower delivery Kathmandu",
  ],
  authors: [{ name: "Ramana Handmade Collection" }],
  creator: "Ramana Handmade Collection",
  publisher: "Ramana Handmade Collection",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon-light.ico",
    apple: "/favicon-light.ico",
    shortcut: "/favicon-light.ico",
  },
  openGraph: {
    title: "Ramana - Handmade Bouquets | Kathmandu Valley",
    description:
      "Beautiful handmade bouquets crafted with love by Ramana in Kathmandu Valley, Nepal",
    url: "https://ramana.com.np",
    siteName: "Ramana Handmade Bouquets",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ramana.com.np/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ramana Handmade Bouquets - Beautiful Floral Arrangements in Kathmandu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramana - Handmade Bouquets | Kathmandu Valley, Nepal",
    description:
      "Beautiful handmade bouquets crafted with love by Ramana in Kathmandu Valley, Nepal",
    images: ["https://ramana.com.np/twitter-image.jpg"],
    creator: "@ramana_handmade",
    site: "@ramana_handmade",
  },
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },
  alternates: {
    canonical: "https://ramana.com.np",
    languages: {
      "en-US": "https://ramana.com.np",
      "ne-NP": "https://ramana.com.np/np",
    },
  },
  other: {
    "theme-color": "#10b981",
    "msapplication-TileColor": "#10b981",
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Ramana",
    "application-name": "Ramana",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-light.ico" type="image/x-icon" />
        <GoogleAnalytics />
        <StructuredData type="Organization" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <QueryProvider>
          <ThemeProvider>
            <AuthModalProvider>
              <CartProvider>
                <CheckoutProvider>
                  <FavoritesProvider>
                    <FaviconSwitcher />
                    <PremiumHeader />
                    <main className="pt-20">{children}</main>
                    <PremiumFooter />
                    <FloatingContact />
                    <ToastContainer
                      theme="colored"
                      toastClassName="dark:bg-gray-800 dark:text-white"
                    />
                  </FavoritesProvider>
                </CheckoutProvider>
              </CartProvider>
            </AuthModalProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
