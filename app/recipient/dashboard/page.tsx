"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SlideIn, FadeIn } from "@/components/animations";
import { Activity, ShieldAlert, CheckCircle2, Phone, Search } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type BloodRequest = {
  id: string;
  donor_id: string;
  recipient_id: string;
  hospital_address: string;
  urgency: string;
  status: string; // pending, accepted, completed, declined
  created_at: string;
  profiles: { // donor profile
    full_name: string;
    blood_group: string;
  };
};

export default function RecipientDashboard() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reporting state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReq, setReportingReq] = useState<BloodRequest | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const supabase = createClient();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requestData } = await supabase
        .from("blood_requests")
        .select(`
          id, donor_id, recipient_id, hospital_address, urgency, status, created_at,
          profiles!blood_requests_donor_id_fkey(full_name, blood_group)
        `)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (requestData) {
        setRequests(requestData as unknown as BloodRequest[]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [supabase]);

  const handleApproveDonation = async (req: BloodRequest) => {
    try {
      // Set status to completed
      const { error: updError } = await supabase.from("blood_requests").update({ status: "completed" }).eq("id", req.id);
      if (updError) throw updError;

      // Insert into donation_history
      const { error: histError } = await supabase.from("donation_history").insert([{
        donor_id: req.donor_id,
        recipient_id: req.recipient_id,
        request_id: req.id,
        // donated_at will default to now() via DB
      }]);
      if (histError) throw histError;

      // Reward points & last donation date are updated via database triggers automatically.
      // (We will create these triggers in the schema.sql)

      toast.success("Donation Confirmed! Thank you.");
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: "completed" } : r));
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm donation.");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReq) return;
    setReporting(true);

    try {
      const { error } = await supabase.from("reports").insert([{
        reporter_id: reportingReq.recipient_id,
        donor_id: reportingReq.donor_id,
        request_id: reportingReq.id,
        reason: reportReason
      }]);
      if (error) throw error;

      toast.success("Donor reported. Admins will investigate.");
      setReportModalOpen(false);
      setReportReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report.");
    } finally {
      setReporting(false);
      setReportingReq(null);
    }
  };

  const openReportMenu = (req: BloodRequest) => {
    setReportingReq(req);
    setReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 relative">
      <SlideIn>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Blood Requests</h1>
            <p className="text-gray-400">Track the status of your requested donors.</p>
          </div>
          <Link href="/find-blood" className="btn-primary flex justify-center items-center gap-2">
            <Search className="w-4 h-4" /> Find More Blood
          </Link>
        </div>
      </SlideIn>

      <FadeIn delay={0.1}>
        {requests.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Activity className="w-12 h-12 text-surface-border mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No requests sent yet</h3>
            <p className="text-gray-400">Go to Find Blood and request a donor to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((req, i) => (
              <div key={req.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ animationDelay: `${i * 0.05}s` }}>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-white">Donor: {req.profiles?.full_name}</span>
                    <span className="blood-group-badge">{req.profiles?.blood_group}</span>
                    <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider
                      ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                        req.status === 'accepted' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        req.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-red-900/40 text-red-400 border border-red-900'}
                    `}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 flex flex-wrap gap-x-6 gap-y-2">
                    <span><strong className="text-gray-300">Hospital:</strong> {req.hospital_address}</span>
                    <span><strong className="text-gray-300">Date:</strong> {new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[160px]">
                  {req.status === "pending" && (
                    <div className="text-sm text-center text-gray-500 italic p-3 bg-surface-DEFAULT rounded-xl border border-surface-border">
                      Waiting for donor<br/>to respond
                    </div>
                  )}
                  
                  {req.status === "declined" && (
                    <div className="text-sm text-center text-red-400 p-3 bg-red-950/20 rounded-xl border border-red-900/50">
                      Donor has<br/>declined request
                    </div>
                  )}

                  {req.status === "accepted" && (
                    <>
                      <button 
                        onClick={() => handleApproveDonation(req)}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Confirm Donation
                      </button>
                      
                      <button 
                        onClick={() => openReportMenu(req)}
                        className="btn-ghost py-2 px-4 shadow-none border-none text-red-500 flex items-center justify-center gap-2 hover:bg-red-950/30 text-xs"
                      >
                        <ShieldAlert className="w-4 h-4" /> Report Unavailability
                      </button>
                    </>
                  )}

                  {req.status === "completed" && (
                    <div className="text-sm text-center text-green-400 p-3 bg-green-950/20 rounded-xl border border-green-900/50 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Thank you
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>

      {/* Report Modal */}
      {reportModalOpen && reportingReq && (
        <div className="modal-overlay z-50">
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Report Donor</h2>
            <p className="text-sm text-gray-400 mb-6">
              Only report if the donor accepted but did not show up or communicate properly. False reports will lead to a ban.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="input-label">Reason for report</label>
                <textarea
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Explain what happened..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setReportModalOpen(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={reporting} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex-1 transition-colors">
                  {reporting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
