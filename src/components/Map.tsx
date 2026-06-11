// src/components/Map.tsx — Google Maps (region=IN for correct India borders)
import React, { useEffect, useRef, useState } from "react";

// Google Maps JS key — same key used across the app. In a frontend app this is
// necessarily public; protect billing with an HTTP-referrer restriction in
// Google Cloud Console. The "Maps JavaScript API" must be enabled for this key.
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyAMBNRVdFnvb3I2Z7FuFdzfy_BrBk77obY';

interface ShipmentStatus {
  date: string;
  status: string;
  location: string;
  coordinates?: [number, number];
}

interface MapProps {
  path: [number, number][];
  shipmentType: 'Truck' | 'Sea' | 'Air' | 'Parcel' | 'International' | 'Rail';
  statusTimeline: ShipmentStatus[];
  progress?: number;   // 0..1 target journey completion (default 1 = animate full route)
  delivered?: boolean; // true → vehicle rests at destination as "Delivered"
}

// Hand-traced sea corridors (Google Maps draws great-circle straight lines that
// cut across land, so we feed it real waypoints for the known ocean routes).
const CHENNAI_SINGAPORE: [number, number][] = [
  [13.0827,  80.2707], [12.0000, 81.5000], [10.5000, 83.5000], [8.5000, 86.0000],
  [6.5000,   89.0000], [5.0000,  92.0000], [4.5000,  95.5000], [4.2000, 98.0000],
  [3.8000,  100.5000], [3.0000, 101.5000], [2.2000, 102.5000], [1.5000, 103.5000],
  [1.3521,  103.8198],
];
const CHENNAI_HAMBURG: [number, number][] = [
  [13.0827, 80.2707], [8.0000, 78.0000], [5.9000, 79.0000], [4.0000, 73.0000],
  [10.0000, 57.0000], [12.0000, 45.0000], [20.0000, 38.5000], [27.0000, 34.0000],
  [30.5000, 32.4000], [36.0000, 14.0000], [36.0000, -5.5000], [44.0000, -10.0000],
  [53.5500,  9.9500],
];

const getSeaRoute = (start: [number, number], end: [number, number]): [number, number][] => {
  const r = (n: number) => Math.round(n);
  if (r(end[0]) === 1 && (r(end[1]) === 104 || r(end[1]) === 103)) return CHENNAI_SINGAPORE;
  if (r(end[0]) > 50 && r(end[1]) > 5 && r(end[1]) < 15) return CHENNAI_HAMBURG;
  return [start, end];
};

const interpolate = (path: [number, number][], t: number): [number, number] => {
  if (t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];
  const segs = path.length - 1;
  const raw  = t * segs;
  const idx  = Math.min(Math.floor(raw), segs - 1);
  const seg  = raw - idx;
  const a = path[idx], b = path[idx + 1];
  return [a[0] + (b[0] - a[0]) * seg, a[1] + (b[1] - a[1]) * seg];
};

// Split a path at fraction t into traveled + remaining, meeting at the cut point.
const splitPath = (
  path: [number, number][],
  t: number,
): { traveled: [number, number][]; remaining: [number, number][] } => {
  if (t <= 0) return { traveled: [path[0]], remaining: path };
  if (t >= 1) return { traveled: path, remaining: [] };
  const segs = path.length - 1;
  const idx  = Math.min(Math.floor(t * segs), segs - 1);
  const cut  = interpolate(path, t);
  return {
    traveled:  [...path.slice(0, idx + 1), cut],
    remaining: [cut, ...path.slice(idx + 1)],
  };
};

const vehicleEmojiFor = (t: MapProps['shipmentType']) =>
  t === 'Sea' ? '🚢' : t === 'Air' ? '✈️' : t === 'Rail' ? '🚂' : '🚚';

