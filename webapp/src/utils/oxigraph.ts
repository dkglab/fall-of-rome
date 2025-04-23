import init from "oxigraph/web.js"
import GraphStore from "../graph-store"

const loadOxigraph = async () => {
    await init("/web_bg.wasm") // Required to compile the WebAssembly code.
}
const loadGraphStore = async () => {
    await loadOxigraph()

    const store = new GraphStore()
    await store.load("/data.ttl")
    return store
}
export default loadGraphStore