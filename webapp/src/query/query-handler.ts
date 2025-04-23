import loadGraphStore from "../utils/oxigraph";
import type GraphStore from "../graph-store";
import type { Feature } from "geojson";
import { parse } from "wellknown";
import type TileMap from "../tile-map";
import type { GeoJSONSource } from "maplibre-gl";
import { getPrefixesAsRDF } from "../prefix/prefix";

export namespace QueryHandler {
    let _graphstore: Promise<GraphStore> | undefined = undefined

    export function handleQueryEvent(query: string, id: number) {
        console.log(`running query:\n${query}`)
        ;(async function() {
            let result = await handleQuery(getPrefixesAsRDF() + query)
            let features: Feature[] = []
            for (const binding of result) {
                let wkt = binding.get("wkt")?.value ?? ""
                let geoJson = parse(wkt)
                if (geoJson == null) continue
                let feature: Feature = {
                    type: "Feature",
                    properties: {
                        queryId: id
                    },
                    geometry: geoJson
                }
                features.push(feature)
            }
            let source = await getOrCreateQuerySource(id)
            source.setData({
                type: "FeatureCollection",
                features: features
            })
        })()
    }

    function graphstore(): Promise<GraphStore> {
        if (!_graphstore) {
            _graphstore = loadGraphStore()
        }
        return _graphstore
    }

    async function handleQuery(queryString: string) {
        let store = await graphstore()
        return store.query(queryString)
    }

    /**
     * Gets or creates query source using id
     * Also performs setup to create a layer
     * @param id query id
     * @returns source
     */
    async function getOrCreateQuerySource(id: number) {
        const map = document.getElementById("map") as TileMap
        let possibleSource = await map.getSource(`query-${id}`)
        if (possibleSource != null) {
            return possibleSource
        } else {
            if (await map.addSource(`query-${id}`, {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [],
                },
            })) {
                await setupLayerForQuery(id)
                return await map.getSource(`query-${id}`) as GeoJSONSource
            }
        }
        throw new Error("Somehow could not create source");
    }

    async function setupLayerForQuery(id: number) {
        const map = document.getElementById("map") as TileMap
        await map.addLayer({
            id: `query-${id}-point`,
            source: `query-${id}`,
            type: "circle",
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
              "circle-radius": 3,
              "circle-color": "#FFFFFF",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffaa00",
            },
        })
        await map.addLayer({
            id: `query-${id}-fill`,
            source: `query-${id}`,
            type: "fill",
            filter: ["==", ["geometry-type"], "Polygon"],
            paint: {
                "fill-color": "#aaaa00"
            }
        })
    }

    export async function removeMapDataForQuery(id: number) {
        const map = document.getElementById("map") as TileMap
        map.removeLayer(`query-${id}-point`)
        map.removeLayer(`query-${id}-fill`)
        map.removeSource(`query-${id}`)
    }
}