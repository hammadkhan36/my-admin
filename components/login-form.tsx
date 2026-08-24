// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Mail, Lock, Eye, EyeOff } from "lucide-react";
// import { siteConfig } from "@/lib/site-config";

// export function LoginForm() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     // Yahan actual authentication API call kar sakte ho
//     // Demo ke liye 1 second delay karke redirect
//     setTimeout(() => {
//       router.push("/dashboard");
//     }, 1000);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       <div className="space-y-2 text-center lg:text-left">
//         <h2 className="text-2xl font-bold">Welcome back</h2>
//         <p className="text-muted-foreground">
//           Sign in to your {siteConfig.shortName} account
//         </p>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="email">Email</Label>
//         <div className="relative">
//           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             id="email"
//             type="email"
//             placeholder="name@company.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="pl-10 h-10"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <Label htmlFor="password">Password</Label>
//           <Link
//             href="/forgot-password"
//             className="text-sm text-muted-foreground hover:text-primary transition-colors"
//           >
//             Forgot password?
//           </Link>
//         </div>
//         <div className="relative">
//           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             id="password"
//             type={showPassword ? "text" : "password"}
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="pl-10 pr-10 h-10"
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//           >
//             {showPassword ? (
//               <EyeOff className="h-4 w-4" />
//             ) : (
//               <Eye className="h-4 w-4" />
//             )}
//           </button>
//         </div>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Checkbox id="remember" />
//         <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
//           Remember me
//         </Label>
//       </div>

//       <Button
//         type="submit"
//         className="w-full h-10 font-semibold"
//         disabled={isLoading}
//       >
//         {isLoading ? "Signing in..." : "Sign in"}
//       </Button>

//       <div className="text-center text-sm text-muted-foreground">
//         Don&apos;t have an account?{" "}
//         <Link href="/signup" className="text-primary hover:underline">
//           Sign up
//         </Link>
//       </div>
//     </form>
//   );
// }







"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }

      // Fetch profile role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        toast.error("Profile not found. Contact support.");
        return;
      }

      if (profile?.role === "superadmin") {
        router.push("/super-admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10 h-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" />
        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
          Remember me
        </Label>
      </div>

      <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}