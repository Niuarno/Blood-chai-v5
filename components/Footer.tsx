import Link from "next/link";
import { Droplets, Heart, MapPin, Phone, Mail, Github, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface-card border-t border-surface-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Droplets className="w-7 h-7 text-blood" />
              <span className="text-xl font-bold text-white">
                Blood<span className="text-blood">Chai</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Bangladesh&apos;s premier blood donation platform. Connecting donors and recipients to save lives.
            </p>
            <p className="text-gray-600 text-xs mt-3 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Bangladesh only
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2">
              {[
                { href: "/find-blood", label: "Find Blood" },
                { href: "/blood-banks", label: "Blood Banks" },
                { href: "/donate-money", label: "Donate Money" },
                { href: "/register?role=donor", label: "Become a Donor" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-blood-light text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Information</h3>
            <ul className="space-y-2">
              {[
                { href: "/rulebook", label: "Donation Rulebook" },
                { href: "/rewards-rules", label: "Rewards Rules" },
                { href: "/login", label: "Donor Login" },
                { href: "/register", label: "Register" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-blood-light text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blood" />
                <span>Made with love for Bangladesh</span>
              </li>
              <li>
                <Link href="/donate-money" className="hover:text-blood-light transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Support the Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} BloodChai. All rights reserved. For Bangladesh only.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/rewards-rules" className="hover:text-blood-light transition-colors">
              Rewards Rules
            </Link>
            <span>·</span>
            <Link href="/rulebook" className="hover:text-blood-light transition-colors">
              Blood Donation Rules
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
