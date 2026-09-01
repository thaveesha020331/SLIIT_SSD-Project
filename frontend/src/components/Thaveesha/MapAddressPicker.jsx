import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { reverseGeocode } from '../../services/Thaveesha/mapService';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in bundler (Vite/Webpack)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapClickHandler({ onSelect, setLoading }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLoading(true);
      try {
        const address = await reverseGeocode(lat, lng);
        onSelect({ address, lat, lng });
      } catch (err) {
        onSelect({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
      } finally {
        setLoading(false);
      }
    },
  });
  return null;
}

export default function MapAddressPicker({ onSelect, onClose, initialCenter = [7.8731, 80.7718], initialZoom = 7 }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback(
    (result) => {
      setPosition([result.lat, result.lng]);
      onSelect(result);
    },
    [onSelect]
  );

  return (
    <div className="map-picker-overlay">
      <div className="map-picker-box">
        <div className="map-picker-header">
          <h3>Set delivery location</h3>
          <p>Click on the map to set your address. Address will be filled automatically.</p>
          <button type="button" className="map-picker-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="map-picker-body">
          {loading && <div className="map-picker-loading">Getting address...</div>}
          <MapContainer
            center={position || initialCenter}
            zoom={position ? 15 : initialZoom}
            style={{ height: '320px', width: '100%', borderRadius: 8 }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && <Marker position={position} />}
            <MapClickHandler onSelect={handleSelect} setLoading={setLoading} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
