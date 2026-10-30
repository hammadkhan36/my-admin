


import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { SupabaseConfigProvider } from "@/components/supabase-config-provider";
// import { FeaturesProvider } from "@/components/features-provider";
// import { SubscriptionProvider } from "@/components/subscription-provider";
import { Toaster } from "@/components/ui/sonner";
import { getBranding } from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  return {
    title: `${branding.name} Admin`,
    description: "Admin panel",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {/* <SupabaseConfigProvider>
              <FeaturesProvider>
                <SubscriptionProvider>
                  {children}
                  <Toaster position="top-right" />
                </SubscriptionProvider>
              </FeaturesProvider>
            </SupabaseConfigProvider> */}
            
            {children}
            <Toaster position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}