import React, { useState } from 'react';
import {
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Building2,
  FileCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Navigation,
  Compass
} from 'lucide-react';

export const PublicAddressGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gold/30 p-5 shadow-sm space-y-4">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gold-gradient text-slate-950 shadow-gold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Adding Addresses to Google Maps: Public vs. Private Options</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gold-gradient text-slate-950 shadow-xs">
                Enabled
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose between public worldwide Google Maps directory inclusion or confidential private location navigation
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Public Listings Option */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-700/40 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Option 1: Public Listings on Google Maps</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Designed for businesses, shops, public establishments, residential developments, and landmarks intended for discovery on Google Maps worldwide search.
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                <li>Pre-formats address lines with Google Address Validation API</li>
                <li>Attaches verified sub-meter coordinates and exterior photo proof</li>
                <li>One-click launch into official Google Maps &ldquo;Add a missing place&rdquo; or Google Business Profile</li>
                <li>Reviewed and indexed by Google Local Guides and GIS algorithms within 24–72 hours</li>
              </ul>
            </div>

            {/* Private Locations Option */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-navy-800/60 border border-blue-200 dark:border-gold/30 space-y-2.5">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-amber-400 font-bold">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Option 2: Confidential Private Locations</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Designed for private residences, executive estates, secure logistics depots, and confidential facilities that should <strong>never</strong> be indexed publicly on Google web search.
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                <li>Stored securely in private Cloud Firestore &amp; SQLite databases</li>
                <li>Generates private direct Google Maps navigation deep-links (<code className="text-amber-400 font-mono">maps/dir/?api=1</code>)</li>
                <li>Stores gate codes, intercom units, and courier entrance instructions</li>
                <li>Generates private QR-code access passes and luxury PDF dossiers for trusted visitors</li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Use the <strong>Destination Listing Type</strong> toggle in the &ldquo;+ Add Address to Google Maps&rdquo; tab to choose between Public and Private modes.
            </span>
            <div className="flex items-center space-x-3 shrink-0">
              <a 
                href="https://support.google.com/maps/answer/6320846" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                <span>Google Contribution Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
