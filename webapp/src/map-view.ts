// map-view.ts
import init from "oxigraph/web.js";
import GraphStore from "./graph-store";
import maplibregl from "maplibre-gl";
import * as wellknown from "wellknown";
import type { GeoJSON, Position, Point } from "geojson";

function main() {
  (async function () {
    await init("web_bg.wasm");

    // Connect to the SPARQL endpoint
    const store = new GraphStore("http://localhost:3030/sites/query", true);
    
    try {
      // Load and execute the sites.rq query
      const response = await fetch('/queries/sites.rq');
      const sitesQuery = await response.text();
      
      // Execute SPARQL query
      const sites: any[] = [];
      for (const binding of await store.query(sitesQuery)) {
        const wkt = binding.get("wkt")?.value;
        if (wkt) {
          // Parse WKT into GeoJSON
          const geojson = wellknown.parse(wkt) as GeoJSON;
          if (geojson) {
            sites.push({
              type: "Feature",
              properties: {
                id: binding.get("id")?.value,
                name: binding.get("site_name")?.value,
              },
              geometry: geojson
            });
          }
        }
      }
      
      // Initialize map
      const map = new maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }]
        },
        center: [-4, 40], // Center on Iberian Peninsula
        zoom: 5
      });
      
      map.on('load', () => {
        // Add sites layer
        map.addSource('sites', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: sites
          }
        });
        
        map.addLayer({
          id: 'sites',
          type: 'circle',
          source: 'sites',
          paint: {
            'circle-radius': 6,
            'circle-color': '#4b6cb7',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        });
        
        // Add popup
        map.on('click', 'sites', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            // Fix: Ensure proper typing and access to coordinates
            // Check if geometry is a Point type with coordinates
            if (feature.geometry && 
                feature.geometry.type === 'Point' && 
                Array.isArray(feature.geometry.coordinates)) {
              const coordinates = feature.geometry.coordinates.slice() as [number, number];
              const properties = feature.properties || {};
              
              new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(`<a href="site/${properties.id}.html">${properties.name}</a>`)
                .addTo(map);
            }
          }
        });
        
        // Change cursor on hover
        map.on('mouseenter', 'sites', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', 'sites', () => {
          map.getCanvas().style.cursor = '';
        });
      });
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  })();
}

main();