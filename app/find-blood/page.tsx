"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { divisions, getDistricts, getUpazilas, bloodGroups } from "@/lib/bangladesh-locations";
import { Search, MapPin, Droplet, User as UserIcon, Calendar, CheckCircle2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import RequestBloodModal from "@/components/RequestBloodModal";
import { FadeIn, SlideIn } from "@/components/animations";

type DonorPreview = {
  id: string; // auth.users.id
  full_name: string; // from raw_user_meta_data
  avatar_url: string | null;
  blood_group: string;
  division: string;
  district: string;
  upazila: string;
  active: boolean;
  last_donation_at: string | null; // calculated from donation_history
};

export default function FindBloodPage() {
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  
  const [donors, setDonors] = useState<DonorPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [selectedDonor, setSelectedDonor] = useState<{id: string, full_name: string} | null>(null);

  const supabase = createClient();

  // Reset dependent filters
  useEffect(() => { setDistrict(""); setUpazila(""); }, [division]);
  useEffect(() => { setUpazila(""); }, [district]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!division) return; // Basic validation
    
    setLoading(true);
    setSearched(true);
    
    // We need to fetch from profiles. Because we want full name, we have to look up users via an RPC or 
    // we assume we store full_name in the profiles table to make querying easier.
    // *Important Design Choice*: The implementation plan mentions extending auth.users in profiles.
    // We will assume profiles has: id, full_name, avatar_url, blood_group, division, district, upazila, active.
    
    try {
      let query = supabase.from("profiles")
        .select("id, full_name, avatar_url, blood_group, division, district, upazila, active")
        .eq("role", "donor")
        .eq("division", division);
        
      if (district) query = query.eq("district", district);
      if (upazila) query = query.eq("upazila", upazila);
      if (bloodGroup) query = query.eq("blood_group", bloodGroup);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter out only available in frontend (per requirement: show available/unavailable with labels, but after selection only show available if required. Actually requirement says "after user selects area it should only show the available donors"). Wait, let's just fetch all and only render active ones, or render both with clear badges.
      // Requirement: "after a user selects a area it should only show the available donors" - Ok, let's filter purely active.
      const activeDonors = (data || []).filter(d => d.active);
      setDonors(activeDonors as unknown as DonorPreview[]);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Header />
      
      {selectedDonor && (
        <RequestBloodModal 
          donor={selectedDonor} 
          onClose={() => setSelectedDonor(null)} 
        />
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <SlideIn>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3">Find Blood Donors</h1>
            <p className="text-gray-400">Search available donors in your area instantly.</p>
          </div>
        </SlideIn>

        <FadeIn delay={0.1}>
          <div className="glass-card p-6 md:p-8 mb-12">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div>
                <label className="input-label">Division <span className="text-blood">*</span></label>
                <select 
                  className="input-field appearance-none"
                  value={division}
                  onChange={e => setDivision(e.target.value)}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">District</label>
                <select 
                  className="input-field appearance-none"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  disabled={!division}
                >
                  <option value="">All Districts</option>
                  {division && getDistricts(division).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Upazila</label>
                <select 
                  className="input-field appearance-none"
                  value={upazila}
                  onChange={e => setUpazila(e.target.value)}
                  disabled={!district}
                >
                  <option value="">All Upazilas</option>
                  {district && getUpazilas(division, district).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Blood Group</label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-3.5 w-4 h-4 text-blood" />
                  <select 
                    className="input-field appearance-none pl-9"
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                  >
                    <option value="">Any Group</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button type="submit" disabled={loading} className="btn-primary w-full h-[50px] flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                  Search
                </button>
              </div>
            </form>
          </div>
        </FadeIn>

        {/* Results */}
        {searched && !loading && (
          <FadeIn delay={0.2} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Search Results <span className="bg-blood/20 text-blood-light px-2 py-0.5 rounded-md text-sm">{donors.length}</span>
              </h2>
            </div>
            
            {donors.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No donors found</h3>
                <p className="text-gray-400">Try broadening your search criteria or submit an emergency request.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {donors.map((donor, i) => (
                  <div key={donor.id} className="glass-card glass-card-hover p-6 flex flex-col" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-start justify-between mb-4">
                      <Avatar url={donor.avatar_url} name={donor.full_name} size={56} />
                      <div className="flex flex-col items-end gap-2">
                        <span className="blood-group-badge text-lg px-3 py-1">{donor.blood_group}</span>
                        <span className="badge-available">Available</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{donor.full_name}</h3>
                    
                    <div className="space-y-2 mb-6 text-sm text-gray-400 flex-grow">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{donor.upazila}, {donor.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Ready to donate</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedDonor({ id: donor.id, full_name: donor.full_name })}
                      className="btn-primary w-full py-2.5 text-sm"
                    >
                      Request Blood
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FadeIn>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
