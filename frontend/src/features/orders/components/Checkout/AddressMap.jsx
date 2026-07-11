import {  useState, useEffect  } from "react";
import Map, { Marker } from 'react-map-gl/mapbox';
import goongjs from '@goongmaps/goong-js';
import { MapPin } from 'lucide-react';
import '@goongmaps/goong-js/dist/goong-js.css';

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;

if (GOONG_MAPTILES_KEY) {
  goongjs.accessToken = GOONG_MAPTILES_KEY;
}

export default function AddressMap({ address, coordinates, onLocationChange }) {
  const [viewState, setViewState] = useState({
    longitude: coordinates?.lng || 106.660172,
    latitude: coordinates?.lat || 10.762622,
    zoom: 14
  });

  const [markerCoords, setMarkerCoords] = useState({
    longitude: coordinates?.lng || 106.660172,
    latitude: coordinates?.lat || 10.762622
  });

  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      setViewState(prev => ({
        ...prev,
        longitude: coordinates.lng,
        latitude: coordinates.lat,
      }));
      setMarkerCoords({
        longitude: coordinates.lng,
        latitude: coordinates.lat,
      });
    }
  }, [coordinates]);

  const onMarkerDragEnd = (event) => {
    const lngLat = event.lngLat;
    const newCoords = { lat: lngLat.lat, lng: lngLat.lng };
    setMarkerCoords({ longitude: lngLat.lng, latitude: lngLat.lat });
    if (onLocationChange) onLocationChange(newCoords);
  };

  if (!GOONG_MAPTILES_KEY) {
    return (
      <div className="w-full h-[300px] mt-4 flex items-center justify-center border border-mkhe-border/20 rounded-lg bg-mkhe-bg text-mkhe-text/60 text-sm">
        Vui lòng cấu hình VITE_GOONG_MAPTILES_KEY trong .env
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] mt-4 rounded-lg overflow-hidden border border-mkhe-border/20 shadow-inner relative z-0">
      <div className="absolute top-2 right-2 z-[1000] bg-white/90 px-3 py-1.5 rounded-md shadow text-xs text-gray-700 font-medium pointer-events-none">
        Kéo thả ghim để chọn vị trí chính xác
      </div>
      <Map
        mapLib={goongjs}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`}
        goongApiAccessToken={GOONG_MAPTILES_KEY}
        mapboxAccessToken={GOONG_MAPTILES_KEY}
      >
        <Marker
          longitude={markerCoords.longitude}
          latitude={markerCoords.latitude}
          draggable
          onDragEnd={onMarkerDragEnd}
          anchor="bottom"
        >
          <div className="cursor-grab active:cursor-grabbing text-rose-500 hover:scale-110 transition-transform">
            <MapPin size={36} strokeWidth={2.5} fill="#f87171" />
          </div>
        </Marker>
      </Map>
    </div>
  );
}
