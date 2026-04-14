import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "react-leaflet-cluster/dist/assets/MarkerCluster.css"
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { LaverieSearch } from "@/components/utils/type"

// ─── Fix icônes Leaflet (bug connu avec Vite / webpack) ───────────────────────
// Leaflet cherche ses icônes via _getIconUrl, qui ne fonctionne pas avec les
// bundlers modernes. On redéfinit les chemins manuellement.

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

// ─── Icônes custom : normal vs sélectionné ────────────────────────────────────

const iconNormal = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

const iconSelected = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: markerShadow,
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -40],
    shadowSize: [41, 41],
})

// ─── Sous-composant : ajuste le zoom quand les laveries changent ──────────────

function MapAdjuster({ laveries, selectedId }: { laveries: LaverieSearch[]; selectedId: number | null }) {
    const map = useMap()
    const prevSelectedRef = useRef<number | null>(null)

    // Zoom sur le marker sélectionné depuis la liste
    useEffect(() => {
        if (selectedId === null || selectedId === prevSelectedRef.current) return
        prevSelectedRef.current = selectedId

        const laverie = laveries.find((l) => l.id === selectedId)
        if (!laverie) return

        map.flyTo(
            [laverie.adresse.latitude, laverie.adresse.longitude],
            15,
            { animate: true, duration: 0.8 }
        )
    }, [selectedId, laveries, map])

    // Adapte la vue pour englober tous les markers après une recherche
    useEffect(() => {
        if (laveries.length === 0) return

        const bounds = L.latLngBounds(
            laveries.map((l) => [l.adresse.latitude, l.adresse.longitude])
        )
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }, [laveries, map])

    return null
}

// ─── MapView ──────────────────────────────────────────────────────────────────

interface MapViewProps {
    laveries: LaverieSearch[]
    selectedId: number | null
    onSelectLaverie: (id: number) => void
}

// Coordonnées de Paris (centre par défaut)
const PARIS: [number, number] = [48.8566, 2.3522]
const DEFAULT_ZOOM = 12

export function MapView({ laveries, selectedId, onSelectLaverie }: MapViewProps) {
    return (
        <div
            className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            style={{ height: "50vh", minHeight: "300px" }}
            role="application"
            aria-label="Carte des laveries"
        >
            <MapContainer
                center={PARIS}
                zoom={DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
            >
                {/* Tuiles OpenStreetMap — gratuites, sans clé API */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Ajustement automatique du zoom */}
                <MapAdjuster laveries={laveries} selectedId={selectedId} />

                {/* Markers avec clustering automatique au dézoom */}
                <MarkerClusterGroup chunkedLoading>
                    {laveries.map((laverie) => (
                        <Marker
                            key={laverie.id}
                            position={[laverie.adresse.latitude, laverie.adresse.longitude]}
                            icon={selectedId === laverie.id ? iconSelected : iconNormal}
                            eventHandlers={{
                                click: () => onSelectLaverie(laverie.id),
                            }}
                            title={laverie.nomEtablissement}
                        >
                            <Popup>
                                <div className="text-sm font-semibold">{laverie.nomEtablissement}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {laverie.adresse.rue}, {laverie.adresse.ville}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    )
}
