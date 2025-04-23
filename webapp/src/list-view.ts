// list-view.ts
import init from "oxigraph/web.js";
import GraphStore from "./graph-store";
import LongList from "./long-list";

function main() {
  (async function () {
    await init("web_bg.wasm"); // Required to compile the WebAssembly code.

    // Connect to the SPARQL endpoint
    const store = new GraphStore("http://localhost:3030/sites/query");

    const items = [];
    try {
      // Load and execute the sites.rq query
      const response = await fetch('/queries/sites.rq');
      const sitesQuery = await response.text();

      // Execute SPARQL query
      for (const binding of await store.query(sitesQuery)) {
        items.push({
          id: binding.get("id")!.value,
          name: binding.get("site_name")!.value,
        });
      }

      const list = document.getElementById("sites-list") as LongList;
      list.items = items;
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  })();
}

main();