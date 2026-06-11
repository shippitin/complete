// src/components/Map.tsx
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Exact route traced from Google Maps photo:
// Chennai → SE Bay of Bengal → west of Andamans → curves right into Andaman Sea
// → enters Malacca Strait from the EAST (between Malaysia east coast & Sumatra)
// → south down strait → Singapore
const CHENNAI_SINGAPORE: [number, number][] = [
  [13.0827,  80.2707],  // Chennai
  [12.0000,  81.5000],  // SE into Bay of Bengal
  [10.5000,  83.5000],  // Bay of Bengal, curving south
  [8.5000,   86.0000],  // Mid Bay of Bengal heading SE
  [6.5000,   89.0000],  // Passing west of Andaman Islands
  [5.0000,   92.0000],  // Curving east toward Andaman Sea
  [4.5000,   95.5000],  // Andaman Sea, west of Sumatra north tip
  [4.2000,   98.0000],  // Entering Malacca Strait from north
  [3.8000,  100.5000],  // Malacca Strait — between Malaysia & Sumatra
  [3.0000,  101.5000],  // Mid strait (Port Klang / Klang area east)
  [2.2000,  102.5000],  // South Malacca Strait
  [1.5000,  103.5000],  // Singapore Strait approach
  [1.3521,  103.8198],  // Singapore
];

const CHENNAI_HAMBURG: [number, number][] = [
  [13.0827,  80.2707],
  [8.0000,   78.0000],
  [5.9000,   79.0000],
  [4.0000,   73.0000],
  [10.0000,  57.0000],
  [12.0000,  45.0000],
  [20.0000,  38.5000],
  [27.0000,  34.0000],
  [30.5000,  32.4000],
  [36.0000,  14.0000],
  [36.0000,  -5.5000],
  [44.0000, -10.0000],
  [53.5500,   9.9500],
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

// Split a path at fraction t into the traveled portion and the remaining portion,
// meeting exactly at the interpolated cut point so the two polylines join cleanly.
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

const makeVehicleIcon = (type: MapProps['shipmentType']) => {
  const emoji = type === 'Sea' ? '🚢' : type === 'Air' ? '✈️' : type === 'Rail' ? '🚂' : '🚚';
  return L.divIcon({
    className: '',
    html: `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5));user-select:none;">${emoji}</div>`,
    iconSize:   [30, 30],
    iconAnchor: [15, 15],
    popupAnchor:[0, -20],
  });
};

const makeDotIcon = (color: string) => L.divIcon({
  className: '',
  html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px ${color};"></div>`,
  iconSize:   [12, 12],
  iconAnchor: [6, 6],
});

const MapContent: React.FC<MapProps & { animPath: [number, number][] }> = ({
  path, shipmentType, statusTimeline, animPath, progress = 1, delivered = false,
}) => {
  const map       = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const frameRef  = useRef<number | null>(null);
  const startRef  = useRef<number | null>(null);

  const isSea = shipmentType === 'Sea';
  const isAir = shipmentType === 'Air';
  const originName = statusTimeline[0]?.location || 'Origin';
  const destName   = statusTimeline[statusTimeline.length - 1]?.location || 'Destination';
  const vehicleEmoji = isSea ? '🚢' : isAir ? '✈️' : shipmentType === 'Rail' ? '🚂' : '🚚';

  const targetT = Math.max(0, Math.min(progress, 1));
  const { traveled, remaining } = splitPath(animPath, targetT);

  useEffect(() => {
    // Fit exactly like the photo: Chennai top-left, Singapore bottom-right
    if (isSea) {
      map.fitBounds(
        L.latLngBounds([[0.5, 78.5], [14.0, 105.0]]),
        { animate: true, duration: 1.0, padding: [20, 20] }
      );
    } else {
      map.fitBounds(L.latLngBounds(animPath).pad(0.2), { animate: true, duration: 1.0 });
    }

    if (frameRef.current)  { cancelAnimationFrame(frameRef.current);  frameRef.current  = null; }
    if (markerRef.current) { map.removeLayer(markerRef.current);       markerRef.current = null; }
    startRef.current = null;
    if (animPath.length < 2) return;

    const icon = makeVehicleIcon(shipmentType);
    markerRef.current = L.marker(animPath[0], { icon }).addTo(map);
    markerRef.current
      .bindPopup(
        `<div style="font-size:13px;font-family:sans-serif;padding:2px 6px"><b>${vehicleEmoji} Departed: ${originName}</b></div>`,
        { closeButton: false, autoPan: false }
      ).openPopup();

    // Animate from origin to the target fraction; speed kept ~constant by scaling
    // the duration to the distance so a 60% trip takes 60% of the time.
    const DURATION = Math.max(2500, 22000 * targetT);
    const tick = (ts: DOMHighResTimeStamp) => {
      if (!startRef.current) startRef.current = ts;
      const raw = Math.min((ts - startRef.current) / DURATION, 1);
      const t   = raw * targetT;
      markerRef.current?.setLatLng(interpolate(animPath, t));
      const pct = Math.round(t * 100);
      const label =
        delivered && raw >= 1 ? `✅ Delivered: ${destName}`
        : t < 0.03            ? `${vehicleEmoji} Departed: ${originName}`
        :                       `${vehicleEmoji} En Route — ${pct}% complete`;
      markerRef.current?.setPopupContent(
        `<div style="font-size:13px;font-family:sans-serif;padding:2px 6px"><b>${label}</b></div>`
      );
      markerRef.current?.openPopup();
      if (raw < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current)  cancelAnimationFrame(frameRef.current);
      if (markerRef.current) map.removeLayer(markerRef.current);
    };
  }, [map, animPath, shipmentType, originName, destName, targetT, delivered, vehicleEmoji]);

  const lineColor = isSea ? '#1e40af' : isAir ? '#7c3aed' : '#ea580c';

  return (
    <>
      {/* Traveled portion — solid, bright */}
      <Polyline
        positions={traveled}
        color={lineColor}
        weight={4}
        opacity={1}
        dashArray={isSea || isAir ? '8 5' : undefined}
      />
      {/* Remaining portion — faded grey dashes (hidden once delivered) */}
      {remaining.length > 1 && (
        <Polyline positions={remaining} color="#9ca3af" weight={3} opacity={0.5} dashArray="6 8" />
      )}
      {path.length > 0 && (
        <Marker position={path[0]} icon={makeDotIcon('#1e40af')}>
          <Tooltip permanent direction="top" offset={[0, -6]}>📍 {originName}</Tooltip>
        </Marker>
      )}
      {path.length > 1 && (
        <Marker position={path[path.length - 1]} icon={makeDotIcon(delivered ? '#15803d' : '#9ca3af')}>
          <Tooltip permanent direction="top" offset={[0, -6]}>{delivered ? '✅' : '🏁'} {destName}</Tooltip>
        </Marker>
      )}
    </>
  );
};

const Map: React.FC<MapProps> = ({ path, shipmentType, statusTimeline, progress, delivered }) => {
  if (!path || path.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
        No map data available.
      </div>
    );
  }
  const isSea = shipmentType === 'Sea';
  const animPath: [number, number][] = isSea && path.length === 2
    ? getSeaRoute(path[0], path[1])
    : path;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: '300px' }}>
      <MapContainer
        center={[7.0, 92.0]}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
        key={path.map(p => p.join(',')).join('|')}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapContent
          path={path}
          shipmentType={shipmentType}
          statusTimeline={statusTimeline}
          animPath={animPath}
          progress={progress}
          delivered={delivered}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
