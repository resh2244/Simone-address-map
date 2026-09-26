import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Compass,
  MapPin,
  FileDown,
  Share2,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AddressRegistration } from '../lib/firebase.js';
import { generateAddressPDF } from '../lib/pdfGenerator.js';

interface AddressComparisonModalProps {
  item: AddressRegistration | null;
  onClose: () => void;
  onShare: (item: AddressRegistration) => void;
  onSelectAddress: (item: AddressRegistration) => void;
}

export const AddressComparisonModal: React.FC<AddressComparisonModalProps> = ({
  item,
  onClose,
  onShare,
  onSelectAddress
}) => {
  if (!item) return null;

  // Extract raw user input vs standardized Google address
  const rawInput = item.addressLines && item.addressLines.length > 0
    ? item.addressLines.join(', ')
    : (item.googleSubmissionPayload?.fullAddress || item.formattedAddress);

  const standardizedAddress = item.formattedAddress;
  const isModified = rawInput.trim().toLowerCase() !== standardizedAddress.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-gradient p-0.5 shadow-gold flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-navy-900 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Side-by-Side Address Comparison</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Validation Diff View
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparing your raw input with Google Address Validation API standardization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side by Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Column 1: User-Provided Input */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>User Input Address</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  Raw Submission
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed shadow-xs">
                {rawInput}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Region ISO:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{item.regionCode || 'US'}</span>
              </div>
              <div className="flex justify-between">
                <span>Building Name:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Google Standardized Output */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/20 via-slate-900/60 to-navy-950/30 border border-blue-500/30 space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Standardized Output</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                  API Certified
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 text-xs font-mono text-emerald-300 leading-relaxed shadow-xs">
                {standardizedAddress}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Granularity:</span>
                <span className="font-mono font-bold text-amber-400">{item.granularity || 'PREMISE'}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-slate-300">{item.lat.toFixed(5)}, {item.lng.toFixed(5)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Diff Highlights / Verdict Summary */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Validation Summary &amp; Standardization Analysis</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isModified ? (
              <span>
                Google Address Validation successfully standardized your input formatting, ensuring postal delivery compliance and precise geocoding accuracy.
              </span>
            ) : (
              <span>
                Your input matched Google&apos;s authoritative postal database precisely with no formatting adjustments required.
              </span>
            )}
          </p>
          {item.verdictSummary && (
            <div className="text-[11px] font-mono bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-500/30 text-slate-700 dark:text-slate-300">
              {item.verdictSummary}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onSelectAddress(item);
                onClose();
              }}
              className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center space-x-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>Inspect on Map</span>
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps Pin</span>
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                generateAddressPDF(item);
              }}
              className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center space-x-1"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-500" />
              <span>PDF Dossier</span>
            </button>

            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs shadow-gold hover:opacity-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
