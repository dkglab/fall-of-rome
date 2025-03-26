import init from "oxigraph/web.js"
import GraphStore from "./graph-store"
import TileMap from "./tile-map"
import sitesQuery from "./queries/sites.rq"
import { parse } from "wellknown"
import type { Feature } from "geojson"

function main() {
  ;(async function () {
    await init("web_bg.wasm") // Required to compile the WebAssembly code.

    const store = new GraphStore()
    await store.load("data.ttl")

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
        },
        geometry: geoJson
      }
      features.push(feature)

    }

    const map = document.getElementById("map") as TileMap
    await map.showFeatures({
      type: "FeatureCollection",
      features: features,
    })
  })()
}

main()
