import React, { useState } from 'react';
import {
  Server,
  Globe,
  Database,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';

interface LocalhostSectionProps {
  onOpenDetailsModal: () => void;
}

export const LocalhostSection: React.FC<LocalhostSectionProps> = ({
  onOpenDetailsModal
}) => {
  const [copiedPort, setCopiedPort] = useState(false);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPort(true);
    setTimeout(() => setCopiedPort(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 border border-gold/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative ambient backdrop */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 shadow-gold flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-navy-900 flex items-center justify-center">
              <Server className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Local Host Website &amp; Environments
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Port 3000 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant access to local development servers, APIs, and administrative tooling.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDetailsModal}
          className="self-start sm:self-auto py-2 px-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-amber-300 font-bold text-xs border border-gold/40 shadow-sm transition-all flex items-center space-x-1.5"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Server Info &amp; Endpoints</span>
        </button>
      </div>

      {/* Cards: Localhost 3000, Standalone Admin, Cloudflare Edge API */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Card 1: Main App Localhost */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-gold/40 transition-all flex flex-col justify-between space-y-3 group">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-amber-400 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Primary Local Host</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300">
                Vite + Node
              </span>
            </div>
            <div className="font-mono text-xs text-white font-bold tracking-tight bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              http://localhost:3000
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Main interactive interface for address validation, interactive satellite map, and PDF dossier generation.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-1.5 px-3 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs shadow-gold hover:opacity-95 transition-all text-center inline-flex items-center justify-center space-x-1"
            >
              <span>Visit Localhost</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => copyUrl('http://localhost:3000')}
              title="Copy URL"
              className="p-2 rounded-xl bg-navy-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {copiedPort ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Card 2: Standalone Admin */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3 group">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-purple-400 flex items-center space-x-1">
                <Database className="w-3.5 h-3.5" />
                <span>Standalone Admin Website</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] font-mono">
                Pure HTML
              </span>
            </div>
            <div className="font-mono text-xs text-white font-bold tracking-tight bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 truncate">
              http://localhost:3000/admin.html
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Standalone administrative dashboard with direct SQLite inspection, filtering, and bulk address imports.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
            <a
              href="/admin.html"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all text-center inline-flex items-center justify-center space-x-1"
            >
              <span>Visit Admin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => copyUrl('http://localhost:3000/admin.html')}
              title="Copy URL"
              className="p-2 rounded-xl bg-navy-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Cloudflare & SQLite Dual Engine */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 group">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-blue-400 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Edge &amp; Local Persistence</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-mono">
                D1 + SQLite
              </span>
            </div>
            <div className="font-mono text-xs text-slate-300 font-semibold tracking-tight bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              simone-jovita-db (D1)
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Dual SQLite database on local disk and Cloudflare D1 with instant Edge latency and Cloud Firestore sync.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={onOpenDetailsModal}
              className="w-full py-1.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-1"
            >
              <span>View Edge &amp; API Details</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
