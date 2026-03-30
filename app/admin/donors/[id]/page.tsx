"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { SlideIn, FadeIn } from "@/components/animations";
import Avatar from "@/components/Avatar";
import { ShieldAlert, Activity, CheckCircle2, History, User } from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";

export default function AdminDonorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDonorInfo = async () => {
      setLoading(true);
      
      const { data: profData } = await supabase.from("profiles").select("*").eq("id", id).single();
      setProfile(profData);

      const { data: repData } = await supabase
        .from("reports")
        .select("id, reason, created_at, reporter:profiles!reports_reporter_id_fkey(full_name)")
        .eq("donor_id", id)
        .order("created_at", { ascending: false });
      setReports(repData || []);

      const { data: histData } = await supabase
        .from("donation_history")
        .select("id, donated_at, blood_requests:request_id(hospital_address)")
        .eq("donor_id", id)
        .order("donated_at", { ascending: false });
      setHistory(histData || []);

      setLoading(false);
    };

    fetchDonorInfo();
  }, [id, supabase]);

  const toggleActiveStatus = async () => {
    try {
      const newStatus = !profile.active;
      const { error } = await supabase.from("profiles").update({ active: newStatus }).eq("id", profile.id);
      if (error) throw error;
      
      setProfile({ ...profile, active: newStatus });
      toast.success(`Donor marked as ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const updatePoints = async (amount: number) => {
    try {
      const newPoints = Math.max(0, (profile.points || 0) + amount);
      const { error } = await supabase.from("profiles").update({ points: newPoints }).eq("id", profile.id);
      if (error) throw error;
      
      setProfile({ ...profile, points: newPoints });
      toast.success(`Points updated to ${newPoints}`);
    } catch (err: any) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" /></div>;
  if (!profile) return <div className="p-20 text-center text-gray-400">Profile not found.</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-blood" /> Donor Details
          </h1>
          <p className="text-gray-400">Inspect donor, view reports, and manually adjust status or points.</p>
        </div>
      </SlideIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Basics */}
        <div className="lg:col-span-1 space-y-6">
          <FadeIn delay={0.1} className="glass-card p-6 text-center">
            <Avatar url={profile.avatar_url} name={profile.full_name} size={100} className="mx-auto mb-4 shadow-[0_0_20px_rgba(198,40,40,0.3)]" />
            <h2 className="text-xl font-bold text-white mb-1">{profile.full_name}</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="blood-group-badge">{profile.blood_group || "N/A"}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${profile.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                {profile.active ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div className="text-sm text-gray-400 space-y-1 mb-6">
              <p>📍 {profile.upazila}, {profile.district}, {profile.division}</p>
              <p>📅 Joined {format(parseISO(profile.created_at || new Date().toISOString()), "MMM yyyy")}</p>
            </div>

            <button 
              onClick={toggleActiveStatus}
              className={`w-full py-2.5 rounded-xl font-semibold transition-all border ${
                profile.active 
                  ? 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/40' 
                  : 'bg-green-900/20 text-green-400 border-green-900/50 hover:bg-green-900/40'
              }`}
            >
              {profile.active ? 'Force Inactive Status' : 'Force Active Status'}
            </button>
          </FadeIn>

          <FadeIn delay={0.2} className="glass-card p-6">
            <h3 className="font-bold text-white mb-4">Reward Points Editor</h3>
            <div className="flex items-center justify-between bg-surface-DEFAULT p-4 rounded-xl border border-surface-border mb-4">
              <span className="text-gray-400 text-sm">Current Points</span>
              <span className="text-2xl font-black text-yellow-500">{profile.points || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updatePoints(100)} className="btn-secondary py-2 text-xs text-white border-surface-border hover:bg-surface-DEFAULT">+100</button>
              <button onClick={() => updatePoints(500)} className="btn-secondary py-2 text-xs text-white border-surface-border hover:bg-surface-DEFAULT">+500</button>
              <button onClick={() => updatePoints(-100)} className="btn-secondary py-2 text-xs text-red-400 border-surface-border hover:bg-surface-DEFAULT">-100</button>
              <button onClick={() => updatePoints(-(profile.points || 0))} className="btn-secondary py-2 text-xs text-red-400 border-surface-border hover:bg-surface-DEFAULT">Reset</button>
            </div>
          </FadeIn>
        </div>

        {/* Right Col: Reports & History */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.3} className="glass-card p-6 min-h-[50%]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Administrative Reports
            </h3>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-4 bg-surface-DEFAULT rounded-xl">No reports against this donor. Clean record.</p>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.id} className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl">
                    <p className="text-sm text-red-200 mb-2">"{r.reason}"</p>
                    <div className="flex justify-between items-center text-xs text-red-500/70 pt-2 border-t border-red-900/30">
                      <span>Reporter: {r.reporter?.full_name || "Unknown"}</span>
                      <span>{format(parseISO(r.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.4} className="glass-card p-6 min-h-[50%]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Verified Donation Drops
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-4 bg-surface-DEFAULT rounded-xl border border-surface-border">No verified drops on the system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Hospital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id}>
                        <td>{format(parseISO(h.donated_at), "MMM d, yyyy")}</td>
                        <td>{h.blood_requests?.hospital_address || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FadeIn>
        </div>
        
      </div>
    </div>
  );
}
