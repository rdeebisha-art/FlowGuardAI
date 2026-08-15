import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix default leaflet marker icons (not bundled in build)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER: [number, number] = [13.0827, 80.2707];

type MapTone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'orange';

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tone?: MapTone | (string & {});
  label?: string;
  radius?: number;
}

const toneColors: Record<string, string> = {
  cyan: '#22d3ee',
  emerald: '#34d399',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#38bdf8',
  violet: '#a78bfa',
  orange: '#fb923c',
};

interface Route {
  points: [number, number][];
  color?: string;
}

export function CityMap({
  points = [],
  routes = [],
  height = 360,
  interactive = true,
}: {
  points?: MapPoint[];
  routes?: Route[];
  height?: number | string;
  interactive?: boolean;
}) {
  // Ensure leaflet recalculates size after mount
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <div style={{ height: typeof height === 'number' ? `${height}px` : height }} className="rounded-xl overflow-hidden border border-cyan-400/15 relative">
      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {routes.map((r, i) => (
          <Polyline
            key={i}
            positions={r.points}
            pathOptions={{ color: r.color || '#22d3ee', weight: 4, opacity: 0.8, dashArray: '8 6' }}
          />
        ))}
        {points.map((p) => {
          const color = toneColors[p.tone || 'cyan'] || '#22d3ee';
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={p.radius || 8}
              pathOptions={{
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.55,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold text-sm mb-0.5">{p.name}</div>
                  {p.label && <div className="text-slate-300">{p.label}</div>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export { toneColors };
