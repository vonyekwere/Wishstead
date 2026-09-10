import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from '@/components/ui/ToastProvider'

export const metadata: Metadata = {
  title: "Wishstead — The Gifting House",
  description:
    "Personalized gift ideas for every person, every occasion and every budget. Discover the art of modern thoughtful gifting.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col"><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
