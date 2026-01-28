import { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Ramana | Get in Touch for Custom Bouquets",
  description:
    "Contact us for custom bouquets and special orders. Reach out via email, phone, WhatsApp, or our contact form.",
  keywords: ["contact Ramana", "flower orders", "custom bouquets"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ramana.com.np/contact" },
};

export const revalidate = 86400;

export default function ContactPage() {
  return <ContactPageClient />;
}
