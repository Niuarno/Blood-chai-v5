"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Save, UploadCloud, Loader2 } from "lucide-react";
import { SlideIn, FadeIn } from "@/components/animations";
import { divisions, getDistricts, getUpazilas, bloodGroups } from "@/lib/bangladesh-locations";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";

export default function DonorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    blood_group: "",
    division: "",
    district: "",
    upazila: "",
    active: true,
    avatar_url: ""
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || data.full_name || "",
            blood_group: data.blood_group || "",
            division: data.division || "",
            district: data.district || "",
            upazila: data.upazila || "",
            active: data.active,
            avatar_url: data.avatar_url || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  // Handle dependent Location dropdown resets
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile(p => ({ ...p, division: e.target.value, district: "", upazila: "" }));
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile(p => ({ ...p, district: e.target.value, upazila: "" }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setProfile(p => ({ ...p, avatar_url: data.publicUrl }));
      toast.success("Image uploaded. Remember to save changes.");
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update auth metadata (if full_name changed)
      await supabase.auth.updateUser({ data: { full_name: profile.full_name } });

      // 2. Update profile table
      const { error } = await supabase.from("profiles").update({
        full_name: profile.full_name, // Sync down to profile table for easier querying
        blood_group: profile.blood_group,
        division: profile.division,
        district: profile.district,
        upazila: profile.upazila,
        active: profile.active,
        avatar_url: profile.avatar_url,
      }).eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your personal information and availability.</p>
        </div>
      </SlideIn>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Upload */}
        <FadeIn delay={0.1}>
          <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <Avatar url={profile.avatar_url} name={profile.full_name} size={120} className="shadow-2xl shadow-blood/20" />
            
            <div className="flex flex-col items-center md:items-start space-y-3">
              <h3 className="text-lg font-bold text-white">Profile Picture</h3>
              <p className="text-gray-400 text-sm text-center md:text-left max-w-sm">
                Upload a clear photo so recipients can easily identify you when meeting. 
                <span className="text-blood-light block mt-1">Note: Images will not be stretched.</span>
              </p>
              
              <div className="relative mt-2">
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2 px-6 py-2"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload New Photo"}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="glass-card p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basics */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-surface-border pb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blood" /> Basic Info
              </h3>
              
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.full_name}
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Blood Group</label>
                <select
                  required
                  value={profile.blood_group}
                  onChange={e => setProfile({...profile, blood_group: e.target.value})}
                  className="input-field appearance-none"
                >
                  <option value="">Select Group</option>
                  {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-surface-border bg-surface-DEFAULT hover:border-blood/30 transition-colors">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={profile.active}
                      onChange={e => setProfile({...profile, active: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-surface-card border border-surface-border rounded-full peer peer-checked:bg-green-500/20 peer-checked:border-green-500 transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-gray-500 peer-checked:bg-green-500 peer-checked:translate-x-5 transition-all"></div>
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Available for Donation</div>
                    <div className="text-xs text-gray-400">Toggle off if you are temporarily unavailable.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-surface-border pb-4">Location Info</h3>
              
              <div>
                <label className="input-label">Division</label>
                <select
                  required
                  value={profile.division}
                  onChange={handleDivisionChange}
                  className="input-field appearance-none"
                >
                  <option value="">Select Division</option>
                  {divisions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">District</label>
                <select
                  required
                  value={profile.district}
                  onChange={handleDistrictChange}
                  disabled={!profile.division}
                  className="input-field appearance-none"
                >
                  <option value="">Select District</option>
                  {profile.division && getDistricts(profile.division).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Upazila</label>
                <select
                  required
                  value={profile.upazila}
                  onChange={e => setProfile({...profile, upazila: e.target.value})}
                  disabled={!profile.district}
                  className="input-field appearance-none"
                >
                  <option value="">Select Upazila</option>
                  {profile.district && getUpazilas(profile.division, profile.district).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-surface-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </FadeIn>
      </form>
    </div>
  );
}
