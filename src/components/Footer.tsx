import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowUpRight,
  Heart,
  CreditCard,
  Truck
} from 'lucide-react';
import { useStore } from '../hooks/useStore';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigate: (page: string) => void;
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onNavigate,
  onOpenTracking,
}) => {
  const { settings, categories } = useStore();

  return (
    <footer className="bg-[#07080c] border-t border-white/10 text-neutral-400 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.websiteName} className="h-8 w-auto object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-black font-extrabold flex items-center justify-center font-heading text-base shadow-md shadow-amber-400/20">
                  {settings.websiteName.charAt(0)}
                </div>
              )}
              <span className="font-heading text-xl font-bold text-white uppercase tracking-wider">
                {settings.websiteName}
              </span>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              {settings.footerAboutText ||
                'A precision commerce house engineering future-ready induction cookware, organic wellness formulas, and architectural luxury lifestyle essentials.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  f
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  ig
                </a>
              )}
              {settings.socialLinks.whatsapp && (
                <a
                  href={settings.socialLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  wa
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              Explore Collections
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onNavigate(`shop?cat=${encodeURIComponent(c.name)}`)}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Concierge & Support */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              Customer Concierge
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenTracking} className="hover:text-amber-400 transition-colors">
                  Order Tracking & Timeline
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop?filter=offers')} className="hover:text-amber-400 transition-colors">
                  Active Promotional Codes
                </button>
              </li>
              <li>
                <a href="#compliance" className="hover:text-amber-400 transition-colors">
                  Health & Medicine Compliance
                </a>
              </li>
              <li>
                <a href="#guarantee" className="hover:text-amber-400 transition-colors">
                  Authenticity Verification
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              Flagship Contact
            </h4>
            <div className="space-y-2 text-neutral-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payments, Copyright, Admin Login */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-neutral-500 text-[11px] text-center sm:text-left">
            {settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.websiteName}. All Rights Reserved.`}
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
              <Truck className="w-3.5 h-3.5 text-amber-400" /> Cash on Delivery
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
              <CreditCard className="w-3.5 h-3.5 text-pink-400" /> bKash / Nagad
            </span>
          </div>

          {/* Secure Admin Portal Link */}
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-amber-400 transition-colors text-[11px] font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Access Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
