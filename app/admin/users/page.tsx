"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, MapPin, SearchX } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";
import Link from "next/link";
import Avatar from "@/components/Avatar";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      
      if (filterRole !== "all") {
        query = query.eq("role", filterRole);
      }
      
      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }

      const { data } = await query;
      setUsers(data || []);
      setLoading(false);
    };

    fetchUsers();
  }, [filterRole, search, supabase]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <SlideIn>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">View all users, filter by roles, and inspect profiles.</p>
        </div>
      </SlideIn>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name..."
            className="input-field pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="input-field appearance-none sm:w-48"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="donor">Donors</option>
          <option value="recipient">Recipients</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <FadeIn className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blood/30 border-t-blood rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <SearchX className="w-12 h-12 text-surface-border mb-4" />
            <p className="text-gray-400">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Blood Group</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar url={u.avatar_url} name={u.full_name} size={36} />
                        <div>
                          <p className="text-white font-medium">{u.full_name}</p>
                          <p className="text-xs text-gray-500">{new Date(u.created_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase
                        ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                          u.role === 'donor' ? 'bg-blood/20 text-blood-light border border-blood/30' : 
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
                      `}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.blood_group ? <span className="blood-group-badge">{u.blood_group}</span> : <span className="text-gray-600">-</span>}
                    </td>
                    <td>
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-300">{u.phone || "No Phone"}</span>
                        {u.emergency_phone && <span className="text-gray-500 text-[10px]">{u.emergency_phone} (Emg)</span>}
                      </div>
                    </td>
                    <td>
                      {u.district ? (
                        <div className="flex flex-col text-xs">
                          <span className="text-gray-300">{u.upazila}</span>
                          <span className="text-gray-500">{u.district}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td>
                      {u.role === 'donor' ? (
                        u.active 
                          ? <span className="badge-available">Active</span> 
                          : <span className="badge-unavailable">Inactive</span>
                      ) : <span className="text-gray-600">-</span>}
                    </td>
                    <td>
                      {u.role === 'donor' && (
                        <Link href={`/admin/donors/${u.id}`} className="text-blood-light hover:text-white text-sm font-medium transition-colors">
                          Inspect Donor
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
