// ceramic-explorer.ts
import { LitElement, html, css } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { loadSiteData, sitesToGeoJSON, loadProvinces, getCeramicCounts, getRegionCounts, getPeriodCounts } from "./data-loader";
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
  `;

  @state()
  private sites: SiteData[] = [];
  
  @state()
  private loading = true;
  
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

  // 添加以下 @query 装饰器来解决 shadowRoot 问题
  @query("#main-map")
  private mapElement!: HTMLElement;

  async firstUpdated() {
    try {
      // 并行加载数据
      const [sites, provinces] = await Promise.all([
        loadSiteData(),
        loadProvinces()
      ]);
      
      this.sites = sites;
      this.provincesData = provinces;
      this.filteredSitesCount = sites.length;
      
      // 获取地图元素 - 使用 @query 装饰器定义的属性
      const map = this.mapElement;
      
      // 显示所有站点
      if (map) {
        const geoJSON = sitesToGeoJSON(this.sites);
        await (map as any).showFeatures(geoJSON);
        
        // 加载省份边界
        if (this.provincesData) {
          await (map as any).addProvinces(this.provincesData);
        }
      }
      
      this.loading = false;
    } catch (error) {
      console.error("加载数据失败:", error);
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
    this.updateMap();
  }
  
  toggleProvinces() {
    this.showProvinces = !this.showProvinces;
    
    // 使用 @query 装饰器定义的属性
    if (this.mapElement) {
      (this.mapElement as any).toggleProvinces(this.showProvinces);
    }
  }
  
  updateMap() {
    // 使用 @query 装饰器定义的属性
    if (!this.mapElement) return;
    
    // 筛选数据
    let filteredSites = this.sites;
    
    // 应用时期筛选
    if (this.currentPeriod !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.periods.includes(this.currentPeriod)
      );
    }
    
    // 应用陶瓷类型筛选
    if (this.currentCeramicType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.ceramics[this.currentCeramicType] === 1
      );
    }
    
    // 应用遗址类型筛选
    if (this.currentSiteType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.siteType === this.currentSiteType || 
        site.analysisType === this.currentSiteType
      );
    }
    
    // 应用地区筛选
    if (this.currentRegion !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.region === this.currentRegion || 
        site.provincia === this.currentRegion
      );
    }
    
    this.filteredSitesCount = filteredSites.length;
    
    // 更新地图
    const geoJSON = sitesToGeoJSON(filteredSites);
    (this.mapElement as any).showFeatures(geoJSON);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div class="loading-spinner"></div>
          <span>加载数据中...</span>
        </div>
      `;
    }
    
    // 筛选当前显示的站点
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
      filteredSites = filteredSites.filter(site => 
        site.region === this.currentRegion || 
        site.provincia === this.currentRegion
      );
    }
    
    return html`
      <div class="header">
        <h1>伊比利亚半岛陶瓷分布时间序列可视化</h1>
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
            <div class="stats-title">当前筛选结果</div>
            <div>显示 ${this.filteredSitesCount} 个遗址（共 ${this.sites.length} 个）</div>
            
            <label style="display: block; margin-top: 10px;">
              <input 
                type="checkbox" 
                ?checked=${this.showProvinces} 
                @change=${this.toggleProvinces}
              /> 
              显示罗马省份边界
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
}