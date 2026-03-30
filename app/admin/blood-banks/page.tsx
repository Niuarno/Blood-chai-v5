"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Copy, MapPin, Building2, Trash2, Plus, Loader2 } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import { divisions, getDistricts, getUpazilas } from "@/lib/bangladesh-locations";
import toast from "react-hot-toast";

type BloodBank = {
  id: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  phone: string;
  email: string | null;
};

export default function AdminBloodBanksPage() {
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", division: "", district: "", upazila: "", address: "", phone: "", email: ""
  });

  const supabase = createClient();

  const fetchBanks = async () => {
    setLoading(true);
    const { data } = await supabase.from("blood_banks").select("*").order("name");
    setBanks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanks();
  }, [supabase]);

  // Handle dependent Location dropdown resets
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(p => ({ ...p, division: e.target.value, district: "", upazila: "" }));
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(p => ({ ...p, district: e.target.value, upazila: "" }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("blood_banks").insert([formData]);
      if (error) throw error;
      
      toast.success("Blood bank added successfully.");
      setFormData({ name: "", division: "", district: "", upazila: "", address: "", phone: "", email: "" });
      fetchBanks();
    } catch (err: any) {
      toast.error(err.message || "Failed to add blood bank");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const { error } = await supabase.from("blood_banks").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Deleted");
      setBanks(banks.filter(b => b.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blood" /> Blood Banks Management
          </h1>
          <p className="text-gray-400">Add, view, and manage external blood banks in the public directory.</p>
        </div>
      </SlideIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <FadeIn delay={0.1} className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-surface-border pb-4">Add New Bank</h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="input-label">Name of Institution</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" />
              </div>

              <div>
                <label className="input-label">Division</label>
                <select required value={formData.division} onChange={handleDivisionChange} className="input-field appearance-none">
                  <option value="">Select...</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">District</label>
                <select required value={formData.district} onChange={handleDistrictChange} disabled={!formData.division} className="input-field appearance-none">
                  <option value="">Select...</option>
                  {formData.division && getDistricts(formData.division).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Upazila</label>
                <select required value={formData.upazila} onChange={e => setFormData({...formData, upazila: e.target.value})} disabled={!formData.district} className="input-field appearance-none">
                  <option value="">Select...</option>
                  {formData.district && getUpazilas(formData.division, formData.district).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Specific Address</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-field min-h-[80px]" />
              </div>

              <div>
                <label className="input-label">Phone</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" />
              </div>

              <div>
                <label className="input-label">Email (Optional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full py-3 mt-4 flex justify-center items-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Add Blood Bank
              </button>
            </form>
          </FadeIn>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.2}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
              </div>
            ) : banks.length === 0 ? (
              <div className="glass-card text-center py-20">
                <p className="text-gray-400">No blood banks in directory yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banks.map(bank => (
                  <div key={bank.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between gap-4 md:items-center">
                    <div className="space-y-2 flex-grow">
                      <h3 className="font-bold text-white text-lg">{bank.name}</h3>
                      <div className="text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-blood-light" />
                        {bank.address}, {bank.upazila}, {bank.district}
                      </div>
                      <div className="text-sm text-gray-500 flex gap-4">
                        <span>Phone: {bank.phone}</span>
                        {bank.email && <span>Email: {bank.email}</span>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(bank.id, bank.name)}
                      className="btn-ghost flex items-center justify-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-950/20 py-2 border-none self-start sm:self-center shrink-0"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
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
