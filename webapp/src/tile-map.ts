import type { FeatureCollection } from "geojson"
import type { GeoJSONSource, LayerSpecification, LngLatBoundsLike, LngLatLike, SourceSpecification } from "maplibre-gl"

import maplibregl from "maplibre-gl"
import bbox from "@turf/bbox"
import * as pmtiles from "pmtiles"

const DEFAULT_ZOOM = 5.5
const DEFAULT_CENTER = [-3.7, 40.4] as LngLatLike
const PMTILES_URL = "https://fly.storage.tigris.dev/cawm-pmtiles/cawm.pmtiles"
const black = "#333333"

class TileMap extends HTMLElement {
  placeTypeLayerNames: string[] = []
  mapPromiseWithResolvers: PromiseWithResolvers<maplibregl.Map> = Promise.withResolvers()
  mapPromise: Promise<maplibregl.Map> = this.mapPromiseWithResolvers.promise
  mapResolve: (value: maplibregl.Map | PromiseLike<maplibregl.Map>) => void = this.mapPromiseWithResolvers.resolve

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    this.render()

    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)

    const tileserver = new pmtiles.PMTiles(PMTILES_URL)
    protocol.add(tileserver)

    const header = await tileserver.getHeader()
    const container = this.shadowRoot!.getElementById(this.id)!

    let map = new maplibregl.Map({
      container,
      minZoom: header.minZoom,
      maxZoom: 9,
      zoom: DEFAULT_ZOOM,
      center: DEFAULT_CENTER,
      style: {
        version: 8,
        sources: {
          cawm: {
            type: "raster",
            url: `pmtiles://${PMTILES_URL}`,
          },
          places: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          },
        },
        layers: [
          {
            id: "tiles",
            type: "raster",
            source: "cawm",
          },
          {
            id: "points",
            type: "circle",
            source: "places",
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
              "circle-radius": 3,
              "circle-color": black,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#333333",
            },
          },
        ],
      },
    })

    map.on("load", () => {
      this.mapResolve(map)
    })
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="/maplibre-gl.css">
      <style> #${this.id} { height: 100%; } </style>
      <div id="${this.id}"></div>
    `
  }

  async getPlacesSource(): Promise<GeoJSONSource> {
    const source = (await this.mapPromise).getSource("places")
    return source as GeoJSONSource
  }

  async showFeatures(collection: FeatureCollection, sourceId?: string) {
    let source = await this.getPlacesSource()
    if (sourceId) {
      source = await this.getSource(sourceId) ?? source
    }
    source.setData(collection)

    let map = await this.mapPromise
    if (map) {
      if (collection.features.length > 0) {
        const extent = bbox(collection) as LngLatBoundsLike
        console.log(extent)
        map.fitBounds(extent, { padding: 150 })
      } else {
        map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
      }
    }
  }

  async getSource(sourceId: string): Promise<GeoJSONSource | null> {
    const source = (await this.mapPromise).getSource(sourceId)
      if (source !== undefined) {
        return source as GeoJSONSource
      }
    return null
  }

  async addSource(sourceId: string, source: SourceSpecification): Promise<boolean> {
    const map = await this.mapPromise
    map.addSource(sourceId, source)
    return map.getSource(sourceId) !== undefined
  }

  async addLayer(layer: LayerSpecification): Promise<boolean> {
    const map = await this.mapPromise
    map.addLayer(layer)
    return map.getLayer(layer.id) != undefined
  }

  async removeSource(sourceId: string): Promise<boolean> {
    const map = await this.mapPromise
    map.removeSource(sourceId)
    return map.getSource(sourceId) == undefined
  }

  async removeLayer(layerId: string): Promise<boolean> {
    const map = await this.mapPromise
    map.removeLayer(layerId)
    return map.getLayer(layerId) == undefined
  }
 }

customElements.define("tile-map", TileMap)

export default TileMap
