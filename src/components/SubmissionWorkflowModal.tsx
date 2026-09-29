import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Info,
  Clock,
  Send,
  Building,
  MapPin,
  Camera,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Key,
  Copy,
  Check,
  Navigation,
  Share2,
  FileCheck
} from 'lucide-react';
import { AddressRegistration } from '../lib/firebase.js';

interface SubmissionWorkflowModalProps {
  item: AddressRegistration | null;
  onClose: () => void;
  onConfirmedSubmission: (updatedItem: AddressRegistration) => void;
}

export const SubmissionWorkflowModal: React.FC<SubmissionWorkflowModalProps> = ({
  item,
  onClose,
  onConfirmedSubmission
}) => {
  const [step, setStep] = useState<'review' | 'workflow' | 'confirmed'>('review');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeListingType, setActiveListingType] = useState<'public' | 'private'>(
    item?.listingType || 'public'
  );

  if (!item) return null;

  const isPublic = activeListingType === 'public';

  // URLs for Public Google Maps Contribution
  const googleSearchContributeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    item.formattedAddress
  )}`;
  const googleMapsContribPortalUrl = 'https://www.google.com/maps/contrib/';
  const googleBusinessProfileUrl = 'https://business.google.com/create';

  // Private direct navigation & coordinate URL
  const privateNavigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
  const privatePinUrl = `https://www.google.com/maps?q=${item.lat},${item.lng}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleConfirm = () => {
    const updated: AddressRegistration = {
      ...item,
      listingType: activeListingType,
      googleSubmissionPayload: {
        placeName: item.name || (isPublic ? 'Public Place' : 'Private Location'),
        category: item.category || (isPublic ? 'Premise / Address' : 'Private Residence'),
        fullAddress: item.formattedAddress,
        coordinates: { lat: item.lat, lng: item.lng },
        officialGoogleMapsContributeUrl: isPublic ? googleSearchContributeUrl : privateNavigationUrl,
        status: isPublic ? 'PENDING_GOOGLE_REVIEW' : 'PRIVATE_REGISTERED',
        listingType: activeListingType
      }
    };
    onConfirmedSubmission(updated);
    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-gold/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
        >
          ✕
        </button>

        {/* Listing Mode Switcher (Public vs Private) */}
        <div className="pt-1">
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveListingType('public')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                isPublic
                  ? 'bg-gold-gradient text-slate-950 shadow-gold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public Listing on Google Maps</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveListingType('private')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                !isPublic
                  ? 'bg-navy-800 text-amber-300 border border-gold/40 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Private Location (Confidential)</span>
            </button>
          </div>
        </div>

        {/* STEP 1: REVIEW */}
        {step === 'review' && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                  isPublic
                    ? 'bg-gold-gradient text-slate-950 shadow-gold'
                    : 'bg-navy-800 text-amber-400 border border-gold/40'
                }`}
              >
                {isPublic ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isPublic
                    ? 'Publish Address to Google Maps'
                    : 'Register Confidential Private Location'}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Step 1: Review Verified Specifications &amp; Mode
                </p>
              </div>
            </div>

            {/* Verification details table */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Listing Type:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    isPublic
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300'
                      : 'bg-navy-800 text-amber-400 border border-gold/40'
                  }`}
                >
                  {isPublic ? '🌐 Public Listing' : '🔒 Private Location'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Place / Building Name:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs truncate">
                  {item.name || 'Unnamed Property'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Validated Address:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">
                  {item.formattedAddress}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Verified Coordinates:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {item.lat.toFixed(6)}, {item.lng.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Validation Granularity:</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-mono text-[10px]">
                  {item.granularity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Attached Photos:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.photos?.length || 0} exterior images ready
                </span>
              </div>
            </div>

            {/* Contextual Notice */}
            {isPublic ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
                  <Clock className="w-4 h-4" />
                  <span>Public Google Maps Review Process</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Public listings (businesses, landmarks, residential developments) are submitted to
                  Google&apos;s editorial and satellite validation pipeline. Once submitted, Google Local Guides and GIS systems review the location within <strong>24 to 72 hours</strong>.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-navy-800/80 border border-gold/30 space-y-2 text-xs text-amber-300">
                <div className="flex items-center space-x-2 font-bold text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span>Confidentiality Guaranteed</span>
                </div>
                <p className="leading-relaxed text-[11px] text-slate-300">
                  Private locations are kept <strong>strictly confidential</strong>. They will never appear in public Google search or be visible to the public. You can share direct navigation links and QR passes exclusively with authorized visitors, family, and trusted delivery couriers.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('workflow')}
                className="px-5 py-2.5 rounded-xl bg-gold-gradient hover:opacity-95 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-gold"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WORKFLOW ACTIONS */}
        {step === 'workflow' && (
          <div className="space-y-5">
            {isPublic ? (
              /* Public Listing Workflow */
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Google Maps Public Submission
                    </h3>
                    <p className="text-xs text-slate-500">
                      Step 2: Submit to Google&apos;s Review Catalog
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                    Submission Package Prepared
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Name</span>
                      <strong className="text-slate-900 dark:text-white truncate block">
                        {item.name || 'Building'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Category</span>
                      <strong className="text-slate-900 dark:text-white truncate block">
                        {item.category || 'Premise'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      Coordinates: {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${item.lat}, ${item.lng}`)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 inline-flex items-center space-x-1"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Submit via official Google tools:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={googleSearchContributeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                    >
                      <span>1. Open Google Maps Intake</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={googleMapsContribPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      <span>Google Contribute Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  {item.category === 'Commercial' && (
                    <a
                      href={googleBusinessProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <span>Register as Google Business Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setStep('review')}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-5 rounded-xl bg-gold-gradient text-slate-950 font-extrabold text-xs shadow-gold hover:opacity-95 flex items-center justify-center space-x-2"
                  >
                    <span>Mark as Submitted to Google Maps</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Private Location Workflow */
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-navy-800 text-amber-400 border border-gold/40 flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Private Navigation &amp; Security Pass
                    </h3>
                    <p className="text-xs text-slate-500">
                      Step 2: Generate Direct Navigation Link &amp; Access Controls
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-navy-900/90 border border-gold/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                      Private Navigation Deep-Link
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Direct Coordinates Ready
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Use this private Google Maps link to route deliveries, couriers, and guests directly to your pinpointed coordinates:
                  </p>

                  <div className="flex items-center space-x-2 bg-navy-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[11px] font-mono text-amber-200 truncate flex-1">
                      {privateNavigationUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(privateNavigationUrl)}
                      className="px-3 py-1.5 rounded-lg bg-gold-gradient text-slate-950 text-xs font-bold flex items-center space-x-1 shrink-0 shadow-gold"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  {item.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Access &amp; Delivery Instructions:
                      </span>
                      <p className="text-[11px] text-white">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={privateNavigationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Test Navigation in Google Maps</span>
                  </a>

                  <a
                    href={privatePinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-amber-300 border border-gold/40 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Pin</span>
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setStep('review')}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-5 rounded-xl bg-gold-gradient text-slate-950 font-extrabold text-xs shadow-gold hover:opacity-95 flex items-center justify-center space-x-2"
                  >
                    <span>Save &amp; Lock Private Location</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 'confirmed' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isPublic ? 'Public Submission Recorded!' : 'Private Location Secured!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {isPublic ? (
                <>
                  Your listing is marked as <strong>Pending Google Review</strong>. You can monitor verification, generate certified dossiers, or share links from the Saved Addresses dashboard.
                </>
              ) : (
                <>
                  Your private address is stored securely in <strong>Firestore &amp; SQLite</strong>. It remains invisible to public web indexing, but navigation links can be accessed anytime from your private dashboard.
                </>
              )}
            </p>
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-gold-gradient text-slate-950 font-extrabold text-xs shadow-gold hover:opacity-95"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
