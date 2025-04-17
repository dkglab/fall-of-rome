import type { QueryUpdatedEvent } from "./query-updated-event";
import loadGraphStore from "../utils/oxigraph";
import type GraphStore from "../graph-store";
import type { Feature } from "geojson";
import { parse } from "wellknown";
import type TileMap from "../tile-map";
import type { GeoJSONSource } from "maplibre-gl";

namespace QueryHandler {
    let _graphstore: Promise<GraphStore> | undefined = undefined

    export function handleQueryEvent(event: QueryUpdatedEvent) {
        const {query, id} = event.detail
        console.log(`running query:\n${query}`)
        ;(async function() {
            let result = await handleQuery(query)
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
        if (possibleSource) {
            return possibleSource
        } else {
            if (await map.addSource(`query-${id}`, {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [],
                },
            })) {
                map.addLayer({
                    id: `query-${id}`,
                    source: `query-${id}`,
                    type: "circle",
                    filter: ["==", ["get", "queryId"], id],
                    paint: {
                      "circle-radius": 3,
                      "circle-color": "#FFFFFF",
                      "circle-stroke-width": 1,
                      "circle-stroke-color": "#ffaa00",
                    },
                })
                return await map.getSource(`query-${id}`) as GeoJSONSource
            }
        }
        throw new Error("Somehow could not create source");
    }
}

function setupQueryListener() {
    let queryContainer = document.getElementById("query-container")!
    queryContainer.addEventListener("query-updated", (event) => {
        QueryHandler.handleQueryEvent(event as QueryUpdatedEvent)
    })
}

setupQueryListener()