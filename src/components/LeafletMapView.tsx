import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons - use CDN URLs directly
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
  showUserLocation = true,
  allowClickToAdd = false,
  height = '500px'
}: LeafletMapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    if (showUserLocation && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setMapCenter([userPos.lat, userPos.lng]);
          setMapZoom(13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [showUserLocation]);

  const centerOnUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          setMapCenter([pos.lat, pos.lng]);
          setMapZoom(13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-ocean-300 shadow-lg" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', cursor: allowClickToAdd ? 'crosshair' : 'grab' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="/images/photo1767961834.jpg"
          maxZoom={19}
        />
        
        {allowClickToAdd && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold mb-1">Your Location</p>
                <p className="text-xs text-gray-600">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {locations.map((location) => {
          if (location.latitude && location.longitude) {
            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={locationIcon}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <p className="font-semibold mb-1">{location.name}</p>
                    {location.description && (
                      <p className="text-sm mb-2">{location.description}</p>
                    )}
                    <p className="text-xs text-gray-600">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}

        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={selectedIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold mb-1">New Location</p>
                <p className="text-xs text-gray-600">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <Button
        onClick={centerOnUser}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-100 text-ocean-700 border-2 border-ocean-300 shadow-lg"
        size="sm"
      >
        <Navigation className="h-4 w-4 mr-1" />
        My Location
      </Button>

      {allowClickToAdd && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border-2 border-ocean-300">
          <p className="text-sm text-ocean-900 font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-ocean-600" />
            Click anywhere on the map to set location
          </p>
          <p className="text-xs text-ocean-600 mt-1">
            The map will automatically place a marker where you click
          </p>
        </div>
      )}
    </div>
  );
}