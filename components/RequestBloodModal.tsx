"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, X, Send, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Donor {
  id: string; // auth.users.id
  full_name: string; // from auth.users via a join, or we fetch it
}

interface RequestBloodModalProps {
  donor: Donor | null;
  onClose: () => void;
}

export default function RequestBloodModal({ donor, onClose }: RequestBloodModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [hospital, setHospital] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  if (!donor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      let recipientId = user?.id;

      // 2. Auto-create account if strictly required (simplified for recipients)
      // If not logged in, we create a recipient account with auto-generated password on the fly,
      // or we ask them to use a temporary token flow. 
      // Based on requirements: "add a functionality to automatically open an account while asking for blood"
      if (!user) {
        // Generate a random email/password based on their mobile to avoid email verification friction
        const autoEmail = `${mobile.replace(/[^0-9]/g, "")}@recipient.bloodchai.com`;
        const autoPassword = Math.random().toString(36).slice(-8) + "!B";
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: autoEmail,
          password: autoPassword,
          options: {
            data: { full_name: name },
          }
        });

        if (signUpError) {
          // If phone already "registered" via this method, error will throw.
          throw new Error("Phone number seems already registered or invalid. Please Log In first.");
        }

        recipientId = signUpData.user!.id;

        // Insert profile
        await supabase.from("profiles").insert([{
          id: recipientId,
          full_name: name,
          role: "recipient",
          active: true,
          points: 0
        }]);

        // Sign them in explicitly
        await supabase.auth.signInWithPassword({
          email: autoEmail,
          password: autoPassword
        });

        toast.success(`Account created automatically. Password: ${autoPassword}`, { duration: 10000 });
      }

      // 3. Create the request
      const { error: requestError } = await supabase.from("blood_requests").insert([{
        recipient_id: recipientId,
        donor_id: donor.id,
        hospital_address: hospital,
        mobile: mobile,
        urgency: urgency,
        notes: notes,
        status: "pending"
      }]);

      if (requestError) throw requestError;

      toast.success("Blood request sent successfully!");
      
      // Target redirect to recipient dashboard
      router.push("/recipient/dashboard");
      router.refresh();
      onClose();

    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content animate-slide-up max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Request Blood</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-blood/10 border border-blood/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blood-light shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white mb-1">Requesting from {donor.full_name}</p>
            <p className="text-xs text-gray-400">
              Your details will be sent directly to the donor. If you don't have an account, one will be created automatically.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Patient / Contact Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="input-label">Mobile Number</label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="input-field"
              placeholder="e.g. 01XXXXXXXXX"
            />
          </div>

          <div>
            <label className="input-label">Hospital Address</label>
            <input
              type="text"
              required
              value={hospital}
              onChange={e => setHospital(e.target.value)}
              className="input-field"
              placeholder="Full hospital name and location"
            />
          </div>

          <div>
            <label className="input-label">Urgency</label>
            <select
              required
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
              className="input-field appearance-none bg-surface-card"
            >
              <option value="low">Low (Next few days)</option>
              <option value="medium">Medium (Within 24 hours)</option>
              <option value="critical">Critical (Immediate!)</option>
            </select>
          </div>

          <div>
            <label className="input-label">Extra Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="Any specific instructions..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
