import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "react-leaflet-cluster/dist/assets/MarkerCluster.css"
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css"
import { LocateControl } from 'leaflet.locatecontrol'
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { LaverieSearch } from "@/components/utils/type"
import "leaflet-gesture-handling"
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css"

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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface MapViewProps {
    laveries: LaverieSearch[]
    selectedId: number | null
    onSelectLaverie: (id: number) => void
    onLocationFound?: (pos: { lat: number; lng: number }) => void
    onLocationStop?: () => void
    autoStart?: boolean
    userPosition?: { lat: number; lng: number } | null
    searchRadius?: number
    fitBoundsKey?: number
}

interface LocateControlComponentProps {
    onLocationFound: (pos: { lat: number; lng: number }) => void
    onLocationStop?: () => void
    autoStart?: boolean
}

// ─── Sous-composant : ajuste le zoom quand les laveries changent ──────────────

function MapAdjuster({ laveries, selectedId, fitBoundsKey }: {
    laveries: LaverieSearch[]
    selectedId: number | null
    fitBoundsKey?: number
}) {
    const map = useMap()
    const prevSelectedRef = useRef<number | null>(null)
    const prevFitKeyRef = useRef<number>(0)
    const pendingFitRef = useRef(false)

    // Quand fitBoundsKey change (nouvelle recherche textuelle), marque un fitBounds en attente
    useEffect(() => {
        if (!fitBoundsKey || fitBoundsKey === prevFitKeyRef.current) return
        prevFitKeyRef.current = fitBoundsKey
        pendingFitRef.current = true
    }, [fitBoundsKey])

    // Exécute le fitBounds dès que les laveries résultantes arrivent
    useEffect(() => {
        if (!pendingFitRef.current || laveries.length === 0) return
        pendingFitRef.current = false
        const bounds = L.latLngBounds(
            laveries.map((l) => [l.adresse.latitude, l.adresse.longitude] as [number, number])
        )
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true })
    }, [laveries, map])

    // Zoom sur le marker sélectionné depuis la liste ou le carousel
    useEffect(() => {
        if (selectedId === null || selectedId === prevSelectedRef.current) return
        prevSelectedRef.current = selectedId

        const laverie = laveries.find((l) => l.id === selectedId)
        if (!laverie) return

        map.flyTo(
            [laverie.adresse.latitude, laverie.adresse.longitude],
            Math.max(map.getZoom(), 15),
            { animate: true, duration: 0.8 }
        )
    }, [selectedId, laveries, map])

    return null
}

// ─── Sous-composant : bouton de géolocalisation (leaflet-locatecontrol) ───────

function LeafletLocateControl({ onLocationFound, onLocationStop, autoStart }: LocateControlComponentProps) {
    const map = useMap()
    const lcRef = useRef<InstanceType<typeof LocateControl> | null>(null)
    // Refs pour garder les callbacks à jour sans recréer le contrôle Leaflet
    const callbackRef = useRef(onLocationFound)
    const stopCallbackRef = useRef(onLocationStop)
    useEffect(() => { callbackRef.current = onLocationFound }, [onLocationFound])
    useEffect(() => { stopCallbackRef.current = onLocationStop }, [onLocationStop])

    useEffect(() => {
        const lc = new LocateControl({
            position: 'topright',
            setView: 'untilPanOrZoom',
            flyTo: true,
            keepCurrentZoomLevel: false,
            drawMarker: true,
            drawCircle: false,
            strings: {
                title: 'Ma position',
                popup: 'Vous êtes ici',
            },
            locateOptions: {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        })

        lc.addTo(map)
        lcRef.current = lc

        function handleLocationFound(e: L.LocationEvent) {
            callbackRef.current({ lat: e.latlng.lat, lng: e.latlng.lng })
        }

        function handleLocationStop() {
            stopCallbackRef.current?.()
        }

        map.on('locationfound', handleLocationFound)
        map.on('locatedeactivate', handleLocationStop)

        return () => {
            lc.remove()
            map.off('locationfound', handleLocationFound)
            map.off('locatedeactivate', handleLocationStop)
        }
    }, [map])

    // Démarre la géoloc depuis l'extérieur (ex: modal d'accueil)
    useEffect(() => {
        if (autoStart && lcRef.current) {
            lcRef.current.start()
        }
    }, [autoStart])

    return null
}

// ─── MapView ──────────────────────────────────────────────────────────────────

// Coordonnées de Paris (centre par défaut)
const PARIS: [number, number] = [48.8566, 2.3522]
const DEFAULT_ZOOM = 12

export function MapView({ laveries, selectedId, onSelectLaverie, onLocationFound, onLocationStop, autoStart, userPosition, searchRadius, fitBoundsKey }: MapViewProps) {
    const navigate = useNavigate()
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
                {...{gestureHandling:true} as any}
                {...{
                    gestureHandlingOptions:{
                        text:{
                            touch:"Utilisez deux doigts pour déplacer la carte",
                            scroll:"Utiliser Ctrl + molette pour zoomer sur la carte", 
                            scrollMac:"Utilsier ⌘ + molette pour zoomer sur la carte",
                        },
                        duration:1000, 
                    }, 
                } as any}
                
            >
                {/* Bouton de localisation natif Leaflet */}
                <LeafletLocateControl
                    onLocationFound={onLocationFound ?? (() => {})}
                    onLocationStop={onLocationStop}
                    autoStart={autoStart}
                />
                {userPosition && (
                    <Circle
                        center={[userPosition.lat, userPosition.lng]}
                        radius={searchRadius}
                        color="blue"
                        fillOpacity={0.1}
                    />
                )}
                {/* Tuiles OpenStreetMap — gratuites, sans clé API */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Ajustement automatique du zoom */}
                <MapAdjuster laveries={laveries} selectedId={selectedId} fitBoundsKey={fitBoundsKey} />

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
                                <button 
                                    onClick={() => navigate(`/user/fiche-laverie/${laverie.id}`)}
                                    className="w-full text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-white hover:text-primary hover:border hover:border-primary transition-colors cursor-pointer"
                                >

                                    Voir la fiche
                                </button>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    )
}
