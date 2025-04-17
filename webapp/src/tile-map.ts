import type { FeatureCollection } from "geojson"
import type { GeoJSONSource, LngLatBoundsLike, LngLatLike } from "maplibre-gl"

import maplibregl from "maplibre-gl"
import bbox from "@turf/bbox"
import * as pmtiles from "pmtiles"

const DEFAULT_ZOOM = 5.5
const DEFAULT_CENTER = [-3.7, 40.4] as LngLatLike
const PMTILES_URL = "https://fly.storage.tigris.dev/cawm-pmtiles/cawm.pmtiles"
const black = "#333333"

class TileMap extends HTMLElement {
  placeTypeLayerNames: string[] = []
  map: maplibregl.Map | null = null

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

    this.map = new maplibregl.Map({
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
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="/maplibre-gl.css">
      <style> #${this.id} { height: 100%; } </style>
      <div id="${this.id}"></div>
    `
  }

  async getPlacesSource(): Promise<GeoJSONSource> {
    while (true) {
      if (this.map) {
        const source = this.map.getSource("places")
        if (source !== undefined) {
          return source as GeoJSONSource
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  async showFeatures(collection: FeatureCollection) {
    const source = await this.getPlacesSource()
    source.setData(collection)

    if (this.map) {
      if (collection.features.length > 0) {
        const extent = bbox(collection) as LngLatBoundsLike
        console.log(extent)
        this.map.fitBounds(extent, { padding: 150 })
      } else {
        this.map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
      }
    }
  }
}

customElements.define("tile-map", TileMap)

export default TileMap
