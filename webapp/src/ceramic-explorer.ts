// 在ceramic-explorer.ts的开头添加导入
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { loadSiteData, sitesToGeoJSON } from "./data-loader";
import type { SiteData } from "./data-loader";  // 修改为类型导入
import "./time-slider";
import "./ceramic-filter";
import "./site-type-filter";
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
    }
    
    .header {
      background: #4b6cb7;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    .map-container {
      flex: 1;
      height: 100%;
    }
    
    .sidebar {
      width: 300px;
      background: #f5f5f5;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      font-size: 1.2rem;
    }
  `;

  // 使用state装饰器而不是property
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

  async firstUpdated() {
    try {
      // 加载站点数据
      this.sites = await loadSiteData();
      
      // 获取地图元素
      const map = this.shadowRoot?.querySelector("tile-map");
      
      // 显示所有站点
      if (map) {
        const geoJSON = sitesToGeoJSON(this.sites);
        await (map as any).showFeatures(geoJSON);
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
  
  updateMap() {
    const map = this.shadowRoot?.querySelector("tile-map");
    if (!map) return;
    
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
    
    if (this.currentSiteType !== "all") {
      filteredSites = filteredSites.filter(site => 
        site.siteType === this.currentSiteType || 
        site.analysisType === this.currentSiteType
      );
    }
    
    // 更新地图
    const geoJSON = sitesToGeoJSON(filteredSites);
    (map as any).showFeatures(geoJSON);
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">加载数据中...</div>`;
    }
    
    return html`
      <div class="header">
        <h1>伊比利亚半岛陶瓷分布时间序列可视化</h1>
      </div>
      
      <div class="main-content">
        <div class="sidebar">
          <time-slider 
            @period-change=${this.handlePeriodChange}
          ></time-slider>
          
          <ceramic-filter
            @ceramic-filter-change=${this.handleCeramicFilterChange}
          ></ceramic-filter>
          
          <site-type-filter
            @site-filter-change=${this.handleSiteFilterChange}
          ></site-type-filter>
        </div>
        
        <div class="map-container">
          <tile-map id="main-map"></tile-map>
        </div>
      </div>
    `;
  }
}