'use client';

import React, { useEffect, useRef, useState, useMemo } from "react";

export interface Hospital {
  id?: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact?: string;
  specialties?: string;
  timing?: string;
}

interface GoogleMapEmbedProps {
  hospitals: Hospital[];
  onBookAppointment: (hospital: Hospital) => void;
  translations: {
    specialties: string;
    timings: string;
    contact: string;
    bookAppointment: string;
  };
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ hospitals, onBookAppointment, translations }) => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const center = useMemo(() => {
    if (hospitals.length > 0) {
      const totalLat = hospitals.reduce((sum, h) => sum + h.lat, 0);
      const totalLng = hospitals.reduce((sum, h) => sum + h.lng, 0);
      return { lat: totalLat / hospitals.length, lng: totalLng / hospitals.length };
    }
    return { lat: 20.5937, lng: 78.9629 };
  }, [hospitals]);

  useEffect(() => {
    const scriptId = "google-maps-script";

    const loadScript = () => {
      if ((window as any).google && (window as any).google.maps) {
        setMapLoaded(true);
        return;
      }

      if (document.getElementById(scriptId)) {
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      script.onerror = () => {
        console.error("Google Maps script failed to load.");
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, [googleMapsApiKey]);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      if (!mapInstance) {
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: center,
          zoom: hospitals.length > 1 ? 8 : 12,
        });
        setMapInstance(map);
      }
    }
  }, [mapLoaded, center, mapInstance]);

  useEffect(() => {
    if (mapInstance && (window as any).google) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const infoWindow = new (window as any).google.maps.InfoWindow();

      if (hospitals.length > 0) {
        const bounds = new (window as any).google.maps.LatLngBounds();
        hospitals.forEach((hospital, index) => {
          const hospitalId = hospital.id ?? index;
          bounds.extend(new (window as any).google.maps.LatLng(hospital.lat, hospital.lng));

          const marker = new (window as any).google.maps.Marker({
            position: { lat: hospital.lat, lng: hospital.lng },
            map: mapInstance,
            title: hospital.name,
          });

          const content = `
            <div style="color: #333; font-family: Arial, sans-serif; padding: 5px">
              <h4 style="margin: 0 0 5px 0; font-weight: bold;">${hospital.name}</h4>
              <p style="margin: 0 0 5px 0;">${hospital.address}</p>
              ${hospital.specialties ? `<p style="margin: 0 0 5px 0;"><strong>${translations.specialties}:</strong> ${hospital.specialties}</p>` : ''}
              ${hospital.timing ? `<p style="margin: 0 0 5px 0;"><strong>${translations.timings}:</strong> ${hospital.timing}</p>` : ''}
              ${hospital.contact ? `<p style="margin: 0 0 10px 0;"><strong>${translations.contact}:</strong> ${hospital.contact}</p>` : ''}
              <button id="book-appointment-btn-${hospitalId}" class="map-book-button">${translations.bookAppointment}</button>
            </div>
          `;

          marker.addListener('click', () => {
            infoWindow.setContent(content);
            infoWindow.open(mapInstance, marker);

            (window as any).google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
              document.getElementById(`book-appointment-btn-${hospitalId}`)?.addEventListener('click', () => {
                onBookAppointment(hospital);
              });
            });
          });

          markersRef.current.push(marker);
        });

        mapInstance.fitBounds(bounds);

        if (hospitals.length === 1) {
          const listener = (window as any).google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
            if (mapInstance.getZoom() > 14) mapInstance.setZoom(14);
          });

          return () => {
            (window as any).google.maps.event.removeListener(listener);
          };
        }

      } else {
        mapInstance.setCenter(center);
        mapInstance.setZoom(5);
      }
    }
  }, [mapInstance, hospitals, translations, onBookAppointment, center]);

  return (
    <div className="w-full h-[550px] rounded-lg border bg-gray-100">
      {mapLoaded ? (
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Loading Map...</p>
        </div>
      )}
      <style jsx global>{`
        .map-book-button {
          background-color: hsl(205 78% 46%);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        .map-book-button:hover {
          background-color: hsl(205 78% 36%);
        }
      `}</style>
    </div>
  );
};

export default GoogleMapEmbed;
