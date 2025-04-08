// Create the src/site-type-filter.ts file

import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"

export const SITE_TYPES = [
  { id: "all", label: "All site types" },
  { id: "Villa", label: "Villa" },
  { id: "Urban", label: "Urban" },
  { id: "Rural", label: "Rural" },
  { id: "Hillfort", label: "Hillfort" },
  { id: "Cemetery", label: "Cemetery" }
]

@customElement("site-type-filter")
export class SiteTypeFilter extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .filter-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .site-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `

  @property({ type: String })
  selected = "all"

  render() {
    return html`
      <div class="filter-container">
        <div class="filter-title">Site type screening</div>
        
        ${SITE_TYPES.map(type => html`
          <label class="site-option">
            <input 
              type="radio" 
              name="site-type" 
              value=${type.id} 
              ?checked=${this.selected === type.id}
              @change=${() => this.handleTypeChange(type.id)}
            />
            ${type.label}
          </label>
        `)}
      </div>
    `
  }

  handleTypeChange(typeId: string) {
    this.selected = typeId
    this.dispatchEvent(new CustomEvent("site-filter-change", {
      detail: { type: typeId },
      bubbles: true,
      composed: true
    }))
  }
}