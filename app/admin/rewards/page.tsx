"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Gift, Save, Loader2, Sparkles } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import toast from "react-hot-toast";

export default function AdminRewardsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchRulebook = async () => {
      setLoading(true);
      const { data } = await supabase.from("reward_rules").select("*").single();
      if (data) {
        setContent(data.content || "");
      }
      setLoading(false);
    };
    fetchRulebook();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Assuming a single row with id = 1 or deleting all and inserting 1
      const { data: existing } = await supabase.from("reward_rules").select("*").limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase.from("reward_rules").update({ content }).eq("id", existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reward_rules").insert([{ content }]);
        if (error) throw error;
      }

      toast.success("Rewards rulebook updated live.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save rulebook");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Gift className="w-8 h-8 text-yellow-500" /> Rewards & Rulebook
          </h1>
          <p className="text-gray-400">Edit the comprehensive markdown rulebook that donors see on their program page.</p>
        </div>
      </SlideIn>

      <FadeIn delay={0.1}>
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blood" /> Markdown Editor
            </h2>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">You can use standard markdown syntax (e.g. # Heading, **bold**, - list).</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field min-h-[500px] font-mono text-sm leading-relaxed"
              placeholder="# BloodChai Rewards..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(198,40,40,0.3)] hover:shadow-[0_0_30px_rgba(198,40,40,0.5)]"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save changes live
          </button>
        </div>
      </FadeIn>
    </div>
  );
}
