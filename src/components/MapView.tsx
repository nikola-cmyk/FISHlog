import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
const iconDefault = L.Icon.Default.prototype as Record<string, unknown>;
delete iconDefault._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for fishing locations
const fishingLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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

interface MapViewProps {
  locations: Location[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  showUserLocation?: boolean;
  allowClickToAdd?: boolean;
  height?: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect, allowClickToAdd }: { onLocationSelect?: (lat: number, lng: number) => void; allowClickToAdd?: boolean }) {
  useMapEvents({
    click(e) {
      if (allowClickToAdd && onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Component to center map on user location
function CenterMapButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const centerOnUser = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 13);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <Button
      onClick={centerOnUser}
      disabled={isLocating}
      className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-100 text-ocean-700 border-2 border-ocean-300 shadow-lg"
      size="sm"
    >
      <Navigation className={`h-4 w-4 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
      {isLocating ? 'Locating...' : 'My Location'}
    </Button>
  );
}

export default function MapView({
  locations,
  onLocationSelect,
  selectedLocation,
  showUserLocation = true,
  allowClickToAdd = false,
  height = '500px'
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    // Get user's current location
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
          // Default to world view if location access denied
          setMapCenter([20, 0]);
          setMapZoom(2);
        }
      );
    } else {
      // If no user location, center on first location or world view
      if (locations.length > 0 && locations[0].latitude && locations[0].longitude) {
        setMapCenter([locations[0].latitude, locations[0].longitude]);
        setMapZoom(10);
      } else {
        setMapCenter([20, 0]);
        setMapZoom(2);
      }
    }
  }, [showUserLocation, locations]);

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-ocean-300 shadow-lg" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="/images/OpenStreetMap.jpg"
        />
        
        {/* User's current location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-ocean-900">Your Location</p>
                <p className="text-xs text-ocean-600">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Saved fishing locations */}
        {locations.map((location) => {
          if (location.latitude && location.longitude) {
            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={fishingLocationIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-ocean-600" />
                      <p className="font-semibold text-ocean-900">{location.name}</p>
                    </div>
                    {location.description && (
                      <p className="text-sm text-ocean-700 mb-2">{location.description}</p>
                    )}
                    <p className="text-xs text-ocean-600">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}

        {/* Selected location (when adding new) */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-ocean-900">New Location</p>
                <p className="text-xs text-ocean-600">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        <MapClickHandler onLocationSelect={onLocationSelect} allowClickToAdd={allowClickToAdd} />
        <CenterMapButton />
      </MapContainer>

      {allowClickToAdd && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border-2 border-ocean-300">
          <p className="text-sm text-ocean-900 font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ocean-600" />
            Click on the map to set location
          </p>
        </div>
      )}
    </div>
  );
}