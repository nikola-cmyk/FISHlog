import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons using CDN
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

interface LeafletMapViewProps {
  locations: Location[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  showUserLocation?: boolean;
  allowClickToAdd?: boolean;
  height?: string;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function LeafletMapView({
  locations,
  onLocationSelect,
  selectedLocation,
  showUserLocation = false,
  allowClickToAdd = false,
  height = '500px',
}: LeafletMapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);

  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setMapCenter([userPos.lat, userPos.lng]);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [showUserLocation]);

  const validLocations = locations.filter(
    (loc) => loc.latitude !== undefined && loc.longitude !== undefined
  );

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border-2 border-ocean-200">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="/images/photo1767962795.jpg"
          maxZoom={19}
        />
        
        {allowClickToAdd && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {validLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude!, location.longitude!]}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold text-ocean-900">{location.name}</h3>
                {location.description && (
                  <p className="text-ocean-600 mt-1">{location.description}</p>
                )}
                <p className="text-xs text-ocean-500 mt-2">
                  {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold text-blue-600">New Location</h3>
                <p className="text-xs text-ocean-500 mt-1">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold text-blue-600 flex items-center">
                  <Navigation className="h-4 w-4 mr-1" />
                  Your Location
                </h3>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}