// data-loader.ts
// Define FeatureCollection interface directly to avoid geojson dependency
interface Geometry {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}

interface Feature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: Geometry;
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}

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
const SPARQL_ENDPOINT = "/api/sparql"; 

/**
 * Load site data using SPARQL query
 */
export async function loadSiteData(): Promise<SiteData[]> {
  try {
    // Define SPARQL query to get all site data
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
      PREFIX maps: <http://maps.webapp/ontology/>
      
      SELECT ?id ?name ?municipality ?siteType ?analysisType ?provincia ?region ?longitude ?latitude
             ?TS_any ?TS_early ?TS_late ?TSH ?TSHT ?TSHTB ?TSHTM 
             ?TSG ?DSP ?ARSA ?ARSC ?ARSD ?ARS_325 ?ARS_400 
             ?ARS_450 ?ARS_525 ?ARS_600 ?LRC ?LRD ?PRCW
             ?Coin_pre234 ?Coin_C3crisis ?Coins_tetrarchy 
             ?Coin_C4_E ?Coin_C4_L ?Coin_C5 ?Coin_Just
      WHERE {
        ?site rdf:type maps:ArchaeologicalSite ;
              maps:id ?id ;
              maps:name ?name ;
              geo:hasGeometry/geo:asWKT ?wkt .
              
        # Extract coordinates from WKT
        BIND(REPLACE(STR(?wkt), "^POINT\\\\(([0-9.-]+) ([0-9.-]+)\\\\)$", "$1") AS ?longitude)
        BIND(REPLACE(STR(?wkt), "^POINT\\\\(([0-9.-]+) ([0-9.-]+)\\\\)$", "$2") AS ?latitude)
        
        OPTIONAL { ?site maps:municipality ?municipality }
        OPTIONAL { ?site maps:siteType ?siteType }
        OPTIONAL { ?site maps:analysisType ?analysisType }
        OPTIONAL { ?site maps:provincia ?provincia }
        OPTIONAL { ?site maps:region ?region }
        
        # Ceramic data
        OPTIONAL { ?site maps:TS_any ?TS_any }
        OPTIONAL { ?site maps:TS_early ?TS_early }
        OPTIONAL { ?site maps:TS_late ?TS_late }
        OPTIONAL { ?site maps:TSH ?TSH }
        OPTIONAL { ?site maps:TSHT ?TSHT }
        OPTIONAL { ?site maps:TSHTB ?TSHTB }
        OPTIONAL { ?site maps:TSHTM ?TSHTM }
        OPTIONAL { ?site maps:TSG ?TSG }
        OPTIONAL { ?site maps:DSP ?DSP }
        OPTIONAL { ?site maps:ARSA ?ARSA }
        OPTIONAL { ?site maps:ARSC ?ARSC }
        OPTIONAL { ?site maps:ARSD ?ARSD }
        OPTIONAL { ?site maps:ARS_325 ?ARS_325 }
        OPTIONAL { ?site maps:ARS_400 ?ARS_400 }
        OPTIONAL { ?site maps:ARS_450 ?ARS_450 }
        OPTIONAL { ?site maps:ARS_525 ?ARS_525 }
        OPTIONAL { ?site maps:ARS_600 ?ARS_600 }
        OPTIONAL { ?site maps:LRC ?LRC }
        OPTIONAL { ?site maps:LRD ?LRD }
        OPTIONAL { ?site maps:PRCW ?PRCW }
        
        # Coin data
        OPTIONAL { ?site maps:Coin_pre234 ?Coin_pre234 }
        OPTIONAL { ?site maps:Coin_C3crisis ?Coin_C3crisis }
        OPTIONAL { ?site maps:Coins_tetrarchy ?Coins_tetrarchy }
        OPTIONAL { ?site maps:Coin_C4_E ?Coin_C4_E }
        OPTIONAL { ?site maps:Coin_C4_L ?Coin_C4_L }
        OPTIONAL { ?site maps:Coin_C5 ?Coin_C5 }
        OPTIONAL { ?site maps:Coin_Just ?Coin_Just }
      }
    `;
    
    // Execute SPARQL query
    try {
      console.log("Attempting to fetch data from SPARQL endpoint...");
      const response = await fetch(SPARQL_ENDPOINT, {
        method: 'GET', // Try GET instead of POST since 405 indicates method not allowed
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log("SPARQL response status:", response.status);
      
      // Handle any error responses (including 404 and 405)
      if (response.status === 404 || response.status === 405 || !response.ok) {
        console.log(`SPARQL endpoint returned ${response.status}, using mock data...`);
        return generateMockData();
      }
      
      const data = await response.json();
      const bindings = data.results.bindings;
      
      // Process the SPARQL results
      const sites: SiteData[] = bindings.map((binding: any) => {
        const ceramicColumns = [
          "TS_any", "TS_early", "TS_late", "TSH", "TSHT", "TSHTB", "TSHTM", 
          "TSG", "DSP", "ARSA", "ARSC", "ARSD", "ARS_325", "ARS_400", 
          "ARS_450", "ARS_525", "ARS_600", "LRC", "LRD", "PRCW"
        ];
        
        const coinColumns = [
          "Coin_pre234", "Coin_C3crisis", "Coins_tetrarchy", 
          "Coin_C4_E", "Coin_C4_L", "Coin_C5", "Coin_Just"
        ];
        
        // Extract ceramic data
        const ceramics: {[key: string]: number} = {};
        for (const ceramic of ceramicColumns) {
          ceramics[ceramic] = binding[ceramic] ? parseInt(binding[ceramic].value) || 0 : 0;
        }
        
        // Extract coin data
        const coins: {[key: string]: number} = {};
        for (const coin of coinColumns) {
          coins[coin] = binding[coin] ? parseInt(binding[coin].value) || 0 : 0;
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
        
        // 确保有省份和地区数据
        let region = binding.region ? binding.region.value : "";
        let provincia = binding.provincia ? binding.provincia.value : "";
        
        // 如果没有这些值，设置默认值而不是空字符串
        if (!region || region.trim() === "") {
          region = "Unknown Region";
        }
        
        if (!provincia || provincia.trim() === "") {
          provincia = "Unknown Province";
        }
        
        return {
          id: binding.id.value,
          name: binding.name.value,
          municipality: binding.municipality ? binding.municipality.value : "",
          siteType: binding.siteType ? binding.siteType.value : "",
          analysisType: binding.analysisType ? binding.analysisType.value : "",
          provincia: provincia,
          region: region,
          location: [
            parseFloat(binding.longitude.value),
            parseFloat(binding.latitude.value)
          ],
          ceramics,
          coins,
          periods
        };
      });
      
      return sites;
    } catch (error) {
      console.error("SPARQL query failed:", error);
      console.log("Using mock data due to SPARQL failure");
      return generateMockData();
    }
  } catch (error) {
    console.error("Error loading site data:", error);
    console.log("Using mock data due to error");
    return generateMockData();
  }
}

/**
 * Generate mock site data
 */
function generateMockData(): SiteData[] {
  console.log("Generating mock data...");
  // Create about 50 mock sites
  const mockSites: SiteData[] = [];
  const regions = ["Lusitania", "Baetica", "Tarraconensis"];
  const siteTypes = ["Villa", "Urban", "Rural", "Settlement", "Necropolis", "Fort", "Hillfort", "Industrial", "Port", "Religious"];
  const provincias = ["Gallecia", "Carthaginensis", "Baleares", "Hispania Ulterior", "Hispania Citerior"];
  const municipalities = ["Emerita Augusta", "Hispalis", "Tarraco", "Bracara Augusta", "Corduba", "Caesaraugusta", "Olissipo", "Gades", "Valentia", "Conimbriga"];
  
  for (let i = 0; i < 50; i++) {
    const ceramics: {[key: string]: number} = {};
    // Random ceramic types
    ["TSH", "TSHT", "TSHTB", "TSHTM", "TSG", "DSP", 
     "ARSA", "ARSC", "ARSD", "LRC", "LRD", "PRCW",
     "TS_any", "TS_early", "TS_late", "ARS_325", "ARS_400", 
     "ARS_450", "ARS_525", "ARS_600"].forEach(type => {
      ceramics[type] = Math.random() > 0.7 ? 1 : 0;
    });
    
    // Ensure at least one ceramic type
    if (Object.values(ceramics).every(v => v === 0)) {
      ceramics["TS_any"] = 1;
      ceramics["TSH"] = 1;
    }
    
    // Random coin types
    const coins: {[key: string]: number} = {};
    ["Coin_pre234", "Coin_C3crisis", "Coins_tetrarchy", 
     "Coin_C4_E", "Coin_C4_L", "Coin_C5", "Coin_Just"].forEach(type => {
      coins[type] = Math.random() > 0.8 ? 1 : 0;
    });
    
    // Determine periods
    const periods: string[] = [];
    if (ceramics["TS_early"] === 1) periods.push("early-roman");
    if (ceramics["TS_late"] === 1) periods.push("late-roman");
    if (ceramics["ARS_450"] === 1 || ceramics["ARS_525"] === 1 || ceramics["ARS_600"] === 1) 
      periods.push("post-roman");
    
    // If no period specified, add to early-roman
    if (periods.length === 0) periods.push("early-roman");
    
    // Random location in Iberian Peninsula
    const longitude = -9 + Math.random() * 10; // -9 to 1
    const latitude = 36 + Math.random() * 8;   // 36 to 44
    
    // 确保每个站点都有非空的region和provincia值
    const region = regions[Math.floor(Math.random() * regions.length)];
    const provincia = provincias[Math.floor(Math.random() * provincias.length)];
    
    mockSites.push({
      id: `MOCK-${i+1}`,
      name: `Archaeological Site ${i+1}`,
      municipality: municipalities[Math.floor(Math.random() * municipalities.length)],
      siteType: siteTypes[Math.floor(Math.random() * siteTypes.length)],
      analysisType: siteTypes[Math.floor(Math.random() * siteTypes.length)],
      provincia: provincia,  // 确保provincia值非空
      region: region,        // 确保region值非空
      location: [longitude, latitude],
      ceramics,
      coins,
      periods
    });
  }
  
  console.log(`Generated ${mockSites.length} mock sites, all with region and provincia data`);
  return mockSites;
}

/**
 * Load site types using SPARQL query
 */
export async function loadSiteTypes(): Promise<Map<string, string>> {
  try {
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX maps: <http://maps.webapp/ontology/>
      
      SELECT ?id ?name ?label
      WHERE {
        ?type rdf:type maps:SiteType ;
              maps:id ?id ;
              maps:name ?name .
        OPTIONAL { ?type rdfs:label ?label }
      }
    `;
    
    try {
      const response = await fetch(SPARQL_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 404 || response.status === 405 || !response.ok) {
        console.log(`SPARQL endpoint for site types returned ${response.status}, using mock data`);
        return generateMockSiteTypes();
      }
      
      const data = await response.json();
      const bindings = data.results.bindings;
      
      const siteTypes = new Map<string, string>();
      
      bindings.forEach((binding: any) => {
        const id = binding.id.value;
        const name = binding.name.value;
        const label = binding.label ? binding.label.value : null;
        
        siteTypes.set(id, label || name);
      });
      
      return siteTypes;
    } catch (error) {
      console.error("SPARQL query for site types failed:", error);
      return generateMockSiteTypes();
    }
  } catch (error) {
    console.error("Error loading site types:", error);
    return generateMockSiteTypes();
  }
}

