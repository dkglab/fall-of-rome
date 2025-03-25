import type { Term } from "oxigraph"
import { Store } from "oxigraph/web.js"

export default class GraphStore {
  store: Store

  constructor() {
    this.store = new Store()
  }

  async load(url: string) {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`)
    }
    const ttl = await res.text()
    this.store.load(ttl, { format: "text/turtle", unchecked: true })
  }

  query(q: string): Map<string, Term>[] {
    return this.store.query(q) as Map<string, Term>[]
  }
}
