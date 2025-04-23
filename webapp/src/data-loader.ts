// data-loader.ts
import type { FeatureCollection } from "geojson";
import GraphStore from "./graph-store";

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
    [key: string]: number; // Ceramic type and whether it exists (1/0)
  };
  coins: {
    [key: string]: number; // Coin type and whether it exists (1/0)
  };
  periods: string[]; // Periods when the site was active
}

// SPARQL endpoint URL
const SPARQL_ENDPOINT = "http://localhost:3030/sites/query";

// Create a GraphStore instance with mock enabled for offline development
const store = new GraphStore(SPARQL_ENDPOINT, true);

/**
 * Load site data using SPARQL query
 */
export async function loadSiteData(): Promise<SiteData[]> {
  try {
    console.log("Loading site data from SPARQL endpoint...");
    
    // Load and execute the located-sites.rq query from the correct path
    const response = await fetch('/queries/select/located-sites.rq');
    if (!response.ok) {
      throw new Error(`Failed to load located-sites.rq query: ${response.status} ${response.statusText}`);
    }
    
    const sitesQuery = await response.text();
    console.log("Executing SPARQL query for site data...");
    const bindings = await store.query(sitesQuery);
    console.log(`Received ${bindings.length} results from SPARQL query`);
    
    // List of all ceramic types we're interested in
    const ceramicColumns = [
      "TSH", "TSHT", "TSHTB", "TSHTM", "TSG", "DSP", 
      "ARSA", "ARSC", "ARSD", "LRC", "LRD", "PRCW",
      "TS_any", "TS_early", "TS_late", "ARS_325", "ARS_400", 
      "ARS_450", "ARS_525", "ARS_600"
    ];
    
    const coinColumns = [
      "Coin_pre234", "Coin_C3crisis", "Coins_tetrarchy", 
      "Coin_C4_E", "Coin_C4_L", "Coin_C5", "Coin_Just"
    ];
    
    // Process the SPARQL results
    const sites: SiteData[] = bindings.map(binding => {
      // Extract ceramic data
      const ceramics: {[key: string]: number} = {};
      for (const ceramic of ceramicColumns) {
        ceramics[ceramic] = binding.get(ceramic) ? 
          parseInt(binding.get(ceramic)!.value) || 0 : 0;
      }
      
      // Extract coin data
      const coins: {[key: string]: number} = {};
      for (const coin of coinColumns) {
        coins[coin] = binding.get(coin) ? 
          parseInt(binding.get(coin)!.value) || 0 : 0;
      }
      
      // Determine periods based on ceramic types
      const periods: string[] = [];
      if (ceramics["TS_early"] === 1) periods.push("early-roman");
      if (ceramics["TS_late"] === 1) periods.push("late-roman");
      if (ceramics["ARS_450"] === 1 || ceramics["ARS_525"] === 1 || ceramics["ARS_600"] === 1) 
        periods.push("post-roman");
      
      // If no specific period info but has TS_any marker, add to early-roman
      if (periods.length === 0 && ceramics["TS_any"] === 1) {
        periods.push("early-roman");
      }
      
      // Ensure region and provincia data
      let region = binding.get("region") ? binding.get("region")!.value : "";
      let provincia = binding.get("provincia") ? binding.get("provincia")!.value : "";
      
      // Set default values if these are empty
      if (!region || region.trim() === "") {
        region = "Unknown Region";
      }
      
      if (!provincia || provincia.trim() === "") {
        provincia = "Unknown Province";
      }
      
      return {
        id: binding.get("id")!.value,
        name: binding.get("site_name")!.value,
        municipality: binding.get("municipality") ? binding.get("municipality")!.value : "",
        siteType: binding.get("siteType") ? binding.get("siteType")!.value : "",
        analysisType: binding.get("analysisType") ? binding.get("analysisType")!.value : "",
        provincia: provincia,
        region: region,
        location: [
          parseFloat(binding.get("longitude")!.value),
          parseFloat(binding.get("latitude")!.value)
        ],
        ceramics,
        coins,
        periods
      };
    });
    
    console.log(`Successfully loaded ${sites.length} sites from SPARQL query`);
    return sites;
    
  } catch (error) {
    console.error("Error loading site data from SPARQL:", error);
    // Return empty array on error
    return [];
  }
}

/**
 * Load site types using SPARQL query
 */
export async function loadSiteTypes(): Promise<Map<string, string>> {
  try {
    console.log("Loading site types from SPARQL endpoint...");
    
    // Load and execute the site-types.rq query from the correct path
    const response = await fetch('/queries/select/site-types.rq');
    if (!response.ok) {
      throw new Error(`Failed to load site-types.rq query: ${response.status} ${response.statusText}`);
    }
    
    const siteTypesQuery = await response.text();
    console.log("Executing SPARQL query for site types...");
    const bindings = await store.query(siteTypesQuery);
    console.log(`Received ${bindings.length} site types from SPARQL query`);
    
    const siteTypes = new Map<string, string>();
    
    bindings.forEach(binding => {
      const id = binding.get("id")!.value;
      const name = binding.get("name")!.value;
      const label = binding.get("label") ? binding.get("label")!.value : null;
      
      siteTypes.set(id, label || name);
    });
    
    return siteTypes;
  } catch (error) {
    console.error("Error loading site types from SPARQL:", error);
    return new Map<string, string>();
  }
}

/**
 * Load province boundaries using SPARQL query
 */
