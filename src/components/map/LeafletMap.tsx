import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  id: number;
  type: string;
  lat: number;
  lng: number;
  label: string;
  desc: string;
  time: string;
  confirms: number;
}

interface Props {
  points: MapPoint[];
  center: [number, number];
  userLocation: [number, number] | null;
  iconFor: (type: string) => { color: string; svg: string };
  onSelect: (p: MapPoint) => void;
}

const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom() < 14 ? 14 : map.getZoom(), { duration: 0.8 });
  }, [center, map]);
  return null;
};

const LeafletMap = ({ points, center, userLocation, iconFor, onSelect }: Props) => {
  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      className="w-full h-full"
      style={{ background: "hsl(var(--muted))" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />
      {points.map((p) => {
        const cfg = iconFor(p.type);
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:34px;height:34px;border-radius:999px;background:${cfg.color};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.28);border:2px solid #fff">${cfg.svg}</div>
            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${cfg.color};margin-top:-2px"></div>
          </div>`,
          iconSize: [34, 42],
          iconAnchor: [17, 42],
        });
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(p) }}
          />
        );
      })}
      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={8}
          pathOptions={{ color: "#ffffff", weight: 3, fillColor: "hsl(202,80%,45%)", fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
};

export default LeafletMap;
