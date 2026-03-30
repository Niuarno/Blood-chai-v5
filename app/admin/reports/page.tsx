"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, UserX, AlertTriangle, Eye } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

type Report = {
  id: string;
  reason: string;
  created_at: string;
  donor: { id: string; full_name: string; active: boolean };
  reporter: { full_name: string };
  blood_requests: { urgency: string; hospital_address: string } | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reports")
        .select(`
          id, reason, created_at,
          donor:profiles!reports_donor_id_fkey(id, full_name, active),
          reporter:profiles!reports_reporter_id_fkey(full_name),
          blood_requests:request_id(urgency, hospital_address)
        `)
        .order("created_at", { ascending: false });

      setReports((data as unknown as Report[]) || []);
      setLoading(false);
    };

    fetchReports();
  }, [supabase]);

  const toggleDonorStatus = async (donorId: string, currentStatus: boolean, reportId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ active: !currentStatus }).eq("id", donorId);
      if (error) throw error;
      
      toast.success(`Donor marked ${!currentStatus ? 'Active' : 'Inactive'}`);
      
      // Update local state to reflect change across all reports for this donor
      setReports(reports.map(r => 
        r.donor.id === donorId 
          ? { ...r, donor: { ...r.donor, active: !currentStatus } } 
          : r
      ));
    } catch (err: any) {
      toast.error(err.message || "Failed to update donor status");
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Dismiss this report completely?")) return;
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Report dismissed");
      setReports(reports.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error("Failed to dismiss");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-yellow-500" /> Internal Reports
          </h1>
          <p className="text-gray-400">Review feedback submitted by recipients regarding unresponsive or unreliable donors.</p>
        </div>
      </SlideIn>

      <FadeIn delay={0.1}>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <ShieldAlert className="w-12 h-12 text-surface-border mx-auto mb-4" />
            <p className="text-gray-400">No reports submitted. The collective is healthy.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div key={report.id} className="glass-card p-6 border-l-4 border-yellow-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Reported on {format(parseISO(report.created_at), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-gray-500">From Request: {report.blood_requests?.hospital_address || "Unknown"}</span>
                  </div>

                  <div className="bg-surface-DEFAULT border border-surface-border p-4 rounded-xl relative">
                    <p className="text-sm text-gray-300">"{report.reason}"</p>
                    <div className="mt-3 pt-3 border-t border-surface-border flex justify-between text-xs text-gray-500">
                      <span>Submitted by: <strong>{report.reporter?.full_name || "Unknown"}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 bg-surface-DEFAULT p-4 rounded-xl border border-surface-border flex flex-col gap-3 shrink-0">
                  <div className="text-sm">
                    <span className="text-gray-400">Target Donor:</span>
                    <br/>
                    <strong className="text-white text-base">{report.donor?.full_name || "Unknown"}</strong>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm font-medium">
                    Status: <span className={report.donor?.active ? "text-green-400" : "text-red-400"}>
                      {report.donor?.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => toggleDonorStatus(report.donor.id, report.donor.active, report.id)}
                      className="btn-secondary py-2 px-3 text-xs flex-1 flex justify-center items-center gap-1 border-surface-border"
                    >
                      <UserX className="w-3 h-3" />
                      {report.donor?.active ? "Ban" : "Unban"}
                    </button>
                    <Link 
                      href={`/admin/donors/${report.donor?.id}`}
                      className="btn-primary py-2 px-3 text-xs flex-1 flex justify-center items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Profile
                    </Link>
                  </div>

                  <button 
                    onClick={() => deleteReport(report.id)}
                    className="text-xs text-red-500 hover:text-red-400 text-center mt-1"
                  >
                    Dismiss Report
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