/**
 * Generate mock site types
 */
function generateMockSiteTypes(): Map<string, string> {
  console.log("Generating mock site types...");
  const types = new Map<string, string>();
  
  types.set("Villa", "Villa");
  types.set("Urban", "Urban");
  types.set("Rural", "Rural");
  types.set("Settlement", "Settlement");
  types.set("Necropolis", "Necropolis");
  types.set("Fort", "Fort");
  types.set("Hillfort", "Hillfort");
  types.set("Industrial", "Industrial");
  types.set("Port", "Port");
  types.set("Religious", "Religious");
  
  return types;
}

/**
 * Load province boundaries using SPARQL query
 */
export async function loadProvinces(): Promise<any> {
  try {
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
      PREFIX maps: <http://maps.webapp/ontology/>
      
      SELECT ?id ?name ?geojson
      WHERE {
        ?province rdf:type maps:Province ;
                 maps:id ?id ;
                 maps:name ?name ;
                 maps:geoJSON ?geojson .
      }
    `;
    
    try {
      const response = await fetch(SPARQL_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 404 || response.status === 405 || !response.ok) {
        console.log(`SPARQL endpoint for provinces returned ${response.status}, using mock data`);
        return generateMockProvinces();
      }
      
      const data = await response.json();
      const bindings = data.results.bindings;
      
      // Combine all province GeoJSON features into a single GeoJSON object
      const features = bindings.map((binding: any) => {
        // Parse the GeoJSON string from the SPARQL result
        const featureJson = JSON.parse(binding.geojson.value);
        
        // Add properties from the query
        featureJson.properties = featureJson.properties || {};
        featureJson.properties.id = binding.id.value;
        featureJson.properties.name = binding.name.value;
        
        return featureJson;
      });
      
      return {
        type: "FeatureCollection",
        features
      };
    } catch (error) {
      console.error("SPARQL query for provinces failed:", error);
      return generateMockProvinces();
    }
  } catch (error) {
    console.error("Error loading province data:", error);
    return generateMockProvinces();
  }
}

/**
 * Generate mock province data
 */
function generateMockProvinces() {
  console.log("Generating mock province data...");
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "lusitania",
          name: "Lusitania"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-9, 37], [-7, 37], [-7, 41], [-9, 41], [-9, 37]
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "baetica",
          name: "Baetica"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-7, 36], [-3, 36], [-3, 39], [-7, 39], [-7, 36]
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "tarraconensis",
          name: "Tarraconensis"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-3, 36], [1, 36], [1, 44], [-7, 44], [-7, 39], [-3, 39], [-3, 36]
          ]]
        }
      }
    ]
  };
}

/**
 * Convert sites to GeoJSON format
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