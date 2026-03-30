import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import ReactMarkdown from "react-markdown";
import { Gift } from "lucide-react";

export const revalidate = 60; // Cache for 1 min

export default async function RewardsRulesPage() {
  const supabase = createAdminClient();
  
  // Fetch rewards rulebook content from database
  // Assuming a single row contains the markdown content
  const { data, error } = await supabase.from("reward_rules").select("*").single();

  const rulesContent = data?.content || `
# BloodChai Donor Rewards Program

We believe every life-saver deserves recognition. Here is how our point system works:

### Earning Points
- **1 Successful Donation** = 500 Points
- **Emergency Callout Reaction** = 800 Points
- **3-Donation Streak** = Custom Badge + 1000 Bonus Points

### Redeeming Rewards
You can redeem points for rewards as we partner with various organizations in Bangladesh.
*(Note: Rewards list will be updated periodically by admins)*
  `;

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
            <Gift className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Rewards Program</h1>
          <p className="text-gray-400">Rules and benefits for our dedicated donors.</p>
        </div>

        <div className="glass-card p-6 md:p-10 prose prose-invert prose-blood max-w-none">
          <ReactMarkdown>{rulesContent}</ReactMarkdown>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
