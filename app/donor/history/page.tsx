"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { History, Calendar, Heart, ShieldAlert } from "lucide-react";
import { SlideIn, FadeIn } from "@/components/animations";
import { format, parseISO } from "date-fns";

type DonationHistory = {
  id: string;
  donated_at: string;
  blood_requests: {
    hospital_address: string;
    blood_group: string;
    profiles: { full_name: string };
  };
};

export default function DonorHistoryPage() {
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: histData } = await supabase
        .from("donation_history")
        .select(`
          id, donated_at,
          blood_requests:request_id(hospital_address, profiles!blood_requests_recipient_id_fkey(full_name))
        `)
        .eq("donor_id", user.id)
        .order("donated_at", { ascending: false });

      if (histData) setHistory(histData as unknown as DonationHistory[]);

      const { data: repData } = await supabase
        .from("reports")
        .select(`reason, created_at, profiles!reports_reporter_id_fkey(full_name)`)
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false });

      if (repData) setReports(repData);

      setLoading(false);
    };

    fetchHistory();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Track Record</h1>
          <p className="text-gray-400">Your donation history and feedback.</p>
        </div>
      </SlideIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FadeIn delay={0.1} className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blood" /> Donation History
            </h2>

            {history.length === 0 ? (
              <div className="text-center py-10">
                <Heart className="w-10 h-10 text-surface-border mx-auto mb-3" />
                <p className="text-gray-400">No successful donations recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Recipient Patient</th>
                      <th>Hospital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(item => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blood-light" />
                          {format(parseISO(item.donated_at), "dd MMM yyyy")}
                        </td>
                        <td>{item.blood_requests?.profiles?.full_name || "Unknown"}</td>
                        <td>{item.blood_requests?.hospital_address || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FadeIn>
        </div>

        <div className="lg:col-span-1">
          <FadeIn delay={0.2} className="glass-card p-6 h-full">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-surface-border pb-4">
              <ShieldAlert className="w-5 h-5 text-gray-500" /> Reports Received
            </h2>

            {reports.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">You have zero reports. Great job maintaining good conduct!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, i) => (
                  <div key={i} className="bg-red-950/20 border border-red-900/50 rounded-xl p-4">
                    <p className="text-sm text-red-200 mb-2">"{report.reason}"</p>
                    <div className="flex justify-between items-center text-xs text-red-500/70">
                      <span>By: {report.profiles?.full_name || "Recipient"}</span>
                      <span>{format(parseISO(report.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
