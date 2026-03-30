"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, History, Droplets, LogOut, Heart, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/donor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/donor/profile", label: "My Profile", icon: <User className="w-5 h-5" /> },
    { href: "/donor/history", label: "Donation History", icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-surface-card border-r border-surface-border flex-shrink-0 md:h-screen sticky top-0 md:flex flex-col z-20">
        <div className="p-6 border-b border-surface-border">
          <Link href="/" className="flex items-center gap-2">
            <Droplets className="w-7 h-7 text-blood" />
            <span className="text-xl font-bold text-white">Blood<span className="text-blood">Chai</span> <span className="text-xs text-gray-400 block -mt-1">Donor</span></span>
          </Link>
        </div>

        <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-blood/20 text-blood-light border border-blood/30" 
                    : "text-gray-400 hover:bg-surface-DEFAULT hover:text-white"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
