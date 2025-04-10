import init from "oxigraph/web.js"
import GraphStore from "./graph-store"
import LongList from "./long-list"
import type { Item } from "./long-list"
import sitesQuery from "./queries/sites.rq"

function main() {
  ;(async function () {
    await init("web_bg.wasm") // Required to compile the WebAssembly code.

    const store = new GraphStore()
    await store.load("data.ttl")

    const items: Item[] = []
    for (const binding of store.query(sitesQuery)) {
      items.push({
        id: binding.get("id")!.value,
        name: binding.get("site_name")!.value,
      })
    }

    const searchInput = document.getElementById("search") as HTMLInputElement
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase()
      list.items = items.filter(item => item.name.toLowerCase().includes(searchTerm))
    })

    const list = document.getElementById("sites-list") as LongList
    list.items = items
  })()
}

main()
