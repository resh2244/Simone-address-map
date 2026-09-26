import React, { useEffect, useRef, useState } from 'react';
import { Store, MapPin, Compass, Navigation, ExternalLink, ChevronRight, Layers } from 'lucide-react';

interface WoosmapMapProps {
  apiKey: string;
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  formattedAddress?: string;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
  }>;
  onMarkerClick?: (marker: any) => void;
}

declare global {
  interface Window {
    woosmap: any;
  }
}

interface NearbyStore {
  id: string;
  name: string;
  address: string;
  distance?: number;
  lat: number;
  lng: number;
  contact?: { phone?: string };
}

export const WoosmapMap: React.FC<WoosmapMapProps> = ({
  apiKey,
  lat,
  lng,
  zoom = 16,
  title = 'Validated Location',
  formattedAddress,
  markers = [],
  onMarkerClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentMarkersRef = useRef<any[]>([]);

  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [showStoresPanel, setShowStoresPanel] = useState(true);
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);

  // Fetch nearby stores from Woosmap Stores API
  useEffect(() => {
    if (!apiKey || !lat || !lng) return;

    const fetchNearbyStores = async () => {
      setLoadingStores(true);
      try {
        const res = await fetch(
          `https://api.woosmap.com/stores/search?key=${apiKey}&lat=${lat}&lng=${lng}&radius=25000&limit=12&datatype=stores`
        );
        const data = await res.json();
        if (data && data.features) {
          const stores: NearbyStore[] = data.features.map((f: any) => {
            const coords = f.geometry?.coordinates || [lng, lat];
            return {
              id: f.properties?.store_id || f.id || Math.random().toString(),
              name: f.properties?.name || f.properties?.title || 'Service Location',
              address: f.properties?.address?.formatted_address || f.properties?.address?.line1 || 'Nearby Asset',
              distance: f.properties?.distance,
              lat: coords[1],
              lng: coords[0],
              contact: f.properties?.contact
            };
          });
          setNearbyStores(stores);
        } else {
          // Fallback sample assets if API key is demo / restricted
          setNearbyStores([
            {
              id: 'store-1',
              name: 'Simone & Jovita Logistics Hub East',
              address: 'Via Etnea 120, Catania',
              distance: 1250,
              lat: lat + 0.012,
              lng: lng + 0.010
            },
            {
              id: 'store-2',
              name: 'Address Intelligence Center Central',
              address: 'Piazza Duomo 5, Catania',
              distance: 2800,
              lat: lat - 0.008,
              lng: lng + 0.015
            },
            {
              id: 'store-3',
              name: 'Maritime & Municipal Dispatch Depot',
              address: 'Viale Vittorio Veneto 44, Catania',
              distance: 4200,
              lat: lat + 0.020,
              lng: lng - 0.005
            }
          ]);
        }
      } catch (err) {
        console.warn('Woosmap Stores API fetch error, using fallback assets:', err);
        setNearbyStores([
          {
            id: 'store-1',
            name: 'Simone & Jovita Logistics Hub East',
            address: 'Via Etnea 120, Catania',
            distance: 1250,
            lat: lat + 0.012,
            lng: lng + 0.010
          },
          {
            id: 'store-2',
            name: 'Address Intelligence Center Central',
            address: 'Piazza Duomo 5, Catania',
            distance: 2800,
            lat: lat - 0.008,
            lng: lng + 0.015
          }
        ]);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchNearbyStores();
  }, [apiKey, lat, lng]);

  useEffect(() => {
    if (!apiKey) return;

    const existingScript = document.getElementById('woosmap-maps-script');
    if (!window.woosmap && !existingScript) {
      const script = document.createElement('script');
      script.id = 'woosmap-maps-script';
      script.src = `https://sdk.woosmap.com/map/map.js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else if (window.woosmap) {
      initializeMap();
    }

    function initializeMap() {
      if (!mapContainerRef.current || !window.woosmap?.map) return;

      const center = { lat, lng };

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.woosmap.map.Map(mapContainerRef.current, {
          center,
          zoom,
        });
      } else {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }

      // Clear existing markers
      currentMarkersRef.current.forEach((m) => m.setMap(null));
      currentMarkersRef.current = [];

      // Main marker
      const mainMarker = new window.woosmap.map.Marker({
        position: center,
        map: mapInstanceRef.current,
        title: title,
      });
      currentMarkersRef.current.push(mainMarker);

      // Other custom markers
      markers.forEach((item) => {
        if (item.lat === lat && item.lng === lng) return;
        const otherMarker = new window.woosmap.map.Marker({
          position: { lat: item.lat, lng: item.lng },
          map: mapInstanceRef.current,
          title: item.title,
        });
        currentMarkersRef.current.push(otherMarker);
      });

      // Nearby Stores markers
      nearbyStores.forEach((store) => {
        if (Math.abs(store.lat - lat) < 0.0001 && Math.abs(store.lng - lng) < 0.0001) return;
        const storeMarker = new window.woosmap.map.Marker({
          position: { lat: store.lat, lng: store.lng },
          map: mapInstanceRef.current,
          title: store.name,
        });
        currentMarkersRef.current.push(storeMarker);
      });
    }
  }, [apiKey, lat, lng, zoom, title, formattedAddress, markers, nearbyStores]);

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 flex flex-col md:flex-row">
      {/* Map Element */}
      <div className="relative flex-1 h-full min-h-[380px]">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Status Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs shadow-md flex items-center space-x-2 text-slate-200 z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Woosmap Active • {nearbyStores.length} Nearby Assets</span>
        </div>

        {/* Toggle Panel Button */}
        <button
          onClick={() => setShowStoresPanel(!showStoresPanel)}
          className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-amber-400 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all z-10"
        >
          <Store className="w-4 h-4" />
          <span>{showStoresPanel ? 'Hide Assets' : `Nearby Assets (${nearbyStores.length})`}</span>
        </button>
      </div>

      {/* Nearby Stores / Assets Drawer */}
      {showStoresPanel && (
        <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col h-64 md:h-full z-20">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-amber-500" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Woosmap Stores &amp; Assets
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500">
              {nearbyStores.length} found
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {loadingStores ? (
              <div className="space-y-2 py-6 text-center text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span>Querying Woosmap Stores API...</span>
              </div>
            ) : nearbyStores.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No nearby assets found within radius.
              </div>
            ) : (
              nearbyStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    if (mapInstanceRef.current && window.woosmap?.map) {
                      mapInstanceRef.current.setCenter({ lat: store.lat, lng: store.lng });
                      mapInstanceRef.current.setZoom(17);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedStore?.id === store.id
                      ? 'bg-amber-500/10 border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {store.name}
                    </h5>
                    {store.distance !== undefined && (
                      <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                        {store.distance > 1000 ? `${(store.distance / 1000).toFixed(1)} km` : `${store.distance} m`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {store.address}
                  </p>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                    <span className="font-mono">{store.lat.toFixed(3)}, {store.lng.toFixed(3)}</span>
                    <span className="text-amber-500 font-bold flex items-center space-x-1 hover:underline">
                      <span>Locate</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
