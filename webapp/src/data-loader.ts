import type { FeatureCollection } from "geojson"

export interface SiteData {
  id: string
  name: string
  siteType: string
  analysisType: string
  location: [number, number] // [longitude, latitude]
  ceramics: {
    [key: string]: number // 陶瓷类型和是否存在(1/0)
  }
  periods: string[] // 该遗址活跃的时期
}

export async function loadSiteData(): Promise<SiteData[]> {
  const response = await fetch("/data/located-sites/locatedsitesTS_any.csv")
  const text = await response.text()
  const lines = text.split("\n")
  const headers = lines[0].split(",")
  
  const ceramicColumns = [
    "TS_any", "TS_early", "TS_late", "TSH", "TSHT", "TSHTB", "TSHTM", 
    "TSG", "DSP", "ARSA", "ARSC", "ARSD", "ARS_325", "ARS_400", 
    "ARS_450", "ARS_525", "ARS_600", "LRC", "LRD", "PRCW"
  ]
  
  const sites: SiteData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values = lines[i].split(",")
    const id = values[0]
    const name = values[1]
    const siteType = values[3]
    const analysisType = values[4]
    const latitude = parseFloat(values[values.length - 2])
    const longitude = parseFloat(values[values.length - 1])
    
    if (isNaN(latitude) || isNaN(longitude)) continue
    
    const ceramics: {[key: string]: number} = {}
    const periods: string[] = []
    
    // 提取陶瓷数据
    for (const ceramic of ceramicColumns) {
      const index = headers.indexOf(ceramic)
      if (index !== -1) {
        ceramics[ceramic] = parseInt(values[index]) || 0
      }
    }
    
    // 根据陶瓷类型确定时期
    if (ceramics["TS_early"] === 1) periods.push("early-roman")
    if (ceramics["TS_late"] === 1) periods.push("late-roman")
    if (ceramics["ARS_450"] === 1 || ceramics["ARS_525"] === 1 || ceramics["ARS_600"] === 1) 
      periods.push("post-roman")
    
    sites.push({
      id,
      name,
      siteType,
      analysisType,
      location: [longitude, latitude],
      ceramics,
      periods
    })
  }
  
  return sites
}

export function sitesToGeoJSON(sites: SiteData[], period?: string): FeatureCollection {
  const features = sites
    .filter(site => !period || site.periods.includes(period))
    .map(site => ({
      type: "Feature" as const,
      properties: {
        id: site.id,
        name: site.name,
        siteType: site.siteType,
        analysisType: site.analysisType,
        ...site.ceramics
      },
      geometry: {
        type: "Point" as const,
        coordinates: site.location
      }
    }))
  
  return {
    type: "FeatureCollection" as const,
    features
  }
}