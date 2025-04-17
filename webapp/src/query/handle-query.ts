import { QueryHandler } from "./query-handler";
import type { QueryUpdatedEvent } from "./query-updated-event";

function setupQueryListener() {
    let queryContainer = document.getElementById("query-container")!
    queryContainer.addEventListener("query-updated", (event) => {
        let {query, id} = (event as QueryUpdatedEvent).detail
        QueryHandler.handleQueryEvent(query, id)
    }, true)
}

setupQueryListener()