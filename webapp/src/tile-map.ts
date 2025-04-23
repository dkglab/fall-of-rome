// tile-map.ts
import type { FeatureCollection } from "geojson";
import type { GeoJSONSource, LngLatBoundsLike, LngLatLike, MapMouseEvent, FilterSpecification } from "maplibre-gl";

import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
import * as pmtiles from "pmtiles";

const DEFAULT_ZOOM = 5.5;
const DEFAULT_CENTER = [-3.7, 40.4] as LngLatLike;
const PMTILES_URL = "https://fly.storage.tigris.dev/cawm-pmtiles/cawm.pmtiles";
const black = "#333333";

// Ceramic type color mapping
const CERAMIC_COLORS: { [key: string]: string } = {
  "all": "#4b6cb7",
  "TSH": "#e41a1c",
  "TSHT": "#377eb8",
  "TSHTB": "#4daf4a",
  "TSHTM": "#984ea3",
  "TSG": "#ff7f00",
  "DSP": "#ffff33",
  "ARSA": "#a65628",
  "ARSC": "#f781bf",
  "ARSD": "#999999",
  "LRC": "#66c2a5",
  "LRD": "#fc8d62",
  "PRCW": "#8da0cb"
};

class TileMap extends HTMLElement {
  placeTypeLayerNames: string[] = [];
  map: maplibregl.Map | null = null;
  currentCeramicFilter: string = "all";
  currentPeriodFilter: string = "all";
  currentSiteTypeFilter: string = "all";
  currentRegionFilter: string = "all";
  popup: maplibregl.Popup | null = null;
  provincesVisible: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    this.render();

    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const tileserver = new pmtiles.PMTiles(PMTILES_URL);
    protocol.add(tileserver);

    const header = await tileserver.getHeader();
    const container = this.shadowRoot!.getElementById(this.id)!;

