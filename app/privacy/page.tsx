import { Metadata } from "next";
import PrivacyPageClient from "@/components/privacy/PrivacyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Ramana Handmade Bouquets",
  description:
    "Read Ramana's privacy policy to understand how we collect, use, and protect your personal information.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ramana.com.np/privacy" },
};

export const revalidate = 604800;

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
