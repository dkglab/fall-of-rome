import type { QueryUpdatedEvent } from "./query-updated-event";

function handleQuery(event: QueryUpdatedEvent) {
    const {query, id} = event.detail
    console.log(query)
    console.log(id)
}

function setupQueryListener() {
    let queryContainer = document.getElementById("query-container")!
    queryContainer.addEventListener("query-updated", (event) => {
        handleQuery(event as QueryUpdatedEvent)
    })
}

setupQueryListener()