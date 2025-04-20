// site-type-filter.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export const SITE_TYPES = [
  { id: "all", label: "All Site Types" },
  { id: "Villa", label: "Villa" },
  { id: "Urban", label: "Urban" },
  { id: "Rural", label: "Rural" },
  { id: "Settlement", label: "Settlement" },
  { id: "Necropolis", label: "Necropolis" },
  { id: "Fort", label: "Fort" },
  { id: "Hillfort", label: "Hillfort" },
  { id: "Industrial", label: "Industrial" },
  { id: "Port", label: "Port" },
  { id: "Religious", label: "Religious" }
];

@customElement("site-type-filter")
export class SiteTypeFilter extends LitElement {
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
    
    .site-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 3px 0;
    }
    
    .site-option:hover {
      background-color: #f5f5f5;
    }
    
    input[type="radio"] {
      cursor: pointer;
    }
    
    label {
      cursor: pointer;
      font-size: 0.9rem;
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
        <div class="filter-title">Site Type Filter</div>
        
        <select @change=${this.handleChange}>
          ${SITE_TYPES.map(type => html`
            <option value=${type.id} ?selected=${this.selected === type.id}>${type.label}</option>
          `)}
        </select>
      </div>
    `;
  }

  handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selected = select.value;
    
    this.dispatchEvent(new CustomEvent("site-filter-change", {
      detail: { type: this.selected },
      bubbles: true,
      composed: true
    }));
  }
}