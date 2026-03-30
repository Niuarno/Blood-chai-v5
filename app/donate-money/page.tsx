"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Landmark, Smartphone, Copy, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FadeIn, SlideIn } from "@/components/animations";
import toast from "react-hot-toast";

type PaymentSetting = {
  method: string;
  number: string;
  instructions: string;
};

export default function DonateMoneyPage() {
  const [activeTab, setActiveTab] = useState("bkash");
  const [settings, setSettings] = useState<Record<string, PaymentSetting>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("payment_settings").select("*");
      if (data) {
        const mapped = data.reduce((acc, curr) => {
          acc[curr.method] = curr;
          return acc;
        }, {} as Record<string, PaymentSetting>);
        setSettings(mapped);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [supabase]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Account copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "bkash", label: "bKash", icon: <Smartphone className="w-5 h-5" /> },
    { id: "nagad", label: "Nagad", icon: <Smartphone className="w-5 h-5" /> },
    { id: "bank", label: "Bank Transfer", icon: <Landmark className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <SlideIn>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blood/10 border border-blood/30 mb-6 drop-shadow-[0_0_20px_rgba(198,40,40,0.2)]">
              <Heart className="w-10 h-10 text-blood-light" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4">Support Our Cause</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your financial contributions help us maintain servers, organize awareness campaigns, and continue connecting lifesavers across Bangladesh.
            </p>
          </div>
        </SlideIn>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        ) : (
          <FadeIn delay={0.2} className="glass-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-surface-border overflow-x-auto custom-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-all min-w-[140px]
                    ${activeTab === tab.id 
                      ? "text-blood-light border-b-2 border-blood-light bg-blood/5" 
                      : "text-gray-400 hover:bg-surface-card hover:text-white"
                    }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 md:p-10">
              {settings[activeTab] ? (
                <div className="animate-fade-in flex flex-col md:flex-row gap-10">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{tabs.find(t=>t.id===activeTab)?.label} Payment</h2>
                    <p className="text-gray-400 text-sm mb-6">Use the exact account details below to send your donation.</p>
                    
                    <div className="bg-black/50 border border-surface-border rounded-xl p-6 flex flex-col items-center justify-center mb-6 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blood/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-gray-500 text-sm mb-2">{activeTab === "bank" ? "Account Details" : "Account Number"}</span>
                      <span className="text-3xl font-mono font-bold text-white tracking-wider text-center">{settings[activeTab].number}</span>
                      
                      <button 
                        onClick={() => handleCopy(settings[activeTab].number)}
                        className="mt-4 flex items-center gap-2 text-sm text-blood-light hover:text-white transition-colors bg-blood/10 px-4 py-2 rounded-full"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 bg-surface-card border border-surface-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-blood" /> Instructions
                    </h3>
                    <div className="prose prose-invert prose-sm text-gray-400">
                      {/* Assuming markdown or line-breaks */}
                      {settings[activeTab].instructions.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400">Payment details for {tabs.find(t=>t.id===activeTab)?.label} are not configured yet.</p>
                </div>
              )}
            </div>
            
            <div className="bg-blood/10 border-t border-blood/20 p-4 text-center">
              <p className="text-sm text-blood-light font-medium">Important: BloodChai will never ask you for OTP or passwords. Verify details before sending.</p>
            </div>
          </FadeIn>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
