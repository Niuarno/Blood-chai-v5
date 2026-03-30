"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Droplets, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/animations";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "donor" ? "donor" : "recipient";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"donor" | "recipient">(initialRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Registration failed. Please try again.");

      // 2. Create profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          full_name: name,
          role,
          active: role === "donor", // Donors active by default
          points: 0,
        },
      ]);

      if (profileError) throw profileError;

      // Registration successful!
      // In a real app we might check if email confirmation is required.
      // Assuming auto-confirm for now:
      router.push(role === "donor" ? "/donor/dashboard" : "/recipient/dashboard");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-12">
      <div className="fixed inset-0 z-0 hero-gradient pointer-events-none" />
      
      <FadeIn className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 shadow-2xl shadow-blood/10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Droplets className="w-8 h-8 text-blood" />
              <span className="text-2xl font-bold text-white">Blood<span className="text-blood">Chai</span></span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Join to save lives or request blood</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("donor")}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  role === "donor"
                    ? "bg-blood/20 border-blood text-white shadow-[0_0_15px_rgba(198,40,40,0.3)]"
                    : "bg-surface-card border-surface-border text-gray-400 hover:border-gray-600"
                }`}
              >
                <Droplets className={`w-6 h-6 ${role === "donor" ? "text-blood-light" : ""}`} />
                <span className="text-sm font-semibold">I want to Donate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("recipient")}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  role === "recipient"
                    ? "bg-blood/20 border-blood text-white shadow-[0_0_15px_rgba(198,40,40,0.3)]"
                    : "bg-surface-card border-surface-border text-gray-400 hover:border-gray-600"
                }`}
              >
                <User className={`w-6 h-6 ${role === "recipient" ? "text-blood-light" : ""}`} />
                <span className="text-sm font-semibold">I need Blood</span>
              </button>
            </div>

            <div>
              <label className="input-label" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-11"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters long.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 border-t border-surface-border pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blood-light hover:text-white font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blood animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

