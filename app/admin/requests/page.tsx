"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, MapPin, SearchX, ShieldAlert, Heart, Calendar } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import Avatar from "@/components/Avatar";

type BloodRequest = {
  id: string;
  donor_id: string;
  recipient_id: string;
  hospital_address: string;
  urgency: string;
  mobile: string;
  notes: string;
  status: string;
  created_at: string;
  donor: { full_name: string; active: boolean; phone?: string; avatar_url?: string };
  recipient: { full_name: string; active: boolean; phone?: string; email?: string };
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      
      let query = supabase
        .from("blood_requests")
        .select(`
          id, donor_id, recipient_id, hospital_address, mobile, urgency, notes, status, created_at,
          donor:profiles!blood_requests_donor_id_fkey(full_name, active, phone, avatar_url),
          recipient:profiles!blood_requests_recipient_id_fkey(full_name, active, phone, email)
        `)
        .order("created_at", { ascending: false });
      
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data } = await query;
      // Depending on Supabase foreign keys setup (multi-foreign key to same table requires explicit !relationshipName)
      // Assuming our schema works with this select syntax. Let's fix type:
      const typedData = (data || []).map((x: any) => ({
         ...x,
         donor: Array.isArray(x.donor) ? x.donor[0] : x.donor,
         recipient: Array.isArray(x.recipient) ? x.recipient[0] : x.recipient
      })) as BloodRequest[];
      
      setRequests(typedData);
      setLoading(false);
    };

    fetchRequests();
  }, [filterStatus, supabase]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blood Requests</h1>
          <p className="text-gray-400">Monitor all requests flowing through the platform.</p>
        </div>
      </SlideIn>

      <div className="glass-card p-4">
        <select
          className="input-field appearance-none sm:w-64"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted (Waiting Confirm)</option>
          <option value="declined">Declined</option>
          <option value="completed">Completed (Successful)</option>
        </select>
      </div>

      <FadeIn delay={0.1}>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center glass-card">
            <SearchX className="w-12 h-12 text-surface-border mb-4" />
            <p className="text-gray-400">No requests found for this status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map(req => (
              <div key={req.id} className="glass-card p-6 flex flex-col lg:flex-row justify-between gap-6 border-l-4" 
                style={{ 
                  borderLeftColor: 
                    req.status === 'completed' ? '#22c55e' : 
                    req.status === 'declined' ? '#ef4444' : 
                    req.status === 'accepted' ? '#3b82f6' : 
                    '#eab308' 
                }}>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase
                      ${req.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        req.status === 'declined' ? 'bg-red-500/20 text-red-500' : 
                        req.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-yellow-500/20 text-yellow-500'}
                    `}>
                      {req.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider
                      ${req.urgency === 'critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                        req.urgency === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                        'bg-teal-500/20 text-teal-400 border border-teal-500/30'}
                    `}>
                      {req.urgency} Urgency
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300">
                    <MapPin className="w-4 h-4 inline mr-1 text-blood" /> 
                    Hospital: <span className="text-white">{req.hospital_address}</span>
                  </div>
                  {req.notes && (
                    <div className="text-sm text-gray-500 italic bg-surface-DEFAULT p-3 rounded-xl border border-surface-border">
                      "{req.notes}"
                    </div>
                  )}
                </div>

                {/* Recipient / Donor details */}
                <div className="flex flex-col sm:flex-row gap-6 lg:w-1/2">
                  
                  {/* Recipient */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Requested By (Recipient)</h4>
                    <div className="bg-surface-DEFAULT p-4 rounded-xl border border-surface-border">
                      <p className="font-bold text-white mb-1">{req.recipient?.full_name || "Unknown"}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">Phone: {req.mobile}</p>
                      <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Email: {req.recipient?.email || "N/A"}</p>
                    </div>
                  </div>

                  {/* Donor */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Targeted Donor</h4>
                    <div className="bg-surface-DEFAULT p-4 rounded-xl border border-surface-border relative overflow-hidden">
                      {req.status === 'declined' && (
                        <div className="absolute top-0 right-0 p-2 opacity-20"><SearchX className="w-10 h-10 text-red-500" /></div>
                      )}
                      {req.status === 'completed' && (
                        <div className="absolute top-0 right-0 p-2 opacity-20"><Heart className="w-10 h-10 text-green-500" /></div>
                      )}
                      <p className="font-bold text-white mb-1">{req.donor?.full_name || "Unknown"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${req.donor?.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-400">{req.donor?.active ? "Active Profile" : "Inactive Profile"}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
