/* eslint-disable @next/next/no-img-element -- logo URL is admin-provided, host unknown */


import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getBranding } from "@/lib/branding";
import Link from "next/link";

export default async function Home() {
  const branding = await getBranding();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-blue-900 p-10 text-white">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            {branding.logo ? (
              <img
                src={branding.logo}
                alt={branding.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {branding.shortName.charAt(0)}
              </div>
            )}
            <span className="text-xl font-semibold">{branding.name}</span>
          </Link>

          <div className="mt-20">
            <h1 className="text-4xl font-bold leading-tight">
              Manage your business with ease.
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-md">
              Powerful analytics, streamlined operations, and real-time insights.
            </p>

            <div className="mt-10 space-y-4">
              {["Real-time dashboard", "Advanced analytics", "Team collaboration", "Secure & reliable"].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © {new Date().getFullYear()} {branding.name}. All rights reserved.
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="relative flex flex-col justify-center items-center p-6 lg:p-10 bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              {branding.logo ? (
                <img
                  src={branding.logo}
                  alt={branding.name}
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {branding.shortName.charAt(0)}
                </div>
              )}
              <span className="text-lg font-semibold">{branding.name}</span>
            </Link>
          </div>

          {/* Card wrapper for form */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 lg:p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}