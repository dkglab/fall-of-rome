// region-filter.ts
import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import type { SiteData } from "./data-loader"

@customElement("region-filter")
export class RegionFilter extends LitElement {
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
    
    .region-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 3px 0;
    }
    
    .region-option:hover {
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
  `

  @property({ type: String })
  selected = "all"
  
  @property({ type: Array })
  sites: SiteData[] = []

  render() {
    const regions = this.getRegions()
    
    return html`
      <div class="filter-container">
        <div class="filter-title">Region Filter</div>
        
        <select @change=${this.handleChange}>
          <option value="all" ?selected=${this.selected === "all"}>All Regions</option>
          
          <optgroup label="Regiones">
            ${regions.regions.map(region => html`
              <option value=${region} ?selected=${this.selected === region}>${region}</option>
            `)}
          </optgroup>
          
          <optgroup label="Provincias">
            ${regions.provincias.map(provincia => html`
              <option value=${provincia} ?selected=${this.selected === provincia}>${provincia}</option>
            `)}
          </optgroup>
        </select>
      </div>
    `
  }
  
  getRegions() {
    const regions = new Set<string>()
    const provincias = new Set<string>()
    
    this.sites.forEach(site => {
      if (site.region && site.region.trim() !== "") {
        regions.add(site.region)
      }
      if (site.provincia && site.provincia.trim() !== "") {
        provincias.add(site.provincia)
      }
    })
    
    return {
      regions: Array.from(regions).sort(),
      provincias: Array.from(provincias).sort()
    }
  }

  handleChange(e: Event) {
    const select = e.target as HTMLSelectElement
    this.selected = select.value
    
    this.dispatchEvent(new CustomEvent("region-filter-change", {
      detail: { region: this.selected },
      bubbles: true,
      composed: true
    }))
  }
}