export async function loadProvinces(): Promise<any> {
  try {
    console.log("Loading province boundaries from SPARQL endpoint...");
    
    // Load and execute the roman-provinces.rq query from the correct path
    const response = await fetch('/queries/select/roman-provinces.rq');
    if (!response.ok) {
      throw new Error(`Failed to load roman-provinces.rq query: ${response.status} ${response.statusText}`);
    }
    
    const provincesQuery = await response.text();
    console.log("Executing SPARQL query for province boundaries...");
    const bindings = await store.query(provincesQuery);
    console.log(`Received ${bindings.length} province boundaries from SPARQL query`);
    
    // Combine all province GeoJSON features into a single GeoJSON object
    const features = bindings.map(binding => {
      try {
        // Parse the GeoJSON string from the SPARQL result
        const featureJson = JSON.parse(binding.get("geojson")!.value);
        
        // Add properties from the query
        featureJson.properties = featureJson.properties || {};
        featureJson.properties.id = binding.get("id")!.value;
        featureJson.properties.name = binding.get("name")!.value;
        
        return featureJson;
      } catch (parseError) {
        console.error("Error parsing GeoJSON for province:", parseError);
        return null;
      }
    }).filter(feature => feature !== null);
    
    console.log(`Successfully processed ${features.length} province features`);
    
    return {
      type: "FeatureCollection",
      features
    };
  } catch (error) {
    console.error("Error loading province data from SPARQL:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

/**
 * Load municipalities using SPARQL query
 */
export async function loadMunicipalities(): Promise<any> {
  try {
    console.log("Loading municipalities from SPARQL endpoint...");
    
    // Load and execute the municipalities.rq query from the correct path
    const response = await fetch('/queries/select/municipalities.rq');
    if (!response.ok) {
      throw new Error(`Failed to load municipalities.rq query: ${response.status} ${response.statusText}`);
    }
    
    const municipalitiesQuery = await response.text();
    console.log("Executing SPARQL query for municipalities...");
    const bindings = await store.query(municipalitiesQuery);
    console.log(`Received ${bindings.length} municipalities from SPARQL query`);
    
    // Create a map of municipality names to properties
    const municipalities = new Map<string, {id: string, name: string, region: string}>();
    
    bindings.forEach(binding => {
      const id = binding.get("id")!.value;
      const name = binding.get("name")!.value;
      const region = binding.get("region") ? binding.get("region")!.value : "Unknown";
      
      municipalities.set(name, {id, name, region});
    });
    
    return municipalities;
  } catch (error) {
    console.error("Error loading municipalities from SPARQL:", error);
    return new Map();
  }
}

/**
 * Load ceramic types using SPARQL query
 */
export async function loadCeramicTypes(): Promise<any[]> {
  try {
    console.log("Loading ceramic types from SPARQL endpoint...");
    
    // Load and execute the ceramic-types.rq query from the correct path
    const response = await fetch('/queries/select/ceramic-types.rq');
    if (!response.ok) {
      throw new Error(`Failed to load ceramic-types.rq query: ${response.status} ${response.statusText}`);
    }
    
    const ceramicTypesQuery = await response.text();
    console.log("Executing SPARQL query for ceramic types...");
    const bindings = await store.query(ceramicTypesQuery);
    console.log(`Received ${bindings.length} ceramic types from SPARQL query`);
    
    const ceramicTypes = bindings.map(binding => {
      return {
        id: binding.get("id")!.value,
        name: binding.get("name")!.value,
        description: binding.get("description") ? binding.get("description")!.value : "",
        period: binding.get("period") ? binding.get("period")!.value : ""
      };
    });
    
    return ceramicTypes;
  } catch (error) {
    console.error("Error loading ceramic types from SPARQL:", error);
    return [];
  }
}

/**
 * Load analytic regions using SPARQL query
 */
export async function loadAnalyticRegions(): Promise<any> {
  try {
    console.log("Loading analytic regions from SPARQL endpoint...");
    
    // Load and execute the analytic-regions.rq query from the correct path
    const response = await fetch('/queries/select/analytic-regions.rq');
    if (!response.ok) {
      throw new Error(`Failed to load analytic-regions.rq query: ${response.status} ${response.statusText}`);
    }
    
    const regionsQuery = await response.text();
    console.log("Executing SPARQL query for analytic regions...");
    const bindings = await store.query(regionsQuery);
    console.log(`Received ${bindings.length} analytic regions from SPARQL query`);
    
    // Process regions data as needed
    const regions = bindings.map(binding => {
      return {
        id: binding.get("id")!.value,
        name: binding.get("name")!.value,
        description: binding.get("description") ? binding.get("description")!.value : "",
        geojson: binding.get("geojson") ? JSON.parse(binding.get("geojson")!.value) : null
      };
    });
    
    return regions;
  } catch (error) {
    console.error("Error loading analytic regions from SPARQL:", error);
    return [];
  }
}

/**
 * Convert sites to GeoJSON format for map display
 */
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

/**
 * Get ceramic type counts for the given sites
 */
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

/**
 * Get region counts for the given sites
 */
export function getRegionCounts(sites: SiteData[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  sites.forEach(site => {
    if (site.region) {
      counts[site.region] = (counts[site.region] || 0) + 1;
    }
  });
  
  return counts;
}

/**
 * Get period counts for the given sites
 */
export function getPeriodCounts(sites: SiteData[]): Record<string, number> {
  const periods = ["early-roman", "late-roman", "post-roman"];
  const counts: Record<string, number> = {};
  
  periods.forEach(period => {
    counts[period] = sites.filter(site => site.periods.includes(period)).length;
  });
  
  return counts;
}