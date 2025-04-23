// ceramic-explorer.ts
import { LitElement, html, css } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { 
  loadSiteData, sitesToGeoJSON, loadProvinces, 
  loadMunicipalities, loadCeramicTypes, loadAnalyticRegions,
  getCeramicCounts, getRegionCounts, getPeriodCounts 
} from "./data-loader";
import type { SiteData } from "./data-loader";
import "./time-slider";
import "./ceramic-filter";
import "./site-type-filter";
import "./region-filter";
import "./ceramic-chart";
import "./tile-map";

@customElement("ceramic-explorer")
export class CeramicExplorer extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
    }
    
    .header {
      background: linear-gradient(to right, #4b6cb7, #182848);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    .map-container {
      flex: 1;
      height: 100%;
      position: relative;
    }
    
    .sidebar {
      width: 320px;
      background: #f5f5f5;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }
    
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      font-size: 1.2rem;
      background: #f5f5f5;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .stats-card {
      background: white;
      padding: 1rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 1rem;
    }
    
    .stats-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #4b6cb7;
    }
    
    .filter-section {
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    
    .filter-section:last-child {
      border-bottom: none;
    }
    
    .error-message {
      color: #e74c3c;
      padding: 1rem;
      background-color: #fadbd8;
      border-radius: 4px;
      margin: 1rem;
      text-align: center;
    }
  `;

  @state()
  private sites: SiteData[] = [];
  
  @state()
  private loading = true;
  
  @state()
  private loadError: string | null = null;
  
  @state()
  private currentPeriod = "all";
  
  @state() 
  private currentCeramicType = "all";
  
  @state() 
  private currentSiteType = "all";
  
  @state()
  private currentRegion = "all";
  
  @state()
  private filteredSitesCount = 0;
  
  @state()
  private showProvinces = false;
  
  @state()
  private provincesData: any = null;
  
  @state()
  private municipalitiesData: any = null;
  
  @state()
  private ceramicTypesData: any[] = [];
  
  @state()
  private analyticRegionsData: any[] = [];

  // Add @query decorator to solve shadowRoot issues
  @query("#main-map")
  private mapElement!: HTMLElement;

  async firstUpdated() {
    try {
      console.log("Ceramic Explorer: Loading data from SPARQL endpoint...");
      this.loading = true;
      this.loadError = null;
      
      // Load data in parallel using Promise.all
      const [sites, provinces, municipalities, ceramicTypes, analyticRegions] = await Promise.all([
        loadSiteData(),
        loadProvinces(),
        loadMunicipalities(),
        loadCeramicTypes(),
        loadAnalyticRegions()
      ]);
      
      console.log("Data loaded in ceramic-explorer:");
      console.log(`Total sites: ${sites.length}`);
      console.log(`Ceramic types: ${ceramicTypes.length}`);
      
      this.sites = sites;
      
      // Ensure sites data includes region and provincia properties
      this.sites = this.sites.map(site => {
        // Ensure region exists
        if (!site.region || site.region.trim() === "") {
          site.region = "Unknown Region";
        }
        
        // Ensure provincia exists
        if (!site.provincia || site.provincia.trim() === "") {
          site.provincia = "Unknown Province";
        }
        
        return site;
      });
      
      // Check the distribution of region and provincia in the loaded data
      const regionSet = new Set<string>();
      const provinciasSet = new Set<string>();
      
      this.sites.forEach(site => {
        if (site.region && site.region.trim() !== "") {
          regionSet.add(site.region);
        }
        if (site.provincia && site.provincia.trim() !== "") {
          provinciasSet.add(site.provincia);
        }
      });
      
      console.log(`Found ${regionSet.size} unique regions: ${Array.from(regionSet).join(', ')}`);
      console.log(`Found ${provinciasSet.size} unique provincias: ${Array.from(provinciasSet).join(', ')}`);
      
      console.log(`Loaded ${this.sites.length} sites with ${this.sites.filter(s => s.region && s.region.trim() !== "").length} regions and ${this.sites.filter(s => s.provincia && s.provincia.trim() !== "").length} provincias`);
      
      this.provincesData = provinces;
      this.municipalitiesData = municipalities;
      this.ceramicTypesData = ceramicTypes;
      this.analyticRegionsData = analyticRegions;
      this.filteredSitesCount = sites.length;
      
      // Check if we have data
      if (this.sites.length === 0) {
        this.loadError = "No site data was returned from the SPARQL endpoint. Please check your query and endpoint configuration.";
        this.loading = false;
        return;
      }
      
      // Get map element - use @query decorator defined property
      const map = this.mapElement;
      
      // Show all sites
      if (map) {
        try {
          const geoJSON = sitesToGeoJSON(this.sites);
          await (map as any).showFeatures(geoJSON);
          
          // Load province boundaries
          if (this.provincesData && this.provincesData.features && this.provincesData.features.length > 0) {
            await (map as any).addProvinces(this.provincesData);
          }
        } catch (mapError) {
          console.error("Error initializing map:", mapError);
          this.loadError = "Error initializing map. Please check console for details.";
        }
      } else {
        console.error("Map element not found");
        this.loadError = "Map element not found. Please check your HTML template.";
      }
      
      this.loading = false;
    } catch (error) {
      console.error("Failed to load data:", error);
      this.loadError = `Failed to load data from SPARQL endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.loading = false;
    }
  }
  
  handlePeriodChange(e: CustomEvent) {
    this.currentPeriod = e.detail.period;
    this.updateMap();
  }
  
  handleCeramicFilterChange(e: CustomEvent) {
    this.currentCeramicType = e.detail.type;
    this.updateMap();
  }
  
  handleSiteFilterChange(e: CustomEvent) {
    this.currentSiteType = e.detail.type;
    this.updateMap();
  }
  
  handleRegionFilterChange(e: CustomEvent) {
    this.currentRegion = e.detail.region;
    console.log(`Region filter changed to: ${this.currentRegion}`);
    this.updateMap();
  }
  
  toggleProvinces() {
    this.showProvinces = !this.showProvinces;
    
    // Use @query decorator defined property
    if (this.mapElement) {
      (this.mapElement as any).toggleProvinces(this.showProvinces);
    }
  }
  
  updateMap() {
    // Use @query decorator defined property
    if (!this.mapElement) return;
    
    // Filter data
    let filteredSites = [...this.sites]; // Create a copy to avoid modifying the original
    
    // Apply period filter
    if (this.currentPeriod !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.periods.includes(this.currentPeriod)
      );
      console.log(`After period filter (${this.currentPeriod}): ${filteredSites.length} sites`);
    }
    
    // Apply ceramic type filter
    if (this.currentCeramicType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.ceramics[this.currentCeramicType] === 1
      );
      console.log(`After ceramic filter (${this.currentCeramicType}): ${filteredSites.length} sites`);
    }
    
    // Apply site type filter
    if (this.currentSiteType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.siteType === this.currentSiteType || 
        site.analysisType === this.currentSiteType
      );
      console.log(`After site type filter (${this.currentSiteType}): ${filteredSites.length} sites`);
    }
    
    // Apply region filter - improved with case-insensitive comparison and debug logging
    if (this.currentRegion !== "all") {
      // Log region values for debugging
      const regionValues = new Set<string>();
      const provinciaValues = new Set<string>();
      this.sites.slice(0, 20).forEach(site => {
        if (site.region) regionValues.add(site.region);
        if (site.provincia) provinciaValues.add(site.provincia);
      });
      console.log(`Sample region values: ${Array.from(regionValues).join(', ')}`);
      console.log(`Sample provincia values: ${Array.from(provinciaValues).join(', ')}`);
      
      // Use case-insensitive comparison for more robust filtering
      const lowerRegion = this.currentRegion.toLowerCase();
      filteredSites = filteredSites.filter(site => 
        (site.region && site.region.toLowerCase() === lowerRegion) || 
        (site.provincia && site.provincia.toLowerCase() === lowerRegion)
      );
      
      console.log(`After region filter (${this.currentRegion}): ${filteredSites.length} sites`);
      
      // Debug the first few filtered sites
      if (filteredSites.length > 0) {
        console.log("Sample filtered sites:");
        filteredSites.slice(0, 3).forEach(site => {
          console.log(`- Site ${site.id}: region=${site.region}, provincia=${site.provincia}`);
        });
      } else {
        console.warn(`No sites match the region filter "${this.currentRegion}"`);
      }
    }
    
    this.filteredSitesCount = filteredSites.length;
    
    // Update map
    const geoJSON = sitesToGeoJSON(filteredSites);
    (this.mapElement as any).showFeatures(geoJSON);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div class="loading-spinner"></div>
          <span>Loading data from SPARQL endpoint...</span>
        </div>
      `;
    }
    
    if (this.loadError) {
      return html`
        <div class="header">
          <h1>Iberian Peninsula Ceramic Distribution Time Series Visualization</h1>
        </div>
        <div class="error-message">
          <h2>Error Loading Data</h2>
          <p>${this.loadError}</p>
          <button @click=${this.retryLoading}>Retry</button>
        </div>
      `;
    }
    
    // Filter current displayed sites
    let filteredSites = this.sites;
    
    if (this.currentPeriod !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.periods.includes(this.currentPeriod)
      );
    }
    
    if (this.currentCeramicType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.ceramics[this.currentCeramicType] === 1
      );
    }
    
    if (this.currentSiteType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.siteType === this.currentSiteType || 
        site.analysisType === this.currentSiteType
      );
    }
    
    if (this.currentRegion !== "all") {
      const lowerRegion = this.currentRegion.toLowerCase();
      filteredSites = filteredSites.filter(site => 
        (site.region && site.region.toLowerCase() === lowerRegion) || 
        (site.provincia && site.provincia.toLowerCase() === lowerRegion)
      );
    }
    
    return html`
      <div class="header">
        <h1>Iberian Peninsula Ceramic Distribution Time Series Visualization</h1>
      </div>
      
      <div class="main-content">
        <div class="sidebar">
          <div class="filter-section">
            <time-slider 
              @period-change=${this.handlePeriodChange}
              .selected=${this.currentPeriod}
            ></time-slider>
          </div>
          
          <div class="filter-section">
            <ceramic-filter
              @ceramic-filter-change=${this.handleCeramicFilterChange}
              .selected=${this.currentCeramicType}
            ></ceramic-filter>
          </div>
          
          <div class="filter-section">
            <site-type-filter
              @site-filter-change=${this.handleSiteFilterChange}
              .selected=${this.currentSiteType}
            ></site-type-filter>
          </div>
          
          <div class="filter-section">
            <region-filter
              @region-filter-change=${this.handleRegionFilterChange}
              .selected=${this.currentRegion}
              .sites=${this.sites}
            ></region-filter>
          </div>
          
          <div class="stats-card">
            <div class="stats-title">Current Filter Results</div>
            <div>Showing ${this.filteredSitesCount} sites (out of ${this.sites.length})</div>
            
            <label style="display: block; margin-top: 10px;">
              <input 
                type="checkbox" 
                ?checked=${this.showProvinces} 
                @change=${this.toggleProvinces}
              /> 
              Show Roman province boundaries
            </label>
          </div>
          
          <ceramic-chart
            .sites=${filteredSites}
            .period=${this.currentPeriod}
            .ceramicType=${this.currentCeramicType}
            .siteType=${this.currentSiteType}
            .region=${this.currentRegion}
          ></ceramic-chart>
        </div>
        
        <div class="map-container">
          <tile-map id="main-map"></tile-map>
        </div>
      </div>
    `;
  }
  
  retryLoading() {
    this.firstUpdated();
  }
}