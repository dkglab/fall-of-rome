import init from "oxigraph/web.js"
import GraphStore from "../graph-store"

const loadOxigraph = async () => {
    await init("/web_bg.wasm") // Required to compile the WebAssembly code.

    const store = new GraphStore()
    await store.load("/data.ttl")
}
export default loadOxigraph