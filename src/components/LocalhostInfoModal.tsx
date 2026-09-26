import React, { useState } from 'react';
import {
  Server,
  Globe,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Database,
  Radio,
  X,
  Sparkles
} from 'lucide-react';

interface LocalhostInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalhostInfoModal: React.FC<LocalhostInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedPort, setCopiedPort] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const copyToClipboard = (text: string, type: 'port' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'port') {
      setCopiedPort(true);
      setTimeout(() => setCopiedPort(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-gradient p-0.5 shadow-gold flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-navy-900 flex items-center justify-center">
                <Server className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Local Host &amp; Live Server Websites</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Online
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Simone &amp; Jovita Maps active access addresses and endpoints
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

        {/* Primary URLs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Localhost 3000 */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-900/90 to-slate-900 border border-gold/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                <Terminal className="w-3 h-3" />
                <span>Primary Local Host</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                Port 3000
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-white select-all">
              http://localhost:3000
            </div>
            <p className="text-[11px] text-slate-400">
              Direct local development address for web browsers on your machine.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs shadow-gold hover:opacity-95 transition-all text-center inline-flex items-center justify-center space-x-1"
              >
                <span>Open Localhost</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => copyToClipboard('http://localhost:3000', 'port')}
                className="p-2 rounded-xl bg-navy-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy URL"
              >
                {copiedPort ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Standalone Admin Website */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Standalone Admin</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                HTML + SQLite
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-white select-all truncate">
              http://localhost:3000/admin.html
            </div>
            <p className="text-[11px] text-slate-400">
              Zero-dependency standalone administrative dashboard for fast review.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <a
                href="/admin.html"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all text-center inline-flex items-center justify-center space-x-1"
              >
                <span>Open Admin Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => copyToClipboard('http://localhost:3000/admin.html', 'port')}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy URL"
              >
                {copiedPort ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Current Hosting Session Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Current Session Origin Website</span>
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
              {isLocal ? 'Localhost Mode' : 'Cloud Preview Mode'}
            </span>
          </div>
          <div className="font-mono text-xs text-amber-500 font-semibold break-all bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 select-all">
            {currentHost}
          </div>
          <p className="text-[11px] text-slate-500">
            This URL points to your running application instance. All features (Google Maps, Address Validation, SQLite &amp; Cloud Firestore) operate seamlessly across both localhost:3000 and live cloud previews.
          </p>
        </div>

        {/* API Health & CLI curl test */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Terminal / Health Check Command:</span>
            <button
              onClick={() => copyToClipboard('curl http://localhost:3000/api/health', 'curl')}
              className="text-[11px] text-amber-500 hover:underline flex items-center space-x-1"
            >
              {copiedCurl ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy curl</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 select-all border border-slate-800 flex items-center justify-between">
            <code>curl http://localhost:3000/api/health</code>
            <span className="text-slate-500 text-[10px]">Returns {JSON.stringify({ status: 'ok' })}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>SQLite DB: <code>data/submissions.db</code> • Port: <code>3000</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