// Singleton loader for the Google Maps JS SDK (region=IN → India's official map).
let gmapsPromise: Promise<void> | null = null;
const loadGoogleMaps = (): Promise<void> => {
  if ((window as any).google?.maps) return Promise.resolve();
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&region=IN&language=en`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  });
  return gmapsPromise;
};

const Map: React.FC<MapProps> = ({ path, shipmentType, statusTimeline, progress = 1, delivered = false }) => {
  const divRef      = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const frameRef    = useRef<number | null>(null);
  const [ready, setReady]   = useState<boolean>(!!(window as any).google?.maps);
  const [failed, setFailed] = useState(false);

  // Load the SDK once
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps()
      .then(() => { if (mounted) setReady(true); })
      .catch(() => { if (mounted) setFailed(true); });
    return () => { mounted = false; };
  }, []);

  const isSea = shipmentType === 'Sea';
  const animPath: [number, number][] =
    isSea && path && path.length === 2 ? getSeaRoute(path[0], path[1]) : (path || []);

  // Build / rebuild the route, markers and animation whenever inputs change
  useEffect(() => {
    if (!ready || !divRef.current || animPath.length === 0) return;
    const g = (window as any).google;
    const toLL = (p: [number, number]) => ({ lat: p[0], lng: p[1] });

    if (!mapRef.current) {
      mapRef.current = new g.maps.Map(divRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        clickableIcons: false,
      });
    }
    const map = mapRef.current;

    // Clean HTML label overlay (no close button — unlike InfoWindow)
    class LabelOverlay extends g.maps.OverlayView {
      position: any; html: string; div: HTMLDivElement | null = null;
      constructor(position: any, html: string) { super(); this.position = position; this.html = html; }
      onAdd() {
        const d = document.createElement('div');
        d.style.cssText =
          'position:absolute;transform:translate(-50%,-145%);background:#fff;padding:3px 9px;' +
          'border-radius:9px;font:600 12px/1.2 sans-serif;color:#1f2937;white-space:nowrap;' +
          'box-shadow:0 2px 6px rgba(0,0,0,.25);pointer-events:none;';
        d.innerHTML = this.html;
        this.div = d;
        this.getPanes().floatPane.appendChild(d);
      }
      draw() {
        if (!this.div) return;
        const p = this.getProjection()?.fromLatLngToDivPixel(this.position);
        if (p) { this.div.style.left = `${p.x}px`; this.div.style.top = `${p.y}px`; }
      }
      update(position: any, html: string) {
        this.position = position;
        if (this.div) this.div.innerHTML = html;
        this.draw();
      }
      onRemove() { if (this.div) { this.div.remove(); this.div = null; } }
    }

    // Tear down previous overlays + animation
    overlaysRef.current.forEach(o => o.setMap && o.setMap(null));
    overlaysRef.current = [];
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }

    const targetT  = Math.max(0, Math.min(progress, 1));
    const { traveled, remaining } = splitPath(animPath, targetT);
    const originName = statusTimeline[0]?.location || 'Origin';
    const destName   = statusTimeline[statusTimeline.length - 1]?.location || 'Destination';
    const emoji      = vehicleEmojiFor(shipmentType);
    const lineColor  = isSea ? '#1e40af' : shipmentType === 'Air' ? '#7c3aed' : '#ea580c';

    // Fit the viewport to the route
    const bounds = new g.maps.LatLngBounds();
    animPath.forEach(p => bounds.extend(toLL(p)));
    map.fitBounds(bounds, 56);

    // Traveled portion — solid bright line
    overlaysRef.current.push(new g.maps.Polyline({
      path: traveled.map(toLL), strokeColor: lineColor, strokeOpacity: 1, strokeWeight: 4, map,
    }));

    // Remaining portion — grey dashed
    if (remaining.length > 1) {
      overlaysRef.current.push(new g.maps.Polyline({
        path: remaining.map(toLL), strokeOpacity: 0, map,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeColor: '#9ca3af', strokeOpacity: 0.8, scale: 3 },
          offset: '0', repeat: '13px',
        }],
      }));
    }

    // Origin & destination dots + name tags
    const originDot = new g.maps.Marker({
      position: toLL(path[0]), map,
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#1e40af', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
    });
    const destDot = new g.maps.Marker({
      position: toLL(path[path.length - 1]), map,
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 7, fillColor: delivered ? '#15803d' : '#9ca3af', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
    });
    overlaysRef.current.push(originDot, destDot);

    const originTag = new LabelOverlay(toLL(path[0]), `📍 ${originName}`);
    const destTag   = new LabelOverlay(toLL(path[path.length - 1]), `${delivered ? '✅' : '🏁'} ${destName}`);
    originTag.setMap(map);
    destTag.setMap(map);
    overlaysRef.current.push(originTag, destTag);

    // Moving vehicle (emoji) + live progress tag
    const vehicle = new g.maps.Marker({
      position: toLL(animPath[0]),
      map,
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 0 },
      label: { text: emoji, fontSize: '26px' },
      zIndex: 999,
    });
    const vehicleTag = new LabelOverlay(toLL(animPath[0]), `${emoji} Departed: ${originName}`);
    vehicleTag.setMap(map);
    overlaysRef.current.push(vehicle, vehicleTag);

    // Animate origin → target fraction; duration scales with distance for constant speed
    const DURATION = Math.max(2500, 22000 * targetT);
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const raw = Math.min((ts - start) / DURATION, 1);
      const t   = raw * targetT;
      const pos = interpolate(animPath, t);
      const ll  = toLL(pos);
      vehicle.setPosition(ll);
      const pct = Math.round(t * 100);
      const label =
        delivered && raw >= 1 ? `✅ Delivered: ${destName}`
        : t < 0.03            ? `${emoji} Departed: ${originName}`
        :                       `${emoji} En Route — ${pct}% complete`;
      vehicleTag.update(ll, label);
      if (raw < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, JSON.stringify(animPath), progress, delivered, shipmentType, JSON.stringify(statusTimeline)]);

  if (!path || path.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
        No map data available.
      </div>
    );
  }

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 text-sm gap-1 p-4 text-center">
        <span className="font-semibold">Map could not load.</span>
        <span className="text-xs text-gray-400">Enable the “Maps JavaScript API” for this key in Google Cloud Console.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ minHeight: '300px' }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-sm z-10">
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent mr-2" />
          Loading map…
        </div>
      )}
      <div ref={divRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
