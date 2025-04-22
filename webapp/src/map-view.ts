import init from "oxigraph/web.js"
import GraphStore from "./graph-store"
import TileMap from "./tile-map"
import sitesQuery from "./queries/sites.rq"
import { parse } from "wellknown"
import type { Feature } from "geojson"
import { QueryHandler } from "./query/query-handler"
import { QueryBuilder } from "./query/query-builder"

function main() {
  ;(async function () {
    await init("/web_bg.wasm") // Required to compile the WebAssembly code.

    const store = new GraphStore()
    await store.load("/data.ttl")

    const url = new URL(window.location.href)
    const params = url.searchParams
    let currQueryCount = -1
    if (params.size == 0) {
      await loadLocatedSites(store)
    } else {
      for (const [type, value] of params) {
        // Hijack query event to display a custom query
        QueryHandler.handleQueryEvent(
          QueryBuilder.buildQueryFor(type, value),
          currQueryCount
        )
        currQueryCount--
      }
    }
    
  })()
}

async function loadLocatedSites(store: GraphStore) {
  const features: Array<Feature> = []
    for (const binding of store.query(sitesQuery)) {
      let wkt = binding.get("wkt")?.value ?? ""
      let geoJson = parse(wkt)
      if (geoJson == null) continue
      let feature: Feature = {
        type: "Feature",
        properties: {
          id: binding.get("id")!.value,
          name: binding.get("site_name")!.value,
          type: "located-site"
        },
        geometry: geoJson
      }
      features.push(feature)

    }

    const map = document.getElementById("map") as TileMap
    await map.addSource("located-sites", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features,
      },
    })
    map.addLayer({
      id: "located-sites",
      source: "located-sites",
      type: "circle",
      filter: ["==", ["get", "type"], "located-site"],
      paint: {
        "circle-radius": 3,
        "circle-color": "#333333",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffaa00",
      },
    })
}

main()
