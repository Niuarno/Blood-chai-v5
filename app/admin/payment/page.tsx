"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Save, Loader2 } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import toast from "react-hot-toast";

type PaymentSetting = {
  id: string;
  method: string;
  number: string;
  instructions: string;
};

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<Record<string, PaymentSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("bkash");

  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from("payment_settings").select("*");
      if (data) {
        const mapped = data.reduce((acc, curr) => {
          acc[curr.method] = curr;
          return acc;
        }, {} as Record<string, PaymentSetting>);
        
        // Ensure defaults exist for the UI state
        ["bkash", "nagad", "bank"].forEach(m => {
          if (!mapped[m]) mapped[m] = { id: "", method: m, number: "", instructions: "" };
        });
        
        setSettings(mapped);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [supabase]);

  const handleSave = async (method: string) => {
    setSaving(true);
    const data = settings[method];
    try {
      if (data.id) {
        // Update
        const { error } = await supabase.from("payment_settings").update({
          number: data.number,
          instructions: data.instructions
        }).eq("id", data.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("payment_settings").insert([{
          method: data.method,
          number: data.number,
          instructions: data.instructions
        }]);
        if (error) throw error;
      }
      
      toast.success(`${method.toUpperCase()} settings saved`);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "bkash", label: "bKash" },
    { id: "nagad", label: "Nagad" },
    { id: "bank", label: "Bank Transfer" },
  ];

  if (loading) return <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blood" /> Payment Targets
          </h1>
          <p className="text-gray-400">Configure exact payment details displayed on the {"/donate"} page.</p>
        </div>
      </SlideIn>

      <FadeIn delay={0.1} className="glass-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-surface-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all min-w-[140px]
                ${activeTab === tab.id 
                  ? "text-white bg-surface-DEFAULT border-b-2 border-blood shadow-[inset_0_-2px_10px_rgba(198,40,40,0.1)]" 
                  : "text-gray-400 hover:bg-surface-card hover:text-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10">
          <div className="space-y-6 max-w-2xl animate-fade-in">
            <div>
              <label className="input-label">Account Name / Number / Method Details</label>
              <input
                type="text"
                value={settings[activeTab]?.number || ""}
                onChange={(e) => setSettings({
                  ...settings, 
                  [activeTab]: { ...settings[activeTab], number: e.target.value }
                })}
                className="input-field text-xl font-mono tracking-widest text-center"
                placeholder={activeTab === "bank" ? "Account Name, Bank Name, Acft Number..." : "e.g. 017XXXXXXXX"}
              />
            </div>

            <div>
              <label className="input-label">Payment Instructions {"(Markdown/Line breaks supported)"}</label>
              <textarea
                value={settings[activeTab]?.instructions || ""}
                onChange={(e) => setSettings({
                  ...settings, 
                  [activeTab]: { ...settings[activeTab], instructions: e.target.value }
                })}
                className="input-field min-h-[200px]"
                placeholder="1. Go to Send Money\n2. Enter the number\n3. Use Reference: DONATION"
              />
            </div>

            <button
              onClick={() => handleSave(activeTab)}
              disabled={saving}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              Save {tabs.find(t=>t.id===activeTab)?.label} Settings
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
