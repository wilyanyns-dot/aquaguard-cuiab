import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, CircleMarker } from "react-leaflet";
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
  dark?: boolean;
}

const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom() < 14 ? 14 : map.getZoom(), { duration: 0.9 });
  }, [center, map]);
  return null;
};

type Cluster = { key: string; lat: number; lng: number; items: MapPoint[] };

const ClusteredMarkers = ({
  points,
  iconFor,
  onSelect,
  dark,
}: {
  points: MapPoint[];
  iconFor: Props["iconFor"];
  onSelect: Props["onSelect"];
  dark: boolean;
}) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const clusters = useMemo<Cluster[]>(() => {
    // grid size shrinks as zoom increases -> markers separate on zoom in
    if (zoom >= 15) return points.map((p) => ({ key: `p${p.id}`, lat: p.lat, lng: p.lng, items: [p] }));
    const cell = 0.9 / Math.pow(2, zoom - 8); // degrees
    const buckets = new Map<string, Cluster>();
    points.forEach((p) => {
      const key = `${Math.round(p.lat / cell)}_${Math.round(p.lng / cell)}`;
      const existing = buckets.get(key);
      if (existing) existing.items.push(p);
      else buckets.set(key, { key, lat: p.lat, lng: p.lng, items: [p] });
    });
    return Array.from(buckets.values()).map((c) => ({
      ...c,
      lat: c.items.reduce((a, p) => a + p.lat, 0) / c.items.length,
      lng: c.items.reduce((a, p) => a + p.lng, 0) / c.items.length,
    }));
  }, [points, zoom]);

  return (
    <>
      {clusters.map((c) => {
        if (c.items.length > 1) {
          const size = c.items.length > 25 ? 52 : c.items.length > 9 ? 44 : 38;
          const icon = L.divIcon({
            className: "",
            html: `<div style="width:${size}px;height:${size}px;border-radius:999px;display:flex;align-items:center;justify-content:center;
              background:${dark ? "rgba(12,32,52,.75)" : "rgba(255,255,255,.75)"};
              backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
              border:1.5px solid rgba(56,189,248,.75);
              box-shadow:0 0 18px rgba(56,189,248,.45);
              color:${dark ? "#e6f6ff" : "#0b3555"};font:600 13px/1 'Plus Jakarta Sans',sans-serif;">${c.items.length}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
          return (
            <Marker
              key={c.key}
              position={[c.lat, c.lng]}
              icon={icon}
              eventHandlers={{ click: () => map.flyTo([c.lat, c.lng], Math.min(map.getZoom() + 2, 17), { duration: 0.7 }) }}
            />
          );
        }
        const p = c.items[0];
        const cfg = iconFor(p.type);
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:28px;height:28px;border-radius:999px;background:${cfg.color};display:flex;align-items:center;justify-content:center;
              box-shadow:0 0 14px ${cfg.color}aa, 0 3px 8px rgba(0,0,0,.35);
              border:1.5px solid rgba(255,255,255,.9)">${cfg.svg}</div>
            <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid ${cfg.color};margin-top:-1px"></div>
          </div>`,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
        });
        return <Marker key={c.key} position={[p.lat, p.lng]} icon={icon} eventHandlers={{ click: () => onSelect(p) }} />;
      })}
    </>
  );
};

const LeafletMap = ({ points, center, userLocation, iconFor, onSelect, dark = false }: Props) => {
  // OSM tiles (key-free). Dark mode is achieved with a CSS filter on the tile pane.
  const tiles = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      className="w-full h-full"
      style={{ background: dark ? "#0b1622" : "#eef3f7" }}
      
    >
      <TileLayer
        key={dark ? "dark" : "light"}
        attribution='&copy; OpenStreetMap'
        url={tiles}
        className={dark ? "map-tiles-dark" : ""}
      />
      <Recenter center={center} />
      <ClusteredMarkers points={points} iconFor={iconFor} onSelect={onSelect} dark={dark} />
      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={8}
          pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#22b8ff", fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
};

export default LeafletMap;
