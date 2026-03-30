"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { divisions, getDistricts, getUpazilas } from "@/lib/bangladesh-locations";
import { Search, MapPin, Phone, Mail, Building2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FadeIn, SlideIn } from "@/components/animations";

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

export default function BloodBanksPage() {
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => { setDistrict(""); setUpazila(""); }, [division]);
  useEffect(() => { setUpazila(""); }, [district]);

  // Initial load or filter change
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        let query = supabase.from("blood_banks").select("*").order("name");
        
        if (division) query = query.eq("division", division);
        if (district) query = query.eq("district", district);
        if (upazila) query = query.eq("upazila", upazila);
        
        const { data, error } = await query;
        if (error) throw error;
        
        setBanks(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanks();
  }, [division, district, upazila, supabase]);

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <SlideIn>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
              <Building2 className="w-10 h-10 text-blood" />
              Blood Banks Directory
            </h1>
            <p className="text-gray-400">Find official blood banks and donation centers near you.</p>
          </div>
        </SlideIn>

        <FadeIn delay={0.1}>
          <div className="glass-card p-6 mb-12 flex flex-col md:flex-row gap-4">
            
            <div className="flex-1">
              <label className="input-label">Division</label>
              <select 
                className="input-field appearance-none w-full"
                value={division}
                onChange={e => setDivision(e.target.value)}
              >
                <option value="">All Divisions</option>
                {divisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex-1">
              <label className="input-label">District</label>
              <select 
                className="input-field appearance-none w-full"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                disabled={!division}
              >
                <option value="">All Districts</option>
                {division && getDistricts(division).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex-1">
              <label className="input-label">Upazila</label>
              <select 
                className="input-field appearance-none w-full"
                value={upazila}
                onChange={e => setUpazila(e.target.value)}
                disabled={!district}
              >
                <option value="">All Upazilas</option>
                {district && getUpazilas(division, district).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        ) : (
          <FadeIn delay={0.2}>
            {banks.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No blood banks found</h3>
                <p className="text-gray-400">We don't have records for this specific area yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banks.map((bank, i) => (
                  <div key={bank.id} className="glass-card glass-card-hover p-6 flex flex-col" style={{ animationDelay: `${i * 0.05}s` }}>
                    <h3 className="text-xl font-bold text-white mb-4 line-clamp-2">{bank.name}</h3>
                    
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-start gap-3 text-gray-400 text-sm">
                        <MapPin className="w-5 h-5 text-blood-light shrink-0 mt-0.5" />
                        <span>{bank.address}<br/>{bank.upazila}, {bank.district}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Phone className="w-5 h-5 text-blood-light shrink-0" />
                        <a href={`tel:${bank.phone}`} className="hover:text-blood-light transition-colors">{bank.phone}</a>
                      </div>
                      {bank.email && (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          <Mail className="w-5 h-5 text-blood-light shrink-0" />
                          <a href={`mailto:${bank.email}`} className="hover:text-blood-light transition-colors line-clamp-1">{bank.email}</a>
                        </div>
                      )}
                    </div>
                    
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + " " + bank.district)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
                    >
                      View on Map <ExternalLink className="w-4 h-4" />
                    </a>
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
