// data-loader.ts
import type { FeatureCollection } from "geojson";

export interface SiteData {
  id: string;
  name: string;
  municipality: string;
  siteType: string;
  analysisType: string;
  provincia: string;
  region: string;
  location: [number, number]; // [longitude, latitude]
  ceramics: {
    [key: string]: number; // 陶瓷类型和是否存在(1/0)
  };
  coins: {
    [key: string]: number; // 硬币类型和是否存在(1/0)
  };
  periods: string[]; // 该遗址活跃的时期
}

export async function loadSiteData(): Promise<SiteData[]> {
  try {
    const response = await fetch("/data/roman-provinces/Spain-Late-Antique-Provinces.geojson")
    const text = await response.text();
    const lines = text.split("\n");
    const headers = lines[0].split(",");
    
    const ceramicColumns = [
      "TS_any", "TS_early", "TS_late", "TSH", "TSHT", "TSHTB", "TSHTM", 
      "TSG", "DSP", "ARSA", "ARSC", "ARSD", "ARS_325", "ARS_400", 
      "ARS_450", "ARS_525", "ARS_600", "LRC", "LRD", "PRCW"
    ];
    
    const coinColumns = [
      "Coin_pre234", "Coin_C3crisis", "Coins_tetrarchy", 
      "Coin_C4_E", "Coin_C4_L", "Coin_C5", "Coin_Just"
    ];
    
    const sites: SiteData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(",");
      if (values.length < 5) continue; // 跳过格式不正确的行
      
      const id = values[headers.indexOf("HLLG #")];
      const name = values[headers.indexOf("Site Name")];
      const municipality = values[headers.indexOf("Municipality")];
      const siteType = values[headers.indexOf("Site type")];
      const analysisType = values[headers.indexOf("Analysis_Site_Type")];
      const provincia = values[headers.indexOf("Provincia")];
      const region = values[headers.indexOf("New Regions")];
      
      // 找到经纬度列索引
      const latIndex = headers.indexOf("Latitude");
      const longIndex = headers.indexOf("Longitude");
      
      if (latIndex === -1 || longIndex === -1 || latIndex >= values.length || longIndex >= values.length) {
        continue; // 跳过没有地理信息的遗址
      }
      
      const latitude = parseFloat(values[latIndex]);
      const longitude = parseFloat(values[longIndex]);
      
      if (isNaN(latitude) || isNaN(longitude)) continue;
      
      const ceramics: {[key: string]: number} = {};
      const coins: {[key: string]: number} = {};
      const periods: string[] = [];
      
      // 提取陶瓷数据
      for (const ceramic of ceramicColumns) {
        const index = headers.indexOf(ceramic);
        if (index !== -1 && index < values.length) {
          ceramics[ceramic] = parseInt(values[index]) || 0;
        } else {
          ceramics[ceramic] = 0;
        }
      }
      
      // 提取硬币数据
      for (const coin of coinColumns) {
        const index = headers.indexOf(coin);
        if (index !== -1 && index < values.length) {
          coins[coin] = parseInt(values[index]) || 0;
        } else {
          coins[coin] = 0;
        }
      }
      
      // 根据陶瓷类型确定时期
      if (ceramics["TS_early"] === 1) periods.push("early-roman");
      if (ceramics["TS_late"] === 1) periods.push("late-roman");
      if (ceramics["ARS_450"] === 1 || ceramics["ARS_525"] === 1 || ceramics["ARS_600"] === 1) 
        periods.push("post-roman");
      
      // 如果没有具体时期信息，但有TS_any标记，则添加到早期罗马
      if (periods.length === 0 && ceramics["TS_any"] === 1) {
        periods.push("early-roman");
      }
      
      sites.push({
        id,
        name,
        municipality,
        siteType,
        analysisType,
        provincia,
        region,
        location: [longitude, latitude],
        ceramics,
        coins,
        periods
      });
    }
    
    return sites;
  } catch (error) {
    console.error("加载站点数据出错:", error);
    return [];
  }
}

export async function loadSiteTypes(): Promise<Map<string, string>> {
  try {
    const response = await fetch("/data/site-types/site-types.csv");
    const text = await response.text();
    const lines = text.split("\n");
    const headers = lines[0].split(",");
    
    const idIndex = headers.indexOf("ID");
    const nameIndex = headers.indexOf("Site_Type");
    const labelIndex = headers.indexOf("prefLabel");
    
    const siteTypes = new Map<string, string>();
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(",");
      if (values.length <= Math.max(idIndex, nameIndex, labelIndex)) continue;
      
      const id = values[idIndex];
      const name = values[nameIndex];
      const label = values[labelIndex];
      
      siteTypes.set(id, label || name);
    }
    
    return siteTypes;
  } catch (error) {
    console.error("加载遗址类型数据出错:", error);
    return new Map();
  }
}

export async function loadProvinces(): Promise<any> {
  try {
    const response = await fetch("/data/roman-provinces/Spain Late Antique Provinces.geojson");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("加载省份数据出错:", error);
    return null;
  }
}

export function sitesToGeoJSON(sites: SiteData[], period?: string): FeatureCollection {
  const features = sites
    .filter(site => !period || site.periods.includes(period))
    .map(site => ({
      type: "Feature" as const,
      properties: {
        id: site.id,
        name: site.name,
        municipality: site.municipality,
        siteType: site.siteType,
        analysisType: site.analysisType,
        provincia: site.provincia,
        region: site.region,
        periods: site.periods,
        ...site.ceramics,
        ...site.coins
      },
      geometry: {
        type: "Point" as const,
        coordinates: site.location
      }
    }));
  
  return {
    type: "FeatureCollection" as const,
    features
  };
}

export function getCeramicCounts(sites: SiteData[]): Record<string, number> {
  const ceramicTypes = [
    "TSH", "TSHT", "TSHTB", "TSHTM", "TSG", "DSP", 
    "ARSA", "ARSC", "ARSD", "LRC", "LRD", "PRCW"
  ];
  
  const counts: Record<string, number> = {};
  
  ceramicTypes.forEach(type => {
    counts[type] = sites.filter(site => site.ceramics[type] === 1).length;
  });
  
  return counts;
}

export function getRegionCounts(sites: SiteData[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  sites.forEach(site => {
    if (site.region) {
      counts[site.region] = (counts[site.region] || 0) + 1;
    }
  });
  
  return counts;
}

export function getPeriodCounts(sites: SiteData[]): Record<string, number> {
  const periods = ["early-roman", "late-roman", "post-roman"];
  const counts: Record<string, number> = {};
  
  periods.forEach(period => {
    counts[period] = sites.filter(site => site.periods.includes(period)).length;
  });
  
  return counts;
}