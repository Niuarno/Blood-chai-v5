"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import toast from "react-hot-toast";

type Emergency = {
  id: string;
  blood_group: string;
  hospital: string;
  mobile: string;
  notes: string;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

export default function AdminEmergencyPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchEmergencies = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("emergency_requests")
      .select(`
        id, blood_group, hospital, mobile, notes, status, created_at,
        profiles(full_name)
      `)
      .order("created_at", { ascending: false });

    setEmergencies((data as unknown as Emergency[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmergencies();
  }, [supabase]);

  const markResolved = async (id: string) => {
    try {
      const { error } = await supabase.from("emergency_requests").update({ status: "resolved" }).eq("id", id);
      if (error) throw error;
      toast.success("Marked as resolved");
      fetchEmergencies();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" /> Emergency Callouts
          </h1>
          <p className="text-gray-400">Manage and resolve public emergency broadcast requests.</p>
        </div>
      </SlideIn>

      <FadeIn delay={0.1}>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        ) : emergencies.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No emergency callouts</h3>
            <p className="text-gray-400">The platform is running smoothly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencies.map(em => (
              <div key={em.id} className={`glass-card p-6 flex flex-col relative overflow-hidden ${em.status === 'active' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'opacity-70 delay-100 border-surface-border'}`}>
                {em.status === 'active' && <div className="absolute top-0 right-0 w-2 h-full bg-red-500 animate-pulse" />}
                {em.status === 'resolved' && <div className="absolute top-0 right-0 w-2 h-full bg-green-500" />}
                
                <div className="flex justify-between items-start mb-4">
                  <span className="blood-group-badge text-xl px-4 py-1.5 shadow-[0_0_10px_rgba(198,40,40,0.3)]">{em.blood_group}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${em.status === 'active' ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                    {em.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-grow text-sm text-gray-300">
                  <p><strong className="text-gray-500">Hospital:</strong> {em.hospital}</p>
                  <p><strong className="text-gray-500">Contact:</strong> {em.mobile}</p>
                  <p><strong className="text-gray-500">Requester:</strong> {em.profiles?.full_name || "Anonymous / Unregistered"}</p>
                  <p><strong className="text-gray-500">Time:</strong> {new Date(em.created_at).toLocaleString()}</p>
                  {em.notes && (
                    <div className="bg-surface-DEFAULT border border-surface-border p-3 rounded-lg text-xs italic text-gray-400 mt-2">
                      "{em.notes}"
                    </div>
                  )}
                </div>

                {em.status === 'active' && (
                  <button 
                    onClick={() => markResolved(em.id)}
                    className="w-full bg-surface-DEFAULT hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/50 text-gray-300 border border-surface-border font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
