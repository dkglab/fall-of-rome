// region-filter.ts
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { SiteData } from "./data-loader";

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
    
    .filter-button {
      width: 100%;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: white;
      text-align: left;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .dropdown {
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .section-title {
      padding: 0.5rem;
      font-weight: bold;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
    }
    
    .option {
      padding: 0.5rem;
      cursor: pointer;
    }
    
    .option:hover {
      background-color: #f5f5f5;
    }
    
    .option.selected {
      background-color: #e0e0e0;
      font-weight: bold;
    }
    
    .hidden {
      display: none;
    }
  `;

  @property({ type: String })
  selected = "all";
  
  @property({ type: Array })
  sites: SiteData[] = [];
  
  @state()
  dropdownVisible = false;

  render() {
    const regions = this.getRegions();
    
    // 用于调试
    console.log("Region filter regions:", regions.regions);
    console.log("Region filter provincias:", regions.provincias);
    
    return html`
      <div class="filter-container">
        <div class="filter-title">Region Filter</div>
        
        <button class="filter-button" @click=${this.toggleDropdown}>
          ${this.getSelectedLabel()}
          <span>${this.dropdownVisible ? '▲' : '▼'}</span>
        </button>
        
        <div class="dropdown ${this.dropdownVisible ? '' : 'hidden'}">
          <div 
            class="option ${this.selected === 'all' ? 'selected' : ''}"
            @click=${() => this.selectOption('all')}
          >
            All Regions
          </div>
          
          ${regions.regions.length > 0 ? html`
            <div class="section-title">Regions</div>
            ${regions.regions.map(region => html`
              <div 
                class="option ${this.selected === region ? 'selected' : ''}"
                @click=${() => this.selectOption(region)}
              >
                ${region}
              </div>
            `)}
          ` : ''}
          
          ${regions.provincias.length > 0 ? html`
            <div class="section-title">Provinces</div>
            ${regions.provincias.map(provincia => html`
              <div 
                class="option ${this.selected === provincia ? 'selected' : ''}"
                @click=${() => this.selectOption(provincia)}
              >
                ${provincia}
              </div>
            `)}
          ` : ''}
        </div>
      </div>
    `;
  }
  
  getSelectedLabel() {
    if (this.selected === 'all') return 'All Regions';
    
    const regions = this.getRegions();
    if (regions.regions.includes(this.selected)) return this.selected;
    if (regions.provincias.includes(this.selected)) return this.selected;
    
    return 'All Regions';
  }
  
  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }
  
  selectOption(value: string) {
    this.selected = value;
    this.dropdownVisible = false;
    
    this.dispatchEvent(new CustomEvent("region-filter-change", {
      detail: { region: this.selected },
      bubbles: true,
      composed: true
    }));
    
    console.log(`Region filter changed to: ${this.selected}`);
  }
  
  getRegions() {
    const regions = new Set<string>();
    const provincias = new Set<string>();
    
    if (!this.sites || this.sites.length === 0) {
      console.warn("No sites data available for region filter");
      // 添加一些默认值以便于调试
      return {
        regions: ["Lusitania", "Baetica", "Tarraconensis"],
        provincias: ["Gallecia", "Carthaginensis", "Baleares"]
      };
    }
    
    this.sites.forEach(site => {
      try {
        if (site.region && typeof site.region === 'string' && site.region.trim() !== "") {
          regions.add(site.region);
        }
        if (site.provincia && typeof site.provincia === 'string' && site.provincia.trim() !== "") {
          provincias.add(site.provincia);
        }
      } catch (error) {
        console.error("Error processing site for regions:", error, site);
      }
    });
    
    return {
      regions: Array.from(regions).sort(),
      provincias: Array.from(provincias).sort()
    };
  }
  
  // Close dropdown when clicking outside
  connectedCallback() {
    super.connectedCallback();
    console.log("Region filter connected, sites count:", this.sites?.length || 0);
    
    if (this.sites && this.sites.length > 0) {
      // 输出前5个站点的region和provincia值以便调试
      console.log("Sample sites data (first 5):");
      for (let i = 0; i < Math.min(5, this.sites.length); i++) {
        const site = this.sites[i];
        console.log(`Site ${i+1}: id=${site.id}, region=${site.region}, provincia=${site.provincia}`);
      }
      
      // 检查有多少站点有有效的region和provincia
      const sitesWithRegion = this.sites.filter(site => site.region && site.region.trim() !== "").length;
      const sitesWithProvincia = this.sites.filter(site => site.provincia && site.provincia.trim() !== "").length;
      console.log(`Stats: ${sitesWithRegion}/${this.sites.length} sites have region, ${sitesWithProvincia}/${this.sites.length} sites have provincia`);
    } else {
      console.warn("No sites data available for region-filter");
    }
    
    document.addEventListener('click', this.handleClickOutside);
  }
  
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('sites')) {
      console.log("Sites updated in region-filter, new count:", this.sites?.length || 0);
      const regions = this.getRegions();
      console.log("Updated regions:", regions.regions.length, "provincias:", regions.provincias.length);
    }
  }
  
  disconnectedCallback() {
    document.removeEventListener('click', this.handleClickOutside);
    super.disconnectedCallback();
  }
  
  handleClickOutside = (event: MouseEvent) => {
    const path = event.composedPath();
    if (!path.includes(this)) {
      this.dropdownVisible = false;
    }
  }
}
