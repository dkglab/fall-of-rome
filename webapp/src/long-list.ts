import { html, css, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { LitVirtualizer } from "@lit-labs/virtualizer" // registers <lit-virtualizer>

export type Item = {
  name: string
  id: string
}

@customElement("long-list")
export default class LongList extends LitElement {
  static styles = css``

  @property({ type: Array })
  items: Item[] = []

  connectedCallback() {
    super.connectedCallback()
    if (this.hasimport { html, css, LitElement } from "lit"
      import { customElement, property } from "lit/decorators.js"
      import { LitVirtualizer } from "@lit-labs/virtualizer" // registers <lit-virtualizer>
      
      type Item = {
        name: string
        id: string
      }
      
      @customElement("long-list")
      export default class LongList extends LitElement {
        static styles = css``
      
        @property({ type: Array })
        items: Item[] = []
      
        connectedCallback() {
          super.connectedCallback()
          if (this.hasAttribute("items")) {
            ;(async () => {
              const url = this.getAttribute("items")!
              const response = await fetch(url)
              if (response.ok) {
                this.items = await response.json()
              } else {
                throw new Error(
                  `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
                )
              }
            })()
          }
        }
      
        render() {
          return html`
            <lit-virtualizer
              .items=${this.items}
              .renderItem=${(item: Item) =>
                html`<div><a href="site/${item.id}.html">${item.name}</a></div>`}
            ></lit-virtualizer>
          `
        }
      }
      Attribute("items")) {
      ;(async () => {
        const url = this.getAttribute("items")!
        const response = await fetch(url)
        if (response.ok) {
          this.items = await response.json()
        } else {
          throw new Error(
            `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
          )
        }
      })()
    }
  }

  render() {
    return html`
      <lit-virtualizer
        .items=${this.items}
        .renderItem=${(item: Item) =>
          html`<div><a href="site/${item.id}.html">${item.name}</a></div>`}
      ></lit-virtualizer>
    `
  }
}
