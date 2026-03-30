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
  const [loading, setLoading] = useState(true);
  
  const [selectedDonor, setSelectedDonor] = useState<{id: string, full_name: string} | null>(null);

  const supabase = createClient();

  // Reset dependent filters
  useEffect(() => { setDistrict(""); setUpazila(""); }, [division]);
  useEffect(() => { setUpazila(""); }, [district]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      let query = supabase.from("profiles")
        .select("id, full_name, avatar_url, blood_group, division, district, upazila, active")
        .eq("role", "donor");
        
      if (division) query = query.eq("division", division);
      if (district) query = query.eq("district", district);
      if (upazila) query = query.eq("upazila", upazila);
      if (bloodGroup) query = query.eq("blood_group", bloodGroup);
      
      // Limit to 100 to prevent massive payloads if no filters
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      const activeDonors = (data || []).filter(d => d.active);
      setDonors(activeDonors as unknown as DonorPreview[]);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [division, district, upazila, bloodGroup]);

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
          <div className="glass-card p-6 md:p-8 mb-12 relative">
            {loading && (
              <div className="absolute top-4 right-4">
                <div className="w-5 h-5 border-2 border-blood/50 border-t-blood rounded-full animate-spin" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
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

            </div>
          </div>
        </FadeIn>

        {/* Results */}
        {!loading && (
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
        
        {loading && donors.length === 0 && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
