import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  ExternalLink,
  Share2,
  Trash2,
  FileDown,
  Building,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Star,
  ShieldCheck,
  Eye,
  ArrowRightLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { AddressRegistration, getUserAddresses, deleteAddressFromFirestore, saveAddressToFirestore } from '../lib/firebase.js';
import { generateAddressPDF } from '../lib/pdfGenerator.js';
import { AddressComparisonModal } from './AddressComparisonModal.js';
import { EnvironmentSyncStatus } from './EnvironmentSyncStatus.js';

interface SavedAddressesViewProps {
  currentUser: any;
  onAddNew: () => void;
  onSelectAddress: (item: AddressRegistration) => void;
  onShare: (item: AddressRegistration) => void;
}

export const SavedAddressesView: React.FC<SavedAddressesViewProps> = ({
  currentUser,
  onAddNew,
  onSelectAddress,
  onShare
}) => {
  const [addresses, setAddresses] = useState<AddressRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'favorites' | 'pending' | 'verified'>('all');
  const [comparisonItem, setComparisonItem] = useState<AddressRegistration | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('address_app_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const list = await getUserAddresses(currentUser?.uid || 'guest');
      setAddresses(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentUser]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('address_app_favorites', JSON.stringify(updated));
  };

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((item) => item.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address registration?')) return;
    try {
      await deleteAddressFromFirestore(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      if (favorites.includes(id)) {
        const updated = favorites.filter((f) => f !== id);
        setFavorites(updated);
        localStorage.setItem('address_app_favorites', JSON.stringify(updated));
      }
    } catch (e: any) {
      alert('Delete error: ' + e.message);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected address(es)?`)) return;

    try {
      for (const id of selectedIds) {
        await deleteAddressFromFirestore(id);
      }
      setAddresses((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
      setSelectedIds([]);
    } catch (e: any) {
      alert('Batch delete error: ' + e.message);
    }
  };

  const handleBatchExport = () => {
    if (selectedIds.length === 0) return;
    const selectedItems = addresses.filter((a) => selectedIds.includes(a.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `simone_jovita_batch_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleBatchExportCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedItems = addresses.filter((a) => selectedIds.includes(a.id));
    
    const headers = ['ID', 'Name', 'Formatted Address', 'Region Code', 'Latitude', 'Longitude', 'Granularity', 'Complete', 'Notes', 'Created At'];
    const rows = selectedItems.map(item => [
      item.id,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.formattedAddress || '').replace(/"/g, '""')}"`,
      item.regionCode || 'US',
      item.lat,
      item.lng,
      item.granularity || 'PREMISE',
      item.complete ? 'Yes' : 'No',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      item.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `simone_jovita_addresses_export_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportExcel = () => {
    if (addresses.length === 0) {
      alert('No saved addresses available to export.');
      return;
    }
    const headers = ['ID', 'Building Name', 'Formatted Address', 'Region Code', 'Latitude', 'Longitude', 'Granularity', 'Complete', 'Notes', 'Created At'];
    const rows = addresses.map(item => [
      item.id,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.formattedAddress || '').replace(/"/g, '""')}"`,
      item.regionCode || 'US',
      item.lat,
      item.lng,
      item.granularity || 'PREMISE',
      item.complete ? 'Yes' : 'No',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      new Date(item.createdAt).toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simone_jovita_addresses_excel_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filtered = addresses.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAddr = item.formattedAddress.toLowerCase().includes(q);
      const matchName = item.name?.toLowerCase().includes(q);
      if (!matchAddr && !matchName) return false;
    }
    if (filterStatus === 'favorites') {
      if (!favorites.includes(item.id)) return false;
    } else if (filterStatus === 'pending') {
      if (item.googleSubmissionPayload?.status !== 'PENDING_GOOGLE_REVIEW') return false;
    } else if (filterStatus === 'verified') {
      if (!item.complete) return false;
    }
    return true;
  });

  return (
    <div id="saved-addresses-list-container" className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      {/* Environment Sync Status Indicator */}
      <EnvironmentSyncStatus firestoreCount={addresses.length} />

      {/* Top Banner & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Saved Addresses &amp; Registrations
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-500 border border-gold/30">
              {addresses.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your registered buildings, compare user inputs with Google standardized validation, and generate dossiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export to Excel Button at top of container */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="py-2 px-3.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 font-bold text-xs border border-emerald-500/30 transition-all flex items-center space-x-1.5 shadow-xs"
            title="Export all saved addresses as Excel-compatible CSV file"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export to Excel</span>
          </button>
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search address or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 w-52 sm:w-64"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('favorites')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                filterStatus === 'favorites'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'verified'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Verified
            </button>
          </div>

          {/* Add New Button */}
          <button
            onClick={onAddNew}
            className="py-2 px-4 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs shadow-gold hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Address</span>
          </button>
        </div>
      </div>

      {/* Batch Selection & Action Toolbar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 hover:text-amber-500 transition-colors"
            >
              {selectedIds.length === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filtered.length})</span>
            </button>
            {selectedIds.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in">
              <button
                onClick={handleBatchExportCSV}
                className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold border border-emerald-500/30 transition-all flex items-center space-x-1.5"
                title="Export selected addresses as formatted CSV"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export CSV ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleBatchExport}
                className="py-1.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold border border-blue-500/30 transition-all flex items-center space-x-1.5"
                title="Export selected addresses as JSON"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-500" />
                <span>Export JSON ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleBatchDelete}
                className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold border border-rose-500/30 transition-all flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Batch Delete ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-64 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-gold/30">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            No Saved Addresses Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === 'favorites'
              ? 'Click the star icon on any address card to bookmark it as a favorite for quick reference.'
              : 'Add your first building or residence address to validate, preview on Google Maps, and generate PDF certifications.'}
          </p>
          <button
            onClick={onAddNew}
            className="py-2 px-4 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs shadow-gold inline-flex items-center space-x-1 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isFav = favorites.includes(item.id);
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  // Toggle selection on card click if not clicking buttons
                  toggleSelectId(item.id, e);
                }}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all overflow-hidden shadow-sm flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-50/10'
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                {/* Card Photo / Placeholder */}
                <div className="relative aspect-video bg-slate-800 overflow-hidden">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos[0]}
                      alt={item.name || item.formattedAddress}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-1 bg-gradient-to-br from-slate-900 to-navy-900">
                      <Building className="w-8 h-8 text-amber-400/50" />
                      <span className="text-[10px]">No exterior photo</span>
                    </div>
                  )}

                  {/* Multi-select Checkbox */}
                  <button
                    onClick={(e) => toggleSelectId(item.id, e)}
                    className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-gold scale-105'
                        : 'bg-slate-900/70 text-slate-300 hover:text-white'
                    }`}
                    title={isSelected ? 'Deselect address' : 'Select address for batch action'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-slate-950 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className={`absolute top-3 left-14 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
                      isFav
                        ? 'bg-amber-400 text-slate-950 scale-105 shadow-gold'
                        : 'bg-slate-900/70 text-slate-300 hover:text-amber-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-slate-950' : ''}`} />
                  </button>

                  {/* Status chip */}
                  <div className="absolute top-3 right-3">
                    {item.googleSubmissionPayload?.status === 'PENDING_GOOGLE_REVIEW' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-xs flex items-center space-x-1 shadow-xs">
                        <Clock className="w-3 h-3" />
                        <span>Pending Google Review</span>
                      </span>
                    ) : item.complete ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs flex items-center space-x-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Validated (Local)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/90 text-slate-200">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] text-amber-300 font-mono">
                    {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.name || 'Building / Residence'}
                      </h4>
                      {/* Compare Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparisonItem(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold transition-colors inline-flex items-center space-x-1 border border-blue-500/20"
                        title="Side-by-side comparison with raw user input"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Compare</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.formattedAddress}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span>Granularity: {item.granularity}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAddress(item);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center space-x-1"
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-500" />
                      <span>View Map</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in Google Maps"
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onShare(item)}
                        title="Share & QR Code"
                        className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => generateAddressPDF(item)}
                        title="Download PDF Dossier"
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      <AddressComparisonModal
        item={comparisonItem}
        onClose={() => setComparisonItem(null)}
        onShare={onShare}
        onSelectAddress={onSelectAddress}
      />
    </div>
  );
};
