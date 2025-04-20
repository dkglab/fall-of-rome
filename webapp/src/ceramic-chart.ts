// ceramic-chart.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SiteData } from "./data-loader";
import { CERAMIC_TYPES } from "./ceramic-filter";

@customElement("ceramic-chart")
export class CeramicChart extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    .chart-container {
      margin-top: 1rem;
    }
    
    .chart-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #4b6cb7;
    }
    
    .bar-container {
      height: 25px;
      width: 100%;
      background-color: #f0f0f0;
      border-radius: 3px;
      margin-bottom: 8px;
      position: relative;
    }
    
    .bar {
      height: 100%;
      background-color: #4b6cb7;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    
    .bar-label {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: #333;
      font-size: 0.8rem;
      z-index: 1;
    }
    
    .bar-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: #333;
      font-size: 0.8rem;
      z-index: 1;
    }
    
    .tab-container {
      display: flex;
      margin-bottom: 1rem;
    }
    
    .tab {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }
    
    .tab.active {
      border-bottom: 2px solid #4b6cb7;
      color: #4b6cb7;
      font-weight: bold;
    }
    
    .no-data {
      padding: 2rem;
      text-align: center;
      color: #888;
    }
  `;

  @property({ type: Array })
  sites: SiteData[] = [];
  
  @property({ type: String })
  period: string = "all";
  
  @property({ type: String })
  ceramicType: string = "all";
  
  @property({ type: String })
  siteType: string = "all";
  
  @property({ type: String })
  region: string = "all";
  
  @property({ type: String })
  activeTab: string = "ceramics";

  render() {
    const filteredSites = this.filterSites();
    
    if (filteredSites.length === 0) {
      return html`
        <div class="chart-title">Statistical Analysis</div>
        <div class="tab-container">
          <div class="tab ${this.activeTab === 'ceramics' ? 'active' : ''}" @click=${() => this.activeTab = 'ceramics'}>Ceramic Types</div>
          <div class="tab ${this.activeTab === 'regions' ? 'active' : ''}" @click=${() => this.activeTab = 'regions'}>Regional Distribution</div>
          <div class="tab ${this.activeTab === 'periods' ? 'active' : ''}" @click=${() => this.activeTab = 'periods'}>Period Distribution</div>
        </div>
        <div class="no-data">No data matching the selected criteria</div>
      `;
    }
    
    return html`
      <div class="chart-title">Statistical Analysis</div>
      
      <div class="tab-container">
        <div class="tab ${this.activeTab === 'ceramics' ? 'active' : ''}" @click=${() => this.activeTab = 'ceramics'}>Ceramic Types</div>
        <div class="tab ${this.activeTab === 'regions' ? 'active' : ''}" @click=${() => this.activeTab = 'regions'}>Regional Distribution</div>
        <div class="tab ${this.activeTab === 'periods' ? 'active' : ''}" @click=${() => this.activeTab = 'periods'}>Period Distribution</div>
      </div>
      
      <div class="chart-container">
        ${this.activeTab === 'ceramics' ? this.renderCeramicChart(filteredSites) :
          this.activeTab === 'regions' ? this.renderRegionChart(filteredSites) :
          this.renderPeriodChart(filteredSites)}
      </div>
    `;
  }
  
  renderCeramicChart(sites: SiteData[]) {
    const ceramicStats = this.calculateCeramicStatistics(sites);
    const totalSites = sites.length;
    
    // Sort by value from largest to smallest
    const sortedStats = Object.entries(ceramicStats)
      .sort(([, countA], [, countB]) => countB - countA);
    
    return html`
      ${sortedStats.map(([type, count]) => {
        if (count === 0) return null;
        
        const typeLabel = CERAMIC_TYPES.find(t => t.id === type)?.label || type;
        const percentage = (count / totalSites) * 100;
        
        return html`
          <div class="bar-container">
            <div class="bar" style="width: ${percentage}%"></div>
            <span class="bar-label">${typeLabel}</span>
            <span class="bar-value">${count} (${percentage.toFixed(1)}%)</span>
          </div>
        `;
      })}
    `;
  }
  
  renderRegionChart(sites: SiteData[]) {
    const regionStats = this.calculateRegionStatistics(sites);
    const totalSites = sites.length;
    
    // Sort by value from largest to smallest
    const sortedStats = Object.entries(regionStats)
      .filter(([region]) => region !== "")
      .sort(([, countA], [, countB]) => countB - countA);
    
    return html`
      ${sortedStats.map(([region, count]) => {
        if (count === 0) return null;
        
        const percentage = (count / totalSites) * 100;
        
        return html`
          <div class="bar-container">
            <div class="bar" style="width: ${percentage}%"></div>
            <span class="bar-label">${region}</span>
            <span class="bar-value">${count} (${percentage.toFixed(1)}%)</span>
          </div>
        `;
      })}
    `;
  }
  
  renderPeriodChart(sites: SiteData[]) {
    const periodStats = this.calculatePeriodStatistics(sites);
    const totalSites = sites.length;
    
    const periods = [
      { id: "early-roman", label: "Early Roman (1st-3rd Century)" },
      { id: "late-roman", label: "Late Roman (4th-5th Century)" },
      { id: "post-roman", label: "Post-Roman (5th-7th Century)" }
    ];
    
    return html`
      ${periods.map(period => {
        const count = periodStats[period.id] || 0;
        if (count === 0) return null;
        
        const percentage = (count / totalSites) * 100;
        
        return html`
          <div class="bar-container">
            <div class="bar" style="width: ${percentage}%"></div>
            <span class="bar-label">${period.label}</span>
            <span class="bar-value">${count} (${percentage.toFixed(1)}%)</span>
          </div>
        `;
      })}
    `;
  }
  
  filterSites(): SiteData[] {
    let filtered = [...this.sites];
    
    // Apply period filter
    if (this.period !== "all") {
      filtered = filtered.filter(site => 
        site.periods.includes(this.period)
      );
    }
    
    // Apply ceramic type filter
    if (this.ceramicType !== "all") {
      filtered = filtered.filter(site => 
        site.ceramics[this.ceramicType] === 1
      );
    }
    
    // Apply site type filter
    if (this.siteType !== "all") {
      filtered = filtered.filter(site => 
        site.siteType === this.siteType || 
        site.analysisType === this.siteType
      );
    }
    
    // Apply region filter
    if (this.region !== "all") {
      filtered = filtered.filter(site => 
        site.region === this.region || 
        site.provincia === this.region
      );
    }
    
    return filtered;
  }
  
  calculateCeramicStatistics(sites: SiteData[]): Record<string, number> {
    const ceramicTypes = [
      "TSH", "TSHT", "TSHTB", "TSHTM", "TSG", "DSP", 
      "ARSA", "ARSC", "ARSD", "LRC", "LRD", "PRCW"
    ];
    
    const stats: Record<string, number> = {};
    
    ceramicTypes.forEach(type => {
      stats[type] = sites.filter(site => site.ceramics[type] === 1).length;
    });
    
    return stats;
  }
  
  calculateRegionStatistics(sites: SiteData[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    sites.forEach(site => {
      const region = site.region || "Other";
      stats[region] = (stats[region] || 0) + 1;
    });
    
    return stats;
  }
  
  calculatePeriodStatistics(sites: SiteData[]): Record<string, number> {
    const periods = ["early-roman", "late-roman", "post-roman"];
    const stats: Record<string, number> = {};
    
    periods.forEach(period => {
      stats[period] = sites.filter(site => site.periods.includes(period)).length;
    });
    
    return stats;
  }
}