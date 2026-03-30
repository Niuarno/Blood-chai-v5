"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Plus, Trash2, Loader2, Megaphone } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import toast from "react-hot-toast";

type Notice = {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("public");
  
  const [formData, setFormData] = useState({ title: "", body: "" });

  const supabase = createClient();

  const fetchNotices = async () => {
    setLoading(true);
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    setNotices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase.from("notices").insert([{
        type: activeTab,
        title: formData.title,
        body: formData.body
      }]);
      if (error) throw error;
      
      toast.success("Notice posted successfully");
      setFormData({ title: "", body: "" });
      fetchNotices();
    } catch (err: any) {
      toast.error(err.message || "Failed to post notice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
      setNotices(notices.filter(n => n.id !== id));
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Delete failed");
    }
  };

  const filteredNotices = notices.filter(n => n.type === activeTab);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SlideIn>
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="w-8 h-8 text-blood" />
          <h1 className="text-3xl font-bold text-white">Notice Board</h1>
        </div>
        <p className="text-gray-400">Push announcements to the Public Homepage or the internal Donor Dashboard.</p>
      </SlideIn>

      <div className="glass-card overflow-hidden">
        <div className="flex border-b border-surface-border">
          <button
            onClick={() => setActiveTab("public")}
            className={`flex-1 py-4 px-6 font-semibold transition-all text-center
              ${activeTab === "public" ? "text-white bg-surface-DEFAULT border-b-2 border-blood shadow-[inset_0_-2px_10px_rgba(198,40,40,0.1)]" : "text-gray-400 hover:bg-surface-card"}`}
          >
            Public Site Notices
          </button>
          <button
            onClick={() => setActiveTab("donor")}
            className={`flex-1 py-4 px-6 font-semibold transition-all text-center
              ${activeTab === "donor" ? "text-white bg-surface-DEFAULT border-b-2 border-blood shadow-[inset_0_-2px_10px_rgba(198,40,40,0.1)]" : "text-gray-400 hover:bg-surface-card"}`}
          >
            Donor Internal Notices
          </button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          
          <div className="lg:col-span-1 border-r border-surface-border pr-8">
            <h2 className="text-xl font-bold text-white mb-6">Create New Notice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="input-label">Headline Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" placeholder="E.g. Camp in Dhaka..." />
              </div>
              <div>
                <label className="input-label">Details</label>
                <textarea required value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="input-field min-h-[120px]" placeholder="Body of the notice..." />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Post to {activeTab === "public" ? "Public" : "Donors"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Current Active Notices</h2>
              <span className="text-sm border border-surface-border px-3 py-1 rounded-full text-gray-400">Target: {activeTab.toUpperCase()}</span>
            </div>

            {loading ? (
              <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-blood/30 border-t-blood rounded-full animate-spin" /></div>
            ) : filteredNotices.length === 0 ? (
              <div className="border border-dashed border-surface-border rounded-xl p-10 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No active announcements for {activeTab}.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotices.map((n) => (
                  <div key={n.id} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5 relative group">
                    <button 
                      onClick={() => handleDelete(n.id)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-card p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="text-lg font-bold text-white pr-10">{n.title}</h3>
                    <p className="text-xs text-blood-light font-bold my-1 tracking-wider">{new Date(n.created_at).toLocaleString()}</p>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap mt-2">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
