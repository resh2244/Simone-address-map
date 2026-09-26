import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface AddressAutocompleteProps {
  apiKey: string;
  onAddressSelect: (place: {
    formattedAddress: string;
    addressLines: string[];
    regionCode?: string;
    lat?: number;
    lng?: number;
  }) => void;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  apiKey,
  onAddressSelect,
  placeholder = 'Type address (e.g. 1600 Amphitheatre Pkwy)...',
  value: controlledValue,
  onChange: controlledOnChange
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const val = controlledValue !== undefined ? controlledValue : internalValue;

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (controlledOnChange) controlledOnChange(v);
    else setInternalValue(v);

    if (v.trim().length > 2 && apiKey) {
      setLoading(true);
      try {
        const res = await fetch(`https://api.woosmap.com/localities/autocomplete?key=${apiKey}&input=${encodeURIComponent(v)}`);
        const data = await res.json();
        if (data && data.predictions) {
          setSuggestions(data.predictions);
        }
      } catch (err) {
        console.warn('Woosmap autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectPrediction = (prediction: any) => {
    const formatted = prediction.description || prediction.formatted_address || val;
    if (controlledOnChange) controlledOnChange(formatted);
    else setInternalValue(formatted);
    setSuggestions([]);

    onAddressSelect({
      formattedAddress: formatted,
      addressLines: [formatted],
      regionCode: prediction.country_code || 'US',
      lat: prediction.geometry?.location?.lat || 37.422,
      lng: prediction.geometry?.location?.lng || -122.084
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-amber-500 pointer-events-none" />
        <input
          type="text"
          value={val}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
        {val && (
          <button
            type="button"
            onClick={() => {
              if (controlledOnChange) controlledOnChange('');
              else setInternalValue('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrediction(item)}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{item.description || item.formatted_address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
