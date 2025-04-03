// Create the src/ceramic filter.ts file

import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"

export const CERAMIC_TYPES = [
  { id: "all", label: "ALL TYPES" },
  { id: "TSH", label: "Spanish terracotta (TSH)" },
  { id: "TSHT", label: "Late Spanish terracotta (TSHT)" },
  { id: "TSG", label: "Terracotta from Gaul (TSG)" },
  { id: "ARS", label: "Gallo-african terracotta (ARS)" },
  { id: "LRC", label: "Oriental terracotta (LRC/LRD)" },
  { id: "PRCW", label: "Late painted pottery (PRCW)" }
]

@customElement("ceramic-filter")
export class CeramicFilter extends LitElement {
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
    
    .ceramic-option {
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
        <div class="filter-title">陶瓷类型筛选</div>
        
        ${CERAMIC_TYPES.map(type => html`
          <label class="ceramic-option">
            <input 
              type="radio" 
              name="ceramic-type" 
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
    this.dispatchEvent(new CustomEvent("ceramic-filter-change", {
      detail: { type: typeId },
      bubbles: true,
      composed: true
    }))
  }
}