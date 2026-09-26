import React, { useEffect, useRef } from 'react';

interface WoosmapPreviewProps {
  apiKey: string;
  lat: number;
  lng: number;
  zoom?: number;
  draggable?: boolean;
  onPositionChange?: (pos: { lat: number; lng: number }) => void;
  title?: string;
}

export const WoosmapPreview: React.FC<WoosmapPreviewProps> = ({
  apiKey,
  lat,
  lng,
  zoom = 17,
  draggable = true,
  onPositionChange,
  title = 'Target Location'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) return;

    function initMap() {
      if (!containerRef.current || !window.woosmap?.map) return;
      const center = { lat, lng };

      if (!mapRef.current) {
        mapRef.current = new window.woosmap.map.Map(containerRef.current, {
          center,
          zoom,
        });
      } else {
        mapRef.current.setCenter(center);
        mapRef.current.setZoom(zoom);
      }

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      const marker = new window.woosmap.map.Marker({
        position: center,
        map: mapRef.current,
        draggable: Boolean(draggable),
        title: title,
      });

      markerRef.current = marker;
    }

    if (!window.woosmap) {
      const existingScript = document.getElementById('woosmap-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'woosmap-maps-script';
        script.src = `https://sdk.woosmap.com/map/map.js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', initMap);
      }
    } else {
      initMap();
    }
  }, [apiKey, lat, lng, zoom, draggable, title]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <div ref={containerRef} className="w-full h-full min-h-[350px]" />
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-amber-300 font-mono">
        Woosmap Map Preview
      </div>
    </div>
  );
};
