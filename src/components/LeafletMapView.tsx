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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          if (locations.length === 0) {
            setMapCenter(coords);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [showUserLocation, locations.length]);

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
      setMapZoom(15);
    } else if (locations.length > 0 && locations[0].latitude && locations[0].longitude) {
      setMapCenter([locations[0].latitude, locations[0].longitude]);
    }
  }, [selectedLocation, locations]);

  return (
    <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="/images/photo1767964598.jpg"
          maxZoom={19}
        />
        
        {allowClickToAdd && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {locations.map((location) => {
          if (!location.latitude || !location.longitude) return null;
          return (
            <Marker key={location.id} position={[location.latitude, location.longitude]}>
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold text-ocean-900">{location.name}</h3>
                  {location.description && <p className="text-ocean-600 mt-1">{location.description}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Selected Location</p>
                <p className="text-xs text-gray-600">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              className: 'user-location-marker',
            })}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold flex items-center">
                  <Navigation className="h-4 w-4 mr-1 text-blue-600" />
                  Your Location
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}