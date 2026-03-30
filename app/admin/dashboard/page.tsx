import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";

export const revalidate = 0; // Always dynamic

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: totalUsers },
    { count: donorsCount },
    { count: totalRequests },
    { count: completedRequests },
    { count: activeEmergencies },
    { count: openReports }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "donor"),
    supabase.from("blood_requests").select("*", { count: "exact", head: true }),
    supabase.from("blood_requests").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("emergency_requests").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("reports").select("*", { count: "exact", head: true })
  ]);

  const cards = [
    { label: "Total Users", value: totalUsers, icon: <Users className="w-8 h-8 text-blue-500" />, bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Registered Donors", value: donorsCount, icon: <HeartIcon className="w-8 h-8 text-blood" />, bg: "bg-blood/10", border: "border-blood/20" },
    { label: "Total Requests", value: totalRequests, icon: <Activity className="w-8 h-8 text-orange-500" />, bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { label: "Successful Donations", value: completedRequests, icon: <CheckCircle2 className="w-8 h-8 text-green-500" />, bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Active Emergencies", value: activeEmergencies, icon: <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />, bg: "bg-red-500/20", border: "border-red-500/50" },
    { label: "Total Reports", value: openReports, icon: <ShieldAlertIcon className="w-8 h-8 text-yellow-500" />, bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
          <p className="text-gray-400">High-level statistics and real-time platform health.</p>
        </div>
      </SlideIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <FadeIn key={i} delay={i * 0.05} className={`p-6 rounded-2xl border ${c.bg} ${c.border} flex items-center justify-between`}>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">{c.label}</p>
              <h3 className="text-4xl font-black text-white">{c.value || 0}</h3>
            </div>
            {c.icon}
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// Minimal icons wrapper for server component to avoid importing full lucide in the chunk repeatedly if not needed
function HeartIcon(props: any) {
  return <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />;
}
function ShieldAlertIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
    </svg>
  );
}
