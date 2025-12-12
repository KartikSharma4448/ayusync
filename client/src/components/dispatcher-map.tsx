import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Hospital, Ambulance, SosIncident } from "@shared/schema";
import "leaflet/dist/leaflet.css";

const hospitalIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18"/>
      <path d="M9 8h1"/>
      <path d="M9 12h1"/>
      <path d="M9 16h1"/>
      <path d="M14 8h1"/>
      <path d="M14 12h1"/>
      <path d="M14 16h1"/>
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const ambulanceAvailableIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 10H6"/>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
      <path d="M8 8v4"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const ambulanceBusyIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 10H6"/>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
      <path d="M8 8v4"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const incidentIcon = new L.DivIcon({
  className: "custom-marker incident-pulse",
  html: `<div style="
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    animation: incident-ring 1.5s ease-out infinite;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface DispatcherMapProps {
  hospitals: Hospital[];
  ambulances: Ambulance[];
  incidents: SosIncident[];
  selectedIncident: SosIncident | null;
  onIncidentSelect: (incident: SosIncident | null) => void;
}

function MapUpdater({ selectedIncident }: { selectedIncident: SosIncident | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 15, {
        duration: 1,
      });
    }
  }, [selectedIncident, map]);

  return null;
}

export function DispatcherMap({
  hospitals,
  ambulances,
  incidents,
  selectedIncident,
  onIncidentSelect,
}: DispatcherMapProps) {
  const defaultCenter: [number, number] = [28.6139, 77.209];
  const defaultZoom = 12;

  return (
    <>
      <style>{`
        @keyframes incident-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          min-height: 400px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        data-testid="dispatcher-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater selectedIncident={selectedIncident} />

        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.latitude, hospital.longitude]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{hospital.name}</p>
                <p className="text-xs text-gray-600">{hospital.address}</p>
                <p className="text-xs text-gray-600">{hospital.phone}</p>
                {hospital.specialties && (
                  <p className="text-xs text-gray-500">{hospital.specialties}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {ambulances.map((ambulance) => (
          <Marker
            key={ambulance.id}
            position={[ambulance.latitude, ambulance.longitude]}
            icon={ambulance.status === "available" ? ambulanceAvailableIcon : ambulanceBusyIcon}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{ambulance.vehicleNumber}</p>
                <p className="text-xs text-gray-600">Driver: {ambulance.driverName}</p>
                <p className="text-xs text-gray-600">{ambulance.driverPhone}</p>
                <p className="text-xs">
                  Status:{" "}
                  <span
                    className={
                      ambulance.status === "available" ? "text-green-600" : "text-orange-600"
                    }
                  >
                    {ambulance.status}
                  </span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {incidents
          .filter((i) => i.status !== "resolved")
          .map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={incidentIcon}
              eventHandlers={{
                click: () => onIncidentSelect(incident),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-red-600">SOS Alert</p>
                  <p className="text-xs text-gray-600">Status: {incident.status}</p>
                  <p className="text-xs text-gray-600">Time: {incident.createdAt}</p>
                  {incident.eta && (
                    <p className="text-xs text-blue-600">ETA: {incident.eta}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border">
        <p className="text-xs font-medium mb-2">Legend</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Ambulance (Available)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span>Ambulance (Busy)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>SOS Incident</span>
          </div>
        </div>
      </div>
    </>
  );
}
