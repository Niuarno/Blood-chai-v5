import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, X, Info } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/animations";

export default function RulebookPage() {
  const requirements = [
    "Age must be between 18 and 65 years.",
    "Weight must be at least 45 kg (100 lbs).",
    "Must be in good general health and feeling well.",
    "Pulse rate must be normal (50 to 100 beats per minute).",
    "Hemoglobin level must be at least 12.5 g/dL.",
    "No history of infectious diseases (HIV, Hepatitis B/C, Syphilis, etc.).",
  ];

  const cannotDonateIf = [
    "You have donated blood within the last 3 months (men) or 4 months (women).",
    "You are pregnant or have given birth within the last 6 months.",
    "You have had a tattoo or body piercing within the last 6 months.",
    "You have received a blood transfusion in the past 12 months.",
    "You are currently taking antibiotics or have an active infection.",
    "You have consumed alcohol in the last 24 hours.",
    "You had major surgery or dental extraction recently.",
  ];

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <SlideIn>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3">Blood Donation Rulebook</h1>
            <p className="text-gray-400">Eligibility criteria and guidelines for safe blood donation.</p>
          </div>
        </SlideIn>

        <div className="space-y-8">
          <FadeIn delay={0.1}>
            <div className="glass-card p-6 md:p-8 border-l-4 border-blood">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-blood-light" /> General Guidelines
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Blood donation is a safe process, but it is essential to follow these medical guidelines 
                to ensure the safety of both the donor and the recipient. Only healthy individuals who 
                meet the criteria below should proceed with donating.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-card border border-surface-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-900/40 border border-green-700/50 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                You Can Donate If
              </h3>
              <ul className="space-y-4">
                {requirements.map((req, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-900/40 border border-red-700/50 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                You Cannot Donate If
              </h3>
              <ul className="space-y-4">
                {cannotDonateIf.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="bg-blood/10 border border-blood/20 rounded-xl p-6 text-center">
              <p className="text-sm text-blood-light font-medium">
                Note: Final eligibility is determined by the attending physician at the medical facility or blood bank prior to donation.
              </p>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
