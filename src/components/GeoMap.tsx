import type { LatLngExpression } from 'leaflet'
import { useEffect } from 'react'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet'
import {
  DATA_POINTS,
  RESULT_POINTS,
  SOHAG_CENTER,
  type MapPoint,
  type ResultPoint,
} from '../data/sohagLayers'
import type { HeroMode } from './ActionCard'

type GeoMapProps = {
  mode: HeroMode
}

function MapSync({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.75 })
  }, [center, map, zoom])

  useEffect(() => {
    const frame = map.getContainer().parentElement
    if (!frame) return undefined

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })

    observer.observe(frame)
    map.invalidateSize()

    return () => observer.disconnect()
  }, [map])

  return null
}

function MarkerSet({
  points,
  color,
  fillColor,
}: {
  points: Array<MapPoint | ResultPoint>
  color: string
  fillColor: string
}) {
  return (
    <>
      {points.map((point) => {
        const score = 'score' in point ? point.score : 0
        const radius = 'score' in point ? 10 + point.score / 12 : 9

        return (
          <CircleMarker
            key={point.id}
            center={point.position}
            radius={radius}
            pathOptions={{
              color,
              fillColor,
              fillOpacity: 0.35,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <strong>{point.label}</strong>
                <p>{point.detail}</p>
                {'score' in point ? (
                  <p>
                    {score}% تغطية تحليلية
                  </p>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export function GeoMap({ mode }: GeoMapProps) {
  const zoom = mode === 'data' ? 11 : 10

  return (
    <MapContainer
      center={SOHAG_CENTER}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapSync center={SOHAG_CENTER} zoom={zoom} />
      {mode === 'data' ? (
        <MarkerSet
          points={DATA_POINTS}
          color="#5eead4"
          fillColor="#2dd4bf"
        />
      ) : (
        <MarkerSet
          points={RESULT_POINTS}
          color="#f5d0a6"
          fillColor="#d4a574"
        />
      )}
    </MapContainer>
  )
}
