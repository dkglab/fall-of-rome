import type { QueryUpdatedEvent } from "./query-updated-event";
import loadGraphStore from "../utils/oxigraph";
import type GraphStore from "../graph-store";

namespace QueryHandler {
    let _graphstore: Promise<GraphStore> | undefined = undefined

    export function handleQueryEvent(event: QueryUpdatedEvent) {
        const {query, id} = event.detail
        console.log(`running query:\n${query}`)
        handleQuery(query).then(result => {
            for (const binding of result) {
                Array.from(binding).forEach(([variable, value]) => {
                    console.log(variable)
                    console.log(value.value)
                })
            }
        })
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
}

function setupQueryListener() {
    let queryContainer = document.getElementById("query-container")!
    queryContainer.addEventListener("query-updated", (event) => {
        QueryHandler.handleQueryEvent(event as QueryUpdatedEvent)
    })
}

setupQueryListener()