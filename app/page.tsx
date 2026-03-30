import Link from "next/link";
import { Droplets, ShieldCheck, Activity, Search, AlertCircle, ArrowRight, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SlideIn, FadeIn, HoverCard } from "@/components/animations";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60; // 1 min cache

export default async function HomePage() {
  const supabase = createAdminClient();
  
  // Fetch stats (best effort)
  const { count: donorsCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "donor");
  const { count: completedCount } = await supabase.from("blood_requests").select("*", { count: "exact", head: true }).eq("status", "completed");
  const { count: banksCount } = await supabase.from("blood_banks").select("*", { count: "exact", head: true });
  
  // Fetch public notices
  const { data: notices } = await supabase.from("notices").select("*").eq("type", "public").order("created_at", { ascending: false }).limit(3);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 hero-gradient pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-4 h-4 particle" />
      <div className="absolute top-[60%] right-[15%] w-6 h-6 particle" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-[20%] left-[30%] w-3 h-3 particle" style={{ animationDelay: "4s" }} />

      <Header />

      <main className="flex-grow z-10">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blood/10 border border-blood/20 text-blood-light mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blood opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blood"></span>
                </span>
                <span className="text-sm font-semibold tracking-wide uppercase">Save Lives in Bangladesh</span>
              </div>
            </FadeIn>
            
            <SlideIn>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                Be the Reason <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-light to-blood glow-text">
                  Someone Smiles Today
                </span>
              </h1>
            </SlideIn>
            
            <SlideIn delay={0.2}>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
                BloodChai connects those in need with willing donors across Bangladesh. 
                A single drop can be the beginning of a lifetime.
              </p>
            </SlideIn>
            
            <SlideIn delay={0.4} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/find-blood" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-lg px-8 py-4">
                <Search className="w-5 h-5" /> Find Blood
              </Link>
              <Link href="/register?role=donor" className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center text-lg px-8 py-4">
                <Droplets className="w-5 h-5" /> Become a Donor
              </Link>
            </SlideIn>
          </div>
          
          <FadeIn delay={0.3} className="flex-1 relative w-full max-w-lg hidden md:block">
            <div className="relative aspect-square w-full blood-drop">
              <div className="absolute inset-0 bg-gradient-to-tr from-blood to-blood-dark rounded-full mix-blend-screen mix-blend-color-dodge blur-3xl opacity-50" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-64 h-64 text-blood-light drop-shadow-[0_0_30px_rgba(198,40,40,0.8)]" fill="currentColor">
                  <path d="M50,90 C22.4,90 10,67.6 10,50 C10,25 50,5 50,5 C50,5 90,25 90,50 C90,67.6 77.6,90 50,90 Z" />
                </svg>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* STATS */}
        <section className="border-y border-surface-border bg-black/40 backdrop-blur-sm relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-surface-border">
              <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                <div className="text-4xl font-black text-white mb-2">{donorsCount ?? 0}+</div>
                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blood" /> Registered Donors
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                <div className="text-4xl font-black text-blood-light mb-2">{completedCount ?? 0}+</div>
                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blood" /> Requests Fulfilled
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                <div className="text-4xl font-black text-white mb-2">{banksCount ?? 0}+</div>
                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-blood" /> Verified Blood Banks
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NOTICES */}
        {notices && notices.length > 0 && (
          <section className="section">
            <div className="flex items-center gap-3 mb-8">
              <AlertCircle className="w-8 h-8 text-blood" />
              <h2 className="text-3xl font-bold text-white">Notice Board</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.map((notice, i) => (
                <FadeIn key={notice.id} delay={i * 0.1}>
                  <HoverCard className="notice-card h-full">
                    <h3 className="text-xl font-bold text-white mb-2">{notice.title}</h3>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{notice.body}</p>
                    <div className="mt-4 text-xs text-gray-500">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </div>
                  </HoverCard>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A seamless platform designed to make finding blood in emergencies as quick as possible across all districts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blood/0 via-blood/30 to-blood/0 -z-10" />
            
            {[
              { title: "Find Donor", desc: "Select your area and blood group to see available donors instantly.", icon: <Search className="w-8 h-8 text-blood-light" /> },
              { title: "Send Request", desc: "Fill out hospital details and urgency. The donor is notified via SMS/Email.", icon: <Activity className="w-8 h-8 text-blood-light" /> },
              { title: "Save a Life", desc: "Donor accepts and arrives. Confirm the donation to update their track record.", icon: <ShieldCheck className="w-8 h-8 text-blood-light" /> }
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.2}>
                <HoverCard className="stat-card h-full flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-blood/10 border border-blood/20 flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* HEARTBEATS - REVIEWS */}
        <section className="section">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Activity className="w-8 h-8 text-blood" /> Heartbeats
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Stories of hope from people whose lives were changed by our donors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Rahim Chowdhury", location: "Dhaka", quote: "My father needed O- blood urgently. BloodChai connected us to a donor within 15 minutes. Truly life-saving." },
              { name: "Ayesha Siddiqua", location: "Chittagong", quote: "I've been donating for years, but the gamified points and easy dashboard make it so much more rewarding." },
              { name: "Kamrul Hasan", location: "Sylhet", quote: "The emergency callout feature works like magic. The admins manually arranged a donor at 2 AM. Forever grateful." }
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blood/10 rounded-bl-full -z-10" />
                  <div className="flex items-center gap-1 mb-4 text-yellow-500 text-sm">
                    {'★★★★★'.split('').map((star, idx) => <span key={idx}>{star}</span>)}
                  </div>
                  <p className="text-gray-300 italic mb-6 leading-relaxed flex-grow">"{review.quote}"</p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-surface-border">
                    <div className="w-10 h-10 rounded-full bg-surface-DEFAULT border border-surface-border flex items-center justify-center font-bold text-white">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{review.name}</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {review.location}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* EMERGENCY CTA */}
        <section className="py-20 px-4 mt-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blood/10" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <FadeIn>
              <div className="p-8 md:p-12 glass-card border-blood/40 shadow-[0_0_50px_rgba(198,40,40,0.15)] glow-text">
                <AlertCircle className="w-12 h-12 text-blood mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Are you in an emergency?</h2>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                  If you cannot find a matching donor, submit an emergency callout. Our admins will try their best to manually arrange blood for you immediately.
                </p>
                <Link href="/emergency" className="btn-primary inline-flex items-center gap-2 group shadow-[0_0_20px_rgba(198,40,40,0.4)] hover:shadow-[0_0_30px_rgba(198,40,40,0.6)]">
                  Submit Emergency Full Request <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
