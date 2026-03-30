"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, Send, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FadeIn } from "@/components/animations";
import { bloodGroups } from "@/lib/bangladesh-locations";
import toast from "react-hot-toast";

export default function EmergencyPage() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [hospital, setHospital] = useState("");
  const [mobile, setMobile] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("emergency_requests").insert([{
        requester_id: user?.id || null, // null if anonymous
        blood_group: bloodGroup,
        hospital,
        mobile,
        notes,
        status: "active"
      }]);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Emergency request broadcasted actively.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 bg-red-950/20">
      <Header />
      
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        
        <FadeIn className="text-center mb-10">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500/50 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse-slow">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Emergency Blood Request</h1>
          <p className="text-gray-300">
            Submit a broadcast request only if you've failed to find a donor in the "Find Blood" directory. 
            Admins will immediately be notified.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          {submitted ? (
            <div className="glass-card border-green-500/30 p-10 text-center bg-green-950/20">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Request Broadcasted</h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                Your emergency request has been posted on the admin board. We'll manually search and contact matched donors for you. Please keep your phone active at <strong className="text-white">{mobile}</strong>.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary">
                Submit Another Request
              </button>
            </div>
          ) : (
            <div className="glass-card p-6 md:p-8 border-t-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Needed Blood Group</label>
                    <select
                      required
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="input-field appearance-none bg-surface-card"
                    >
                      <option value="">Select Group...</option>
                      {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Contact / Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      className="input-field"
                      placeholder="e.g. 01XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Hospital & Location (Details)</label>
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                    className="input-field"
                    placeholder="Full name of Hospital, Ward/ICU info, and strict address..."
                  />
                </div>

                <div>
                  <label className="input-label">Additional Context (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Any specific instructions (e.g. number of bags needed, patient condition...)"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-red-600 hover:bg-red-700 text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <AlertCircle className="w-6 h-6" />}
                    {loading ? "Broadcasting..." : "Broadcast Emergency Need"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </FadeIn>
      </main>
      
      <Footer />
    </div>
  );
}
