// ceramic-filter.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export const CERAMIC_TYPES = [
  { id: "all", label: "All Ceramic Types" },
  { id: "TSH", label: "Terra Sigillata Hispanic (TSH)" },
  { id: "TSHT", label: "Late Hispanic Terra Sigillata (TSHT)" },
  { id: "TSHTB", label: "Betic Late Hispanic Terra Sigillata (TSHTB)" },
  { id: "TSHTM", label: "Meseta Late Hispanic Terra Sigillata (TSHTM)" },
  { id: "TSG", label: "Gallic Terra Sigillata (TSG)" },
  { id: "DSP", label: "Paleochristian Grey Pottery (DSP)" },
  { id: "ARSA", label: "African Red Slip A (ARSA)" },
  { id: "ARSC", label: "African Red Slip C (ARSC)" },
  { id: "ARSD", label: "African Red Slip D (ARSD)" },
  { id: "LRC", label: "Late Roman C Ware (LRC)" },
  { id: "LRD", label: "Late Roman D Ware (LRD)" },
  { id: "PRCW", label: "Painted Red Coated Ware (PRCW)" }
];

@customElement("ceramic-filter")
export class CeramicFilter extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    .filter-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #4b6cb7;
    }
    
    .ceramic-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 3px 0;
    }
    
    .ceramic-option:hover {
      background-color: #f5f5f5;
    }
    
    input[type="radio"] {
      cursor: pointer;
    }
    
    label {
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .group-title {
      font-weight: bold;
      margin-top: 0.5rem;
      margin-bottom: 0.2rem;
      font-size: 0.85rem;
      color: #666;
    }
    
    select {
      width: 100%;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: white;
      font-size: 0.9rem;
    }
  `;

  @property({ type: String })
  selected = "all";

  render() {
    return html`
      <div class="filter-container">
        <div class="filter-title">Ceramic Type Filter</div>
        
        <select @change=${this.handleChange}>
          <option value="all" ?selected=${this.selected === "all"}>All Ceramic Types</option>
          
          <optgroup label="Hispanic Terra Sigillata">
            ${CERAMIC_TYPES.filter(t => ["TSH", "TSHT", "TSHTB", "TSHTM"].includes(t.id)).map(type => html`
              <option value=${type.id} ?selected=${this.selected === type.id}>${type.label}</option>
            `)}
          </optgroup>
          
          <optgroup label="Gallic Terra Sigillata">
            ${CERAMIC_TYPES.filter(t => ["TSG", "DSP"].includes(t.id)).map(type => html`
              <option value=${type.id} ?selected=${this.selected === type.id}>${type.label}</option>
            `)}
          </optgroup>
          
          <optgroup label="African Red Slip">
            ${CERAMIC_TYPES.filter(t => ["ARSA", "ARSC", "ARSD"].includes(t.id)).map(type => html`
              <option value=${type.id} ?selected=${this.selected === type.id}>${type.label}</option>
            `)}
          </optgroup>
          
          <optgroup label="Eastern Pottery">
            ${CERAMIC_TYPES.filter(t => ["LRC", "LRD", "PRCW"].includes(t.id)).map(type => html`
              <option value=${type.id} ?selected=${this.selected === type.id}>${type.label}</option>
            `)}
          </optgroup>
        </select>
      </div>
    `;
  }

  handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selected = select.value;
    
    this.dispatchEvent(new CustomEvent("ceramic-filter-change", {
      detail: { type: this.selected },
      bubbles: true,
      composed: true
    }));
  }
}