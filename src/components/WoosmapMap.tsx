import React, { useEffect, useRef } from 'react';

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

      // Other markers
      markers.forEach((item) => {
        if (item.lat === lat && item.lng === lng) return;
        const otherMarker = new window.woosmap.map.Marker({
          position: { lat: item.lat, lng: item.lng },
          map: mapInstanceRef.current,
          title: item.title,
        });
        currentMarkersRef.current.push(otherMarker);
      });
    }
  }, [apiKey, lat, lng, zoom, title, formattedAddress, markers]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-sm flex items-center space-x-2 text-slate-700 dark:text-slate-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Woosmap Active • {lat.toFixed(4)}, {lng.toFixed(4)}</span>
      </div>
    </div>
  );
};
