// src/components/Map.tsx
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap, Marker, Tooltip } from "react-leaflet"; // Added Tooltip
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS for styling

// Fix for default icon markers in Leaflet that don't load correctly from CDN paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface ShipmentStatus {
  date: string;
  status: string;
  location: string;
  coordinates?: [number, number];
}

interface MapProps {
  path: [number, number][]; // Array of [latitude, longitude] coordinates for the route
  shipmentType: 'Truck' | 'Sea' | 'Air' | 'Parcel' | 'International' | 'Rail'; // Type of shipment for icon
  statusTimeline: ShipmentStatus[]; // Full status timeline for dynamic location names
}

// Helper function to get the appropriate vehicle icon URL
const getVehicleIconUrl = (type: MapProps['shipmentType']): string => {
  switch (type) {
    case 'Truck':
      return "https://cdn-icons-png.flaticon.com/512/1047/1047156.png"; // Truck icon
    case 'Sea':
      return "https://cdn-icons-png.flaticon.com/512/168/168536.png"; // Ship icon
    case 'Air':
      return "https://cdn-icons-png.flaticon.com/512/1070/1070317.png"; // Plane icon
    case 'Rail':
      return "https://cdn-icons-png.flaticon.com/512/2933/2933566.png"; // Train icon
    case 'Parcel':
    case 'International':
    default:
      return "https://cdn-icons-png.flaticon.com/512/684/684908.png"; // Generic marker or box
  }
};

// Component to handle map view changes and animated marker logic
const MapContent: React.FC<MapProps> = ({ path, shipmentType, statusTimeline }) => {
  const map = useMap(); // Get the Leaflet map instance from react-leaflet
  const animatedMarkerRef = useRef<L.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Fit map to bounds of the path
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds.pad(0.2), { animate: true, duration: 1.0 });
    }

    // Clear previous marker and animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (animatedMarkerRef.current) {
      map.removeLayer(animatedMarkerRef.current);
      animatedMarkerRef.current = null;
    }

    if (!path || path.length < 2) {
      // If path is too short for animation, just place a static marker at the last point if it exists
      if (path && path.length > 0) {
        const staticIcon = L.icon({
          iconUrl: getVehicleIconUrl(shipmentType),
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });
        const lastPoint = path[path.length - 1];
        animatedMarkerRef.current = L.marker(lastPoint, { icon: staticIcon }).addTo(map);
        const lastLocationName = statusTimeline[statusTimeline.length - 1]?.location || 'Unknown Location';
        animatedMarkerRef.current.bindPopup(`<b>Current Location:</b> ${lastLocationName}`).openPopup();
        map.setView(lastPoint, 10);
      }
      return; // No animation for paths less than 2 points
    }

    // Create custom icon for the animated vehicle
    const vehicleIcon = L.icon({
      iconUrl: getVehicleIconUrl(shipmentType),
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    // Initialize the animated marker at the start of the path
    animatedMarkerRef.current = L.marker(path[0], { icon: vehicleIcon }).addTo(map);
    animatedMarkerRef.current.bindPopup(`<b>Current Location:</b> ${statusTimeline[0]?.location || 'Starting Point'}`).openPopup();

    // Animation logic using requestAnimationFrame for smoother animation
    let startTime: number | null = null;
    const totalAnimationDuration = 15000; // 15 seconds for the entire journey (adjust as needed)

    const animate = (timestamp: DOMHighResTimeStamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      let progress = elapsed / totalAnimationDuration;

      if (progress > 1) {
        progress = 1; // Ensure it stops exactly at the end
      }

      // Calculate the position along the path
      const totalPathSegments = path.length - 1;
      const currentSegmentIndex = Math.min(Math.floor(progress * totalPathSegments), totalPathSegments);
      const segmentProgress = (progress * totalPathSegments) - currentSegmentIndex;

      const startPoint = path[currentSegmentIndex];
      const endPoint = path[currentSegmentIndex + 1] || path[currentSegmentIndex];

      const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
      const lng = endPoint[1] ? startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress : startPoint[1]; // Handle cases where endPoint[1] might be undefined

      animatedMarkerRef.current?.setLatLng([lat, lng]);

      // Determine current named location based on the segment being traversed
      let currentNamedLocation = 'In Transit'; // Default
      if (progress === 0 && statusTimeline.length > 0) {
        currentNamedLocation = statusTimeline[0].location; // Very start
      } else if (progress === 1 && statusTimeline.length > 0) {
        currentNamedLocation = statusTimeline[statusTimeline.length - 1].location; // Very end
      } else if (currentSegmentIndex < statusTimeline.length -1 && statusTimeline[currentSegmentIndex + 1]?.location) {
        // If moving towards a known point, show that point's name
        currentNamedLocation = statusTimeline[currentSegmentIndex + 1].location;
      } else if (statusTimeline[currentSegmentIndex]?.location) {
        // Otherwise, show the location of the segment's start point
        currentNamedLocation = statusTimeline[currentSegmentIndex].location;
      }


      animatedMarkerRef.current?.setPopupContent(`<b>Current Location:</b> ${currentNamedLocation}`);
      animatedMarkerRef.current?.openPopup(); // Ensure popup remains open

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished, ensure marker is at the very last point and shows final location
        animatedMarkerRef.current?.setLatLng(path[path.length - 1]);
        animatedMarkerRef.current?.setPopupContent(`<b>Final Location:</b> ${statusTimeline[statusTimeline.length - 1]?.location || 'Destination'}`);
        animatedMarkerRef.current?.openPopup(); // Keep final popup open
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (animatedMarkerRef.current) {
        map.removeLayer(animatedMarkerRef.current);
      }
    };
  }, [map, path, shipmentType, statusTimeline]); // Re-run effect when map, path, shipmentType, or statusTimeline changes

  // Create static markers for origin and destination with tooltips
  const originMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });

  const destinationMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-red.png', // A different color for destination
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });


  return (
    <>
      {/* Polyline to show the entire path */}
      <Polyline positions={path} color="#007bff" weight={4} opacity={0.7} />

      {/* Static Marker for Origin with Tooltip */}
      {path.length > 0 && statusTimeline.length > 0 && (
        <Marker position={path[0]} icon={originMarkerIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            Origin: {statusTimeline[0]?.location || 'Starting Point'}
          </Tooltip>
        </Marker>
      )}

      {/* Static Marker for Destination with Tooltip */}
      {path.length > 1 && statusTimeline.length > 0 && (
        <Marker position={path[path.length - 1]} icon={destinationMarkerIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            Destination: {statusTimeline[statusTimeline.length - 1]?.location || 'Final Point'}
          </Tooltip>
        </Marker>
      )}
      {/* The animated marker is managed imperatively in the useEffect */}
    </>
  );
};

const Map: React.FC<MapProps> = ({ path, shipmentType, statusTimeline }) => {
  if (!path || path.length === 0) {
    return (
      <div className="w-full h-96 rounded-xl shadow-lg border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-500">
        No map data available for this shipment.
      </div>
    );
  }

  return (
    <div
      className="w-full h-96 rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      style={{ minHeight: '300px' }}
    >
      <MapContainer
        center={path[0]} // Initial center, will be adjusted by MapContent
        zoom={5} // Initial zoom, will be adjusted by MapContent
        scrollWheelZoom={true} // Enable scroll wheel zoom
        className="h-full w-full"
        key={path.join(',')} // Key to force remount if path changes drastically
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Render MapContent as a child to access the map instance via useMap() */}
        <MapContent path={path} shipmentType={shipmentType} statusTimeline={statusTimeline} />
      </MapContainer>
    </div>
  );
};

export default Map;
