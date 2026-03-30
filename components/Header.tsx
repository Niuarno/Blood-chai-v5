"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Droplets, LogOut, User, LayoutDashboard } from "lucide-react";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/find-blood", label: "Find Blood" },
  { href: "/blood-banks", label: "Blood Banks" },
  { href: "/donate-money", label: "Donate" },
  { href: "/rulebook", label: "Rulebook" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ role: string; id: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();
        setUser({ role: profile?.role ?? "recipient", id: authUser.id });
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "donor") return "/donor/dashboard";
    return "/recipient/dashboard";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-DEFAULT/95 backdrop-blur-xl border-b border-surface-border shadow-lg shadow-blood/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Droplets className="w-8 h-8 text-blood group-hover:text-blood-light transition-colors" />
              <div className="absolute inset-0 bg-blood/30 blur-xl rounded-full group-hover:bg-blood/50 transition-all" />
            </div>
            <span className="text-xl font-bold text-white">
              Blood<span className="text-blood">Chai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-sm ${pathname === link.href ? "text-blood-light" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={getDashboardLink()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 btn-secondary text-sm py-2 px-4">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-DEFAULT/98 backdrop-blur-xl border-b border-surface-border">
          <div className="px-4 py-4 flex flex-col gap-3">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm py-2 ${pathname === link.href ? "text-blood-light font-semibold" : "text-gray-400"}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-surface-border pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMenuOpen(false)} className="btn-secondary text-sm text-center">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="btn-ghost text-sm">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm text-center">Log In</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
