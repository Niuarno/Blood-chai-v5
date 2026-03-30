"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SlideIn, FadeIn } from "@/components/animations";
import { Activity, Clock, Heart, Award, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { differenceInDays, parseISO } from "date-fns";

type Profile = {
  id: string;
  points: number;
  last_donation_at: string | null;
  active: boolean;
};

type BloodRequest = {
  id: string;
  recipient_id: string;
  hospital_address: string;
  mobile: string;
  urgency: string;
  notes: string;
  status: string; // pending, accepted, completed, declined
  created_at: string;
  profiles: {
    full_name: string;
  };
};

export default function DonorDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      // 2. Requests targeted to me
      const { data: requestData } = await supabase
        .from("blood_requests")
        .select(`
          id, recipient_id, hospital_address, mobile, urgency, notes, status, created_at,
          profiles!blood_requests_recipient_id_fkey(full_name)
        `)
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false });

      if (requestData) {
        setRequests(requestData as unknown as BloodRequest[]);
      }

      // 3. Notices for donors
      const { data: noticeData } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "donor")
        .order("created_at", { ascending: false })
        .limit(3);
        
      setNotices(noticeData || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [supabase]);

  const handleRequestStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("blood_requests").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(newStatus === "accepted" ? "Request Accepted. Please coordinate with recipient." : "Request Declined.");
    } catch (err: any) {
      toast.error(err.message || "Action failed.");
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const daysSinceDonation = profile?.last_donation_at ? differenceInDays(new Date(), parseISO(profile.last_donation_at)) : null;
  const isEligible = daysSinceDonation === null || daysSinceDonation > 90; // Examply rule

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SlideIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-gray-400">Welcome back. Thank you for saving lives.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-surface-card px-4 py-3 rounded-2xl border border-surface-border">
            <Award className="w-6 h-6 text-yellow-500" />
            <div>
              <div className="text-sm text-gray-400 font-medium">Reward Points</div>
              <div className="text-xl font-bold text-white">{profile?.points || 0}</div>
            </div>
          </div>
        </div>
      </SlideIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Notices */}
        <div className="lg:col-span-1 space-y-6">
          <FadeIn delay={0.1}>
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Donation Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-DEFAULT rounded-xl border border-surface-border text-sm">
                  <span className="text-gray-400">Last Donation</span>
                  <span className={`font-bold ${daysSinceDonation !== null ? "text-white" : "text-gray-500"}`}>
                    {daysSinceDonation !== null ? `${daysSinceDonation} days ago` : "Never"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-DEFAULT rounded-xl border border-surface-border text-sm">
                  <span className="text-gray-400">Eligibility</span>
                  <span className={`font-bold ${isEligible ? "text-green-400" : "text-red-400"}`}>
                    {isEligible ? "Eligible" : "Not Eligible"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-DEFAULT rounded-xl border border-surface-border text-sm">
                  <span className="text-gray-400">Active Profile</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${profile?.active ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="font-bold text-white">{profile?.active ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blood-light" /> Donor Notices
              </h2>
              {notices.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No new notices.</p>
              ) : (
                <div className="space-y-4">
                  {notices.map(n => (
                    <div key={n.id} className="border-l-2 border-blood pl-3 py-1">
                      <h3 className="font-bold text-sm text-white">{n.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Right Column: Incoming Requests */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.3}>
            <div className="glass-card p-6 min-h-[400px]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-border pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blood" /> Blood Requests
                </h2>
                {pendingCount > 0 && (
                  <span className="bg-blood text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pendingCount} New Pending
                  </span>
                )}
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <Heart className="w-12 h-12 text-surface-border mb-4" />
                  <p className="text-gray-400 font-medium text-lg">No incoming requests</p>
                  <p className="text-sm text-gray-500 max-w-xs mt-2">When someone requests your specific blood group in your area, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req.id} className="bg-surface-DEFAULT border border-surface-border p-5 rounded-2xl relative overflow-hidden group">
                      
                      {req.status === "pending" && <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500" />}
                      {req.status === "accepted" && <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />}
                      {req.status === "declined" && <div className="absolute top-0 right-0 w-2 h-full bg-red-900" />}
                      {req.status === "completed" && <div className="absolute top-0 right-0 w-2 h-full bg-green-500" />}

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-lg">{req.profiles?.full_name || "Unknown Patient"}</span>
                            <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider
                              ${req.urgency === 'critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                                req.urgency === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                                'bg-teal-500/20 text-teal-400 border border-teal-500/30'}
                            `}>
                              {req.urgency} Urgency
                            </span>
                            <span className="badge-pending text-xs">{req.status.toUpperCase()}</span>
                          </div>
                          
                          <div className="text-sm text-gray-400 flex flex-wrap gap-x-6 gap-y-1">
                            <span><strong className="text-gray-300">Hospital:</strong> {req.hospital_address}</span>
                            <span><strong className="text-gray-300">Phone:</strong> {req.mobile}</span>
                            <span><strong className="text-gray-300">Date:</strong> {new Date(req.created_at).toLocaleString()}</span>
                          </div>

                          {req.notes && (
                            <div className="text-sm border-l-2 border-surface-border pl-3 text-gray-500 italic mt-2">
                              "{req.notes}"
                            </div>
                          )}
                        </div>

                        {req.status === "pending" && (
                          <div className="flex items-center gap-2 shrink-0 border-t border-surface-border pt-4 md:border-none md:pt-0">
                            <button 
                              onClick={() => handleRequestStatus(req.id, "accepted")}
                              className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Accept
                            </button>
                            <button 
                              onClick={() => handleRequestStatus(req.id, "declined")}
                              className="btn-ghost py-2 px-4 shadow-none border-none text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        
                        {req.status === "accepted" && (
                          <div className="shrink-0 text-sm text-blue-400 bg-blue-900/20 border border-blue-900/50 px-4 py-2 rounded-xl text-center">
                            Waiting for recipient<br/>to confirm completion
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
}
