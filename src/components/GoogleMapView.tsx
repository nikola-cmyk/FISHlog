import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

interface GoogleMapViewProps {
  locations: Location[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  showUserLocation?: boolean;
  allowClickToAdd?: boolean;
  height?: string;
}

export default function GoogleMapView({
  locations,
  onLocationSelect,
  selectedLocation,
  showUserLocation = true,
  allowClickToAdd = false,
  height = '500px'
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // Get user location first
        let initialCenter = { lat: 20, lng: 0 };
        let initialZoom = 2;

        if (showUserLocation && 'geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userPos);
            initialCenter = userPos;
            initialZoom = 13;
          } catch (error) {
            console.error('Error getting location:', error);
          }
        }

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        // Add click listener for adding new locations
        if (allowClickToAdd && onLocationSelect) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onLocationSelect(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [showUserLocation, allowClickToAdd, onLocationSelect]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <p style="font-weight: 600; margin-bottom: 4px;">Your Location</p>
            <p style="font-size: 12px; color: #666;">
              ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(map, userMarker);
      });

      markersRef.current.push(userMarker);
    }

    // Add fishing location markers
    locations.forEach(location => {
      if (location.latitude && location.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: map,
          title: location.name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <p style="font-weight: 600; margin: 0;">${location.name}</p>
              </div>
              ${location.description ? `<p style="font-size: 14px; margin-bottom: 8px;">${location.description}</p>` : ''}
              <p style="font-size: 12px; color: #666;">
                ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      }
    });

    // Add selected location marker
    if (selectedLocation) {
      const selectedMarker = new google.maps.Marker({
        position: selectedLocation,
        map: map,
        title: 'New Location',
        animation: google.maps.Animation.DROP,
      });

      const selectedInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <p style="font-weight: 600; margin-bottom: 4px;">New Location</p>
            <p style="font-size: 12px; color: #666;">
              ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      selectedMarker.addListener('click', () => {
        selectedInfoWindow.open(map, selectedMarker);
      });

      markersRef.current.push(selectedMarker);
    }
  }, [locations, selectedLocation, userLocation]);

  const centerOnUser = () => {
    if ('geolocation' in navigator && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          mapInstanceRef.current?.setCenter(pos);
          mapInstanceRef.current?.setZoom(13);
          setUserLocation(pos);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-ocean-300 shadow-lg" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-ocean-600 mx-auto mb-2" />
            <p className="text-sm text-ocean-700">Loading map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      <Button
        onClick={centerOnUser}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-100 text-ocean-700 border-2 border-ocean-300 shadow-lg"
        size="sm"
      >
        <Navigation className="h-4 w-4 mr-1" />
        My Location
      </Button>

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