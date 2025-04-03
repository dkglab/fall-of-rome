// Example Modify the src/tile-map.ts file

import type { FeatureCollection } from "geojson"
import type { GeoJSONSource, LngLatBoundsLike, LngLatLike, MapMouseEvent } from "maplibre-gl"

import maplibregl from "maplibre-gl"
import bbox from "@turf/bbox"
import * as pmtiles from "pmtiles"

const DEFAULT_ZOOM = 5.5
const DEFAULT_CENTER = [-3.7, 40.4] as LngLatLike
const PMTILES_URL = "https://fly.storage.tigris.dev/cawm-pmtiles/cawm.pmtiles"

const CERAMIC_COLORS = {
  "all": "#333333",
  "TSH": "#e41a1c",
  "TSHT": "#377eb8",
  "TSG": "#4daf4a",
  "ARS": "#ff7f00",
  "LRC": "#984ea3",
  "PRCW": "#ffff33"
}

class TileMap extends HTMLElement {
  placeTypeLayerNames: string[] = []
  map: maplibregl.Map | null = null
  currentCeramicFilter: string = "all"
  currentPeriodFilter: string = "all"
  currentSiteTypeFilter: string = "all"
  popup: maplibregl.Popup | null = null

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
              "circle-radius": 5,
              "circle-color": "#333333",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          },
        ],
      },
    })

    // Add click event
    this.map.on('click', 'points', this.handleMapClick.bind(this))
    
    // Mouse hover effect
    this.map.on('mouseenter', 'points', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer'
    })
    
    this.map.on('mouseleave', 'points', () => {
      if (this.map) this.map.getCanvas().style.cursor = ''
    })
    
    // Listening filter event
    this.addEventListener('period-change', (e: CustomEvent) => {
      this.currentPeriodFilter = e.detail.period
      this.updateFilters()
    })
    
    this.addEventListener('ceramic-filter-change', (e: CustomEvent) => {
      this.currentCeramicFilter = e.detail.type
      this.updateFilters()
      this.updatePointColors()
    })
    
    this.addEventListener('site-filter-change', (e: CustomEvent) => {
      this.currentSiteTypeFilter = e.detail.type
      this.updateFilters()
    })
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="/maplibre-gl.css">
      <style>
        #${this.id} { 
          height: 100%; 
        }
        .maplibregl-popup {
          max-width: 300px;
          font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        }
      </style>
      <div id="${this.id}"></div>
    `
  }

  handleMapClick(e: MapMouseEvent) {
    if (!this.map) return
    
    // Displays the click site information
    const features = this.map.queryRenderedFeatures(e.point, { layers: ['points'] })
    
    if (!features.length) return
    
    const feature = features[0]
    const props = feature.properties || {}
    
    // Create pop-up window content
    const ceramicTypes = ['TSH', 'TSHT', 'TSG', 'ARSA', 'ARSC', 'ARSD', 'LRC', 'LRD', 'PRCW']
    const presentCeramics = ceramicTypes
      .filter(type => props[type] === 1)
      .join(', ')
    
    let html = `
      <h3>${props.name || 'Unnamed site'}</h3>
      <p>type: ${props.siteType || 'unknowed'}</p>
      <p>Analysis type: ${props.analysisType || 'unknowed'}</p>
      <p>types of ceramic: ${presentCeramics || 'no data'}</p>
    `
    
    // If there are pop-ups, remove them first
    if (this.popup) this.popup.remove()
    
    // Create a new popup
    this.popup = new maplibregl.Popup()
      .setLngLat(feature.geometry.coordinates)
      .setHTML(html)
      .addTo(this.map)
  }

  updateFilters() {
    if (!this.map) return
    
    const filters = []
    
    // Add ceramic type filter
    if (this.currentCeramicFilter !== 'all') {
      filters.push(['==', ['get', this.currentCeramicFilter], 1])
    }
    
    // Add site type screening
    if (this.currentSiteTypeFilter !== 'all') {
      filters.push(['==', ['get', 'siteType'], this.currentSiteTypeFilter])
    }
    
    let finalFilter = ['all', ...filters]
    
    // Application screening
    this.map.setFilter('points', finalFilter)
  }

  updatePointColors() {
    if (!this.map) return
    
    const color = CERAMIC_COLORS[this.currentCeramicFilter] || CERAMIC_COLORS.all
    
    this.map.setPaintProperty('points', 'circle-color', color)
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
        this.map.fitBounds(extent, { padding: 150 })
      } else {
        this.map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
      }
    }
  }
}

customElements.define("tile-map", TileMap)

export default TileMap