"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Activity, AlertCircle, Building2, 
  CreditCard, Bell, Gift, ShieldAlert, LogOut, Droplets 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/users", label: "All Users", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/requests", label: "Blood Requests", icon: <Activity className="w-5 h-5" /> },
    { href: "/admin/emergency", label: "Emergency Callouts", icon: <AlertCircle className="w-5 h-5" /> },
    { href: "/admin/blood-banks", label: "Blood Banks", icon: <Building2 className="w-5 h-5" /> },
    { href: "/admin/payment", label: "Payment Settings", icon: <CreditCard className="w-5 h-5" /> },
    { href: "/admin/notices", label: "Notices", icon: <Bell className="w-5 h-5" /> },
    { href: "/admin/rewards", label: "Rewards & Points", icon: <Gift className="w-5 h-5" /> },
    { href: "/admin/reports", label: "Donor Reports", icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-surface-card border-r border-surface-border flex-shrink-0 md:h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-surface-border">
          <Link href="/" className="flex items-center gap-2">
            <Droplets className="w-7 h-7 text-blood" />
            <span className="text-xl font-bold text-white">Blood<span className="text-blood">Chai</span> <span className="text-xs text-blood-light block -mt-1 uppercase tracking-widest font-black">Admin</span></span>
          </Link>
        </div>

        <nav className="p-4 space-y-1.5 flex-grow overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? "bg-blood text-white shadow-lg shadow-blood/20" 
                    : "text-gray-400 hover:bg-surface-border hover:text-white"
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
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all font-medium text-sm"
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
