import type Query from "./query"

(window as any).createQuery = () => {
    const queryContainer = document.getElementById("query-container")!
    let newQuery = document.createElement("query-holder") as Query
    queryContainer.appendChild(newQuery)
}