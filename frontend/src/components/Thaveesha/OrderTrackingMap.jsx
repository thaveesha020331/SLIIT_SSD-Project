import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { geocodeAddress } from '../../services/Thaveesha/mapService';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const PackageIcon = L.divIcon({
  className: 'package-marker',
  html: '<div style="background:#84cc16;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * Shows delivery destination (and optional package location) on map.
 * @param {string} shippingAddress - address string (used if lat/lng not provided)
 * @param {number|null} shippingLat
 * @param {number|null} shippingLng
 * @param {number|null} trackingLat - optional current package location
 * @param {number|null} trackingLng
 */
export default function OrderTrackingMap({
  shippingAddress,
  shippingLat,
  shippingLng,
  trackingLat,
  trackingLng,
}) {
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const defaultCenter = [7.8731, 80.7718];
  const defaultZoom = 7;

  useEffect(() => {
    let cancelled = false;
    if (shippingLat != null && shippingLng != null) {
      setDest({ lat: Number(shippingLat), lng: Number(shippingLng) });
      setLoading(false);
      return;
    }
    if (shippingAddress && shippingAddress.trim()) {
      geocodeAddress(shippingAddress).then((coords) => {
        if (!cancelled && coords) setDest(coords);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [shippingAddress, shippingLat, shippingLng]);

  if (loading) {
    return <div className="order-tracking-map order-tracking-map-loading">Loading map...</div>;
  }

  const center = dest ? [dest.lat, dest.lng] : defaultCenter;
  const zoom = dest ? 14 : defaultZoom;
  const hasTracking = trackingLat != null && trackingLng != null;

  return (
    <div className="order-tracking-map">
      <h4>Delivery location</h4>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '280px', width: '100%', borderRadius: 8 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {dest && (
          <Marker position={[dest.lat, dest.lng]}>
            <Popup>Delivery address</Popup>
          </Marker>
        )}
        {hasTracking && (
          <Marker position={[Number(trackingLat), Number(trackingLng)]} icon={PackageIcon}>
            <Popup>Package location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
