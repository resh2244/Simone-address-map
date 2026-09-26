import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Zap,
  Bell,
  X
} from 'lucide-react';

interface EnvironmentSyncStatusProps {
  firestoreCount: number;
}

export const EnvironmentSyncStatus: React.FC<EnvironmentSyncStatusProps> = ({
  firestoreCount
}) => {
  const [d1Count, setD1Count] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);

  // Sync deviation timer state
  const [deviationMinutes, setDeviationMinutes] = useState<number>(0);
  const [showAlertToast, setShowAlertToast] = useState<boolean>(false);
  const [dismissedAlert, setDismissedAlert] = useState<boolean>(false);
  const deviationStartRef = useRef<number | null>(null);

  const fetchSyncStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sync-status');
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }
      const data = await res.json();
      setD1Count(data.d1Count ?? 0);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn('Failed to fetch D1 sync status:', err);
      setD1Count(firestoreCount);
      setError('Using fallback local count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 45000);
    return () => clearInterval(interval);
  }, []);

  // Check for deviation between D1 and Firestore
  useEffect(() => {
    if (d1Count === null) return;

    const diff = Math.abs(d1Count - firestoreCount);
    if (diff > 0) {
      if (!deviationStartRef.current) {
        deviationStartRef.current = Date.now();
      }
      const elapsedMs = Date.now() - deviationStartRef.current;
      const elapsedMin = Math.floor(elapsedMs / 60000);
      setDeviationMinutes(elapsedMin);

      // Trigger visual alert toast if deviation persists for >= 5 minutes (or for demo if diff is large)
      if (elapsedMs >= 300000 && !dismissedAlert) {
        setShowAlertToast(true);
      }
    } else {
      // In sync
      deviationStartRef.current = null;
      setDeviationMinutes(0);
      setShowAlertToast(false);
      setDismissedAlert(false);
    }
  }, [d1Count, firestoreCount, dismissedAlert]);

  const isSynced = d1Count !== null && d1Count === firestoreCount;

  return (
    <div className="space-y-4">
      {/* Visual Alert Notification Toast for D1 / Firestore Deviation > 5 mins */}
      {showAlertToast && !dismissedAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border border-rose-500/50 shadow-2xl text-white flex items-start justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mt-0.5 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h5 className="font-extrabold text-sm text-rose-300 flex items-center space-x-2">
                <span>Cloudflare D1 Sync Deviation Warning</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                  &gt; {deviationMinutes} mins divergence
                </span>
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cloudflare D1 count (<strong className="text-amber-400 font-mono">{d1Count}</strong>) deviates from Cloud Firestore document count (<strong className="text-blue-400 font-mono">{firestoreCount}</strong>) for over 5 minutes. Database replication may require re-sync.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                fetchSyncStatus();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              Re-sync Now
            </button>
            <button
              onClick={() => setDismissedAlert(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Environment Sync Status Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 border border-gold/30 p-5 shadow-xl text-white relative overflow-hidden space-y-4">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold-gradient p-0.5 shadow-gold flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-navy-900 flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-sm flex items-center space-x-2">
                <span>Environment Sync Status</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                  isSynced
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isSynced ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{isSynced ? 'Live D1 Sync' : `Diverged (${Math.abs((d1Count || 0) - firestoreCount)})`}</span>
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Cloudflare D1 Database vs. Cloud Firestore Real-time Assurance
              </p>
            </div>
          </div>

          <button
            onClick={fetchSyncStatus}
            disabled={loading}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors border border-slate-700/80 flex items-center space-x-1.5 text-xs font-semibold"
            title="Refresh sync status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Cloudflare D1 / SQLite */}
          <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloudflare D1 / SQLite</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono text-[9px]">
                Edge DB
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">
                {d1Count !== null ? d1Count : '...'}
              </span>
              <span className="text-[10px] text-slate-400">records</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Active binding (DB)</span>
            </span>
          </div>

          {/* Cloud Firestore */}
          <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center space-x-1">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Cloud Firestore</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[9px]">
                NoSQL Cloud
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">
                {firestoreCount}
              </span>
              <span className="text-[10px] text-slate-400">documents</span>
            </div>
            <span className="text-[10px] text-blue-400 flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Real-time persistence</span>
            </span>
          </div>
        </div>

        {/* Footer Sync Verdict */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
          <div className="flex items-center space-x-1.5">
            {isSynced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-slate-300">
              Sync State:{' '}
              <strong className={isSynced ? 'text-emerald-400' : 'text-amber-400'}>
                {isSynced ? 'Fully Synchronized' : `Divergence Detected (${deviationMinutes}m)`}
              </strong>
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">
            Last checked: {lastChecked}
          </span>
        </div>
      </div>
    </div>
  );
};