    this.map = new maplibregl.Map({
      container,
      minZoom: header.minZoom,
      maxZoom: 10,
      zoom: DEFAULT_ZOOM,
      center: DEFAULT_CENTER,
      style: {
        version: 8,
        // Add glyphs property for text rendering
        glyphs: "https://fonts.openmaptiles.org/Open%20Sans%20Regular/{fontstack}/{range}.pbf",
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
            } as FeatureCollection,
          },
          provinces: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            } as FeatureCollection,
          }
        },
        layers: [
          {
            id: "tiles",
            type: "raster",
            source: "cawm",
          },
          {
            id: "province-boundaries",
            type: "line",
            source: "provinces",
            layout: {
              visibility: "none"
            },
            paint: {
              "line-color": "#4b6cb7",
              "line-width": 2,
              "line-opacity": 0.7
            }
          },
          {
            id: "province-fill",
            type: "fill",
            source: "provinces",
            layout: {
              visibility: "none"
            },
            paint: {
              "fill-color": "#4b6cb7",
              "fill-opacity": 0.1
            }
          },
          {
            id: "province-labels",
            type: "symbol",
            source: "provinces",
            layout: {
              visibility: "none",
              "text-field": ["get", "name"],
              "text-font": ["Open Sans Regular"],
              "text-size": 12,
              "text-allow-overlap": false
            },
            paint: {
              "text-color": "#4b6cb7",
              "text-halo-color": "rgba(255,255,255,0.8)",
              "text-halo-width": 2
            }
          },
          {
            id: "points",
            type: "circle",
            source: "places",
            filter: ["==", ["geometry-type"], "Point"] as FilterSpecification,
            paint: {
              "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                4, 3,
                8, 6,
                12, 12
              ],
              "circle-color": CERAMIC_COLORS.all,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.8
            }
          }
        ],
      },
    });

    // Add navigation control
    this.map.addControl(new maplibregl.NavigationControl());
    
    // Add scale control
    this.map.addControl(new maplibregl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }));

    // Add click event
    this.map.on('click', 'points', this.handleMapClick.bind(this));
    
    // Mouse hover effects
    this.map.on('mouseenter', 'points', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer';
    });
    
    this.map.on('mouseleave', 'points', () => {
      if (this.map) this.map.getCanvas().style.cursor = '';
    });
    
    // Listen for filter events
    this.addEventListener('period-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentPeriodFilter = customEvent.detail.period;
      this.updateFilters();
    }) as EventListener);
    
    this.addEventListener('ceramic-filter-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentCeramicFilter = customEvent.detail.type;
      this.updateFilters();
      this.updatePointColors();
    }) as EventListener);
    
    this.addEventListener('site-filter-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentSiteTypeFilter = customEvent.detail.type;
      this.updateFilters();
    }) as EventListener);
    
    this.addEventListener('region-filter-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentRegionFilter = customEvent.detail.region;
      this.updateFilters();
    }) as EventListener);
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.2.0/dist/maplibre-gl.css">
      <style>
        #${this.id} { 
          height: 100%; 
        }
        .maplibregl-popup {
          max-width: 300px;
          font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        }
        .maplibregl-popup-content {
          padding: 15px;
        }
        .popup-title {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 14px;
          color: #4b6cb7;
        }
        .popup-section {
          margin-bottom: 8px;
        }
        .popup-label {
          font-weight: bold;
          color: #666;
        }
        .popup-value {
          margin-left: 5px;
        }
        .popup-ceramic {
          display: inline-block;
          margin-right: 5px;
          margin-bottom: 3px;
          padding: 2px 5px;
          border-radius: 3px;
          background: #eee;
          font-size: 11px;
        }
      </style>
      <div id="${this.id}"></div>
    `;
  }

  handleMapClick(e: MapMouseEvent) {
    if (!this.map) return;
    
    // Display clicked site information
    const features = this.map.queryRenderedFeatures(e.point, { layers: ['points'] });
    
    if (!features.length) return;
    
    const feature = features[0];
    const props = feature.properties || {};
    
    // Create popup content
    const ceramicTypes = ['TSH', 'TSHT', 'TSHTB', 'TSHTM', 'TSG', 'DSP', 'ARSA', 'ARSC', 'ARSD', 'LRC', 'LRD', 'PRCW'];
    const presentCeramics = ceramicTypes
      .filter(type => props[type] === 1)
      .map(type => `<span class="popup-ceramic">${type}</span>`)
      .join(' ');
    
    // Period information
    const periods = [];
    if (props.periods?.includes('early-roman')) periods.push('Early Roman (1st-3rd Century)');
    if (props.periods?.includes('late-roman')) periods.push('Late Roman (4th-5th Century)');
    if (props.periods?.includes('post-roman')) periods.push('Post-Roman (5th-7th Century)');
    
    let html = `
      <div class="popup-title">${props.name || 'Unnamed Site'}</div>
      
      <div class="popup-section">
        <span class="popup-label">ID:</span>
        <span class="popup-value">${props.id || 'No data'}</span>
      </div>
      
      <div class="popup-section">
        <span class="popup-label">Region:</span>
        <span class="popup-value">${props.region || props.provincia || 'No data'}</span>
      </div>
      
      <div class="popup-section">
        <span class="popup-label">Site Type:</span>
        <span class="popup-value">${props.siteType || 'No data'}</span>
      </div>
      
      <div class="popup-section">
        <span class="popup-label">Period:</span>
        <span class="popup-value">${periods.length ? periods.join(', ') : 'No data'}</span>
      </div>
      
      <div class="popup-section">
        <span class="popup-label">Ceramic Types:</span><br>
        <span class="popup-value">${presentCeramics || 'No data'}</span>
      </div>
    `;
    
    // Remove existing popup if present
    if (this.popup) this.popup.remove();
    
    // Create new popup
    this.popup = new maplibregl.Popup()
      .setLngLat((feature.geometry as any).coordinates as [number, number])
      .setHTML(html)
      .addTo(this.map);
  }

  updateFilters() {
    if (!this.map) return;
    
    let filters: any[] = ["all", ["==", ["geometry-type"], "Point"]];
    
    // Add ceramic type filter
    if (this.currentCeramicFilter !== 'all') {
      filters.push(['==', ['get', this.currentCeramicFilter], 1]);
    }
    
    // Add site type filter
    if (this.currentSiteTypeFilter !== 'all') {
      filters.push([
        "any",
        ['==', ['get', 'siteType'], this.currentSiteTypeFilter],
        ['==', ['get', 'analysisType'], this.currentSiteTypeFilter]
      ]);
    }
    
    // Add region filter with improved case-insensitive comparison
    if (this.currentRegionFilter !== 'all') {
      // Create case-insensitive comparison for region filter
      const lowerRegion = this.currentRegionFilter.toLowerCase();
      
      // Log for debugging
      console.log(`Applying region filter: ${this.currentRegionFilter} (${lowerRegion})`);
      
      filters.push([
        "any",
        ['==', ['downcase', ['get', 'region']], lowerRegion],
        ['==', ['downcase', ['get', 'provincia']], lowerRegion]
      ]);
    }
    
    // Add period filter
    if (this.currentPeriodFilter === 'early-roman') {
      filters.push([
        "any",
        ['==', ['get', 'TS_early'], 1],
        ['in', 'early-roman', ['get', 'periods']]
      ]);
    } else if (this.currentPeriodFilter === 'late-roman') {
      filters.push([
        "any",
        ['==', ['get', 'TS_late'], 1],
        ['in', 'late-roman', ['get', 'periods']]
      ]);
    } else if (this.currentPeriodFilter === 'post-roman') {
      filters.push([
        "any",
        ['==', ['get', 'ARS_450'], 1],
        ['==', ['get', 'ARS_525'], 1],
        ['==', ['get', 'ARS_600'], 1],
        ['in', 'post-roman', ['get', 'periods']]
      ]);
    }
    
    // Apply filters with type assertion to fix the type error
    this.map.setFilter('points', filters as FilterSpecification);
    
    // Log how many points are visible after filtering
    const visibleFeatures = this.map.queryRenderedFeatures({ layers: ['points'] });
    console.log(`Number of visible points after filtering: ${visibleFeatures.length}`);
  }

  updatePointColors() {
    if (!this.map) return;
    
    // Use the current ceramic type color
    const color = CERAMIC_COLORS[this.currentCeramicFilter] || CERAMIC_COLORS.all;
    
    this.map.setPaintProperty('points', 'circle-color', color);
  }

  async addProvinces(geojsonData: any) {
    if (!this.map) return;
    
    // Wait for the map to load
    await new Promise<void>((resolve) => {
      if (this.map!.loaded()) {
        resolve();
      } else {
        this.map!.on('load', () => resolve());
      }
    });
    
    // Add province data
    const source = this.map.getSource('provinces') as GeoJSONSource;
    if (source) {
      source.setData(geojsonData);
    }
  }
  
  toggleProvinces(visible: boolean) {
    if (!this.map) return;
    
    this.provincesVisible = visible;
    
    // Set layer visibility
    const visibility = visible ? 'visible' : 'none';
    this.map.setLayoutProperty('province-boundaries', 'visibility', visibility);
    this.map.setLayoutProperty('province-fill', 'visibility', visibility);
    this.map.setLayoutProperty('province-labels', 'visibility', visibility);
  }

  async getPlacesSource(): Promise<GeoJSONSource> {
    while (true) {
      if (this.map) {
        const source = this.map.getSource("places");
        if (source !== undefined) {
          return source as GeoJSONSource;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async showFeatures(collection: FeatureCollection) {
    try {
      console.log(`Showing ${collection.features.length} features on the map`);
      
      // Get the source
      const source = await this.getPlacesSource();
      
      // Clear existing data by setting an empty collection first
      source.setData({
        type: "FeatureCollection",
        features: []
      });
      
      // Now set the new data
      source.setData(collection);

      // Only fit to bounds if there are features
      if (this.map && collection.features.length > 0) {
        // Use type assertion to ensure correct bbox type
        try {
          console.log("Fitting map to feature bounds");
          const extent = turf.bbox(collection) as unknown as LngLatBoundsLike;
          this.map.fitBounds(extent, { padding: 50, maxZoom: 8 });
        } catch (error) {
          console.error("Error fitting bounds:", error);
          this.map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
        }
      } else if (this.map) {
        console.log("No features to show, resetting map view");
        this.map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
      }
      
      // Update point colors
      this.updatePointColors();
      
      // Log the number of visible points on the map
      if (this.map) {
        const visibleFeatures = this.map.queryRenderedFeatures({ layers: ['points'] });
        console.log(`Number of visible points on the map: ${visibleFeatures.length}`);
      }
    } catch (error) {
      console.error("Error in showFeatures:", error);
    }
  }
}

customElements.define("tile-map", TileMap);

export default TileMap;