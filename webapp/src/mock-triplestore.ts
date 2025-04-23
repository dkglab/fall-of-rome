// mock-triplestore.ts
// Ensure oxigraph is imported correctly
let oxigraph: any;
try {
  // Import oxigraph dynamically to handle potential loading issues
  import('oxigraph/web.js').then(module => {
    oxigraph = module;
    console.log("Oxigraph module loaded successfully");
  }).catch(error => {
    console.error("Failed to load oxigraph module:", error);
  });
} catch (error) {
  console.error("Error importing oxigraph:", error);
}

/**
 * A class that simulates a SPARQL endpoint using Oxigraph in-browser store
 */
export class MockTriplestore {
  private store: any = null;
  private initialized: boolean = false;
  private fallbackMode: boolean = false;

  constructor() {
    // Defer store creation until initialization
    console.log("Mock triplestore created");
  }

  /**
   * Initialize the store with data from TTL file
   */
  async initialize(ttlUrl: string): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Wait for oxigraph to be loaded
      if (!oxigraph) {
        console.log("Waiting for oxigraph to load...");
        await new Promise<void>(resolve => {
          const checkInterval = setInterval(() => {
            if (oxigraph) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            this.fallbackMode = true;
            console.warn("Oxigraph failed to load in time, using fallback mode");
            resolve();
          }, 5000);
        });
      }
      
      // Try to create the store
      if (oxigraph && !this.fallbackMode) {
        try {
          console.log("Creating oxigraph store...");
          this.store = new oxigraph.Store();
          console.log("Oxigraph store created successfully");
          
          // Try to load data
          try {
            const response = await fetch(ttlUrl);
            if (response.ok) {
              const ttlData = await response.text();
              
              const loadOptions = {
                format: "text/turtle",
                baseIRI: "http://example.org/"
              };
              
              this.store.load(ttlData, loadOptions);
              console.log("Data loaded into oxigraph store");
            } else {
              console.warn(`Failed to fetch TTL data: ${response.status} ${response.statusText}`);
            }
          } catch (loadError) {
            console.error("Error loading TTL data:", loadError);
          }
        } catch (storeError) {
          console.error("Failed to create oxigraph store:", storeError);
          this.fallbackMode = true;
        }
      } else {
        this.fallbackMode = true;
      }
      
      this.initialized = true;
      console.log(`Mock triplestore initialized (fallback mode: ${this.fallbackMode})`);
    } catch (error) {
      console.error("Failed to initialize mock triplestore:", error);
      this.fallbackMode = true;
      this.initialized = true;
    }
  }

  /**
   * Execute a SPARQL query against the in-memory store or return mock data
   */
  executeQuery(query: string): any {
    if (!this.initialized) {
      console.warn("Mock triplestore not initialized, using fallback data");
      return this.getFallbackResults(query);
    }
    
    if (this.fallbackMode || !this.store) {
      console.log("Using fallback data for query");
      return this.getFallbackResults(query);
    }
    
    try {
      // Execute the query against the oxigraph store
      console.log("Executing query against oxigraph store");
      const results = this.store.query(query);
      
      // Convert results to SPARQL JSON format
      const bindings: any[] = [];
      
      // Handle different result types
      if (typeof results === 'boolean') {
        return { 
          head: { vars: [] },
          boolean: results 
        };
      } else if (results && typeof results[Symbol.iterator] === 'function') {
        // Process iterable results
        for (const binding of results) {
          const resultBinding: Record<string, any> = {};
          
          // Convert Map entries to object
          if (binding instanceof Map) {
            for (const [key, value] of binding) {
              resultBinding[key] = this.termToObject(value);
            }
          } else if (oxigraph && binding instanceof oxigraph.Quad) {
            // Handle quad results
            resultBinding.subject = this.termToObject(binding.subject);
            resultBinding.predicate = this.termToObject(binding.predicate);
            resultBinding.object = this.termToObject(binding.object);
            resultBinding.graph = this.termToObject(binding.graph);
          }
          
          bindings.push(resultBinding);
        }
      }
      
      // Create vars array from the first binding's keys (if available)
      const vars = bindings.length > 0 
        ? Object.keys(bindings[0]) 
        : [];
      
      return {
        head: { vars },
        results: { bindings }
      };
    } catch (error) {
      console.error("Error executing SPARQL query:", error);
      // Return fallback mock results based on the query type
      return this.getFallbackResults(query);
    }
  }

  /**
   * Generate fallback results based on the query content
   */
  private getFallbackResults(query: string): any {
    // Create empty response structure
    const response = {
      head: { vars: ["id", "name"] },
      results: { bindings: [] as any[] }
    };
    
    // Add mock data based on query content
    if (query.includes('located-sites') || query.toLowerCase().includes('site_name')) {
      this.addSiteData(response);
    } else if (query.includes('site-types')) {
      this.addSiteTypes(response);
    } else if (query.includes('roman-provinces')) {
      this.addProvinces(response);
    } else if (query.includes('municipalities')) {
      this.addMunicipalities(response);
    } else if (query.includes('ceramic-types')) {
      this.addCeramicTypes(response);
    } else if (query.includes('analytic-regions')) {
      this.addAnalyticRegions(response);
    }
    
    return response;
  }
  
  // Helper methods to add mock data to response
  
  private addSiteData(response: any): void {
    response.head.vars = ["id", "site_name", "latitude", "longitude", "municipality", "siteType", "analysisType", "region", "provincia", "TSH", "TSHT", "TSHTB", "TSHTM", "TSG", "DSP", "ARSA", "ARSC", "ARSD", "LRC", "LRD", "PRCW", "TS_any", "TS_early", "TS_late", "ARS_325", "ARS_400", "ARS_450", "ARS_525", "ARS_600", "Coin_pre234", "Coin_C3crisis", "Coins_tetrarchy", "Coin_C4_E", "Coin_C4_L", "Coin_C5", "Coin_Just"];
    
    response.results.bindings = [
      {
        id: { type: 'literal', value: 'site1' },
        site_name: { type: 'literal', value: 'Lucentum' },
        latitude: { type: 'literal', value: '38.3572' },
        longitude: { type: 'literal', value: '-0.4519' },
        municipality: { type: 'literal', value: 'Alicante' },
        siteType: { type: 'literal', value: 'urban' },
        analysisType: { type: 'literal', value: 'excavation' },
        region: { type: 'literal', value: 'Tarraconensis' },
        provincia: { type: 'literal', value: 'Hispania Citerior' },
        TSH: { type: 'literal', value: '1' },
        TSHT: { type: 'literal', value: '0' },
        TSHTB: { type: 'literal', value: '0' },
        TSHTM: { type: 'literal', value: '0' },
        TSG: { type: 'literal', value: '1' },
        DSP: { type: 'literal', value: '0' },
        ARSA: { type: 'literal', value: '1' },
        ARSC: { type: 'literal', value: '1' },
        ARSD: { type: 'literal', value: '1' },
        LRC: { type: 'literal', value: '0' },
        LRD: { type: 'literal', value: '0' },
        PRCW: { type: 'literal', value: '0' },
        TS_any: { type: 'literal', value: '1' },
        TS_early: { type: 'literal', value: '1' },
        TS_late: { type: 'literal', value: '0' },
        ARS_325: { type: 'literal', value: '1' },
        ARS_400: { type: 'literal', value: '1' },
        ARS_450: { type: 'literal', value: '0' },
        ARS_525: { type: 'literal', value: '0' },
        ARS_600: { type: 'literal', value: '0' },
        Coin_pre234: { type: 'literal', value: '1' },
        Coin_C3crisis: { type: 'literal', value: '1' },
        Coins_tetrarchy: { type: 'literal', value: '0' },
        Coin_C4_E: { type: 'literal', value: '0' },
        Coin_C4_L: { type: 'literal', value: '0' },
        Coin_C5: { type: 'literal', value: '0' },
        Coin_Just: { type: 'literal', value: '0' }
      },
      {
        id: { type: 'literal', value: 'site2' },
        site_name: { type: 'literal', value: 'Tarraco' },
        latitude: { type: 'literal', value: '41.1188' },
        longitude: { type: 'literal', value: '1.2542' },
        municipality: { type: 'literal', value: 'Tarragona' },
        siteType: { type: 'literal', value: 'urban' },
        analysisType: { type: 'literal', value: 'excavation' },
        region: { type: 'literal', value: 'Tarraconensis' },
        provincia: { type: 'literal', value: 'Hispania Citerior' },
        TSH: { type: 'literal', value: '1' },
        TSHT: { type: 'literal', value: '1' },
        TSHTB: { type: 'literal', value: '0' },
        TSHTM: { type: 'literal', value: '0' },
        TSG: { type: 'literal', value: '1' },
        DSP: { type: 'literal', value: '1' },
        ARSA: { type: 'literal', value: '1' },
        ARSC: { type: 'literal', value: '1' },
        ARSD: { type: 'literal', value: '1' },
        LRC: { type: 'literal', value: '1' },
        LRD: { type: 'literal', value: '0' },
        PRCW: { type: 'literal', value: '0' },
        TS_any: { type: 'literal', value: '1' },
        TS_early: { type: 'literal', value: '1' },
        TS_late: { type: 'literal', value: '1' },
        ARS_325: { type: 'literal', value: '1' },
        ARS_400: { type: 'literal', value: '1' },
        ARS_450: { type: 'literal', value: '1' },
        ARS_525: { type: 'literal', value: '1' },
        ARS_600: { type: 'literal', value: '0' },
        Coin_pre234: { type: 'literal', value: '1' },
        Coin_C3crisis: { type: 'literal', value: '1' },
        Coins_tetrarchy: { type: 'literal', value: '1' },
        Coin_C4_E: { type: 'literal', value: '1' },
        Coin_C4_L: { type: 'literal', value: '1' },
        Coin_C5: { type: 'literal', value: '1' },
        Coin_Just: { type: 'literal', value: '0' }
      }
    ];
  }
  
  private addSiteTypes(response: any): void {
    response.head.vars = ["id", "name", "label"];
    
    response.results.bindings = [
      {
        id: { type: 'literal', value: 'urban' },
        name: { type: 'literal', value: 'Urban' },
        label: { type: 'literal', value: 'Urban Settlement' }
      },
      {
        id: { type: 'literal', value: 'rural' },
        name: { type: 'literal', value: 'Rural' },
        label: { type: 'literal', value: 'Rural Settlement' }
      }
    ];
  }
  
  private addProvinces(response: any): void {
    response.head.vars = ["id", "name", "geojson"];
    
    response.results.bindings = [
      {
        id: { type: 'literal', value: 'province1' },
        name: { type: 'literal', value: 'Hispania Citerior' },
        geojson: { type: 'literal', value: '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[0,40],[2,40],[2,42],[0,42],[0,40]]]}}' }
      }
    ];
  }
  
  private addMunicipalities(response: any): void {
    response.head.vars = ["id", "name", "region"];
    
    response.results.bindings = [
      {
        id: { type: 'literal', value: 'mun1' },
        name: { type: 'literal', value: 'Alicante' },
        region: { type: 'literal', value: 'Tarraconensis' }
      },
      {
        id: { type: 'literal', value: 'mun2' },
        name: { type: 'literal', value: 'Tarragona' },
        region: { type: 'literal', value: 'Tarraconensis' }
      }
    ];
  }
  
  private addCeramicTypes(response: any): void {
    response.head.vars = ["id", "name", "description", "period"];
    
    response.results.bindings = [
      {
        id: { type: 'literal', value: 'TSH' },
        name: { type: 'literal', value: 'Terra Sigillata Hispanic' },
        description: { type: 'literal', value: 'Roman ceramic produced in Hispanic workshops' },
        period: { type: 'literal', value: 'early-roman' }
      },
      {
        id: { type: 'literal', value: 'TSHT' },
        name: { type: 'literal', value: 'Late Hispanic Terra Sigillata' },
        description: { type: 'literal', value: 'Late Roman ceramic produced in Hispanic workshops' },
        period: { type: 'literal', value: 'late-roman' }
      }
    ];
  }
  
  private addAnalyticRegions(response: any): void {
    response.head.vars = ["id", "name", "description", "geojson"];
    
    response.results.bindings = [
      {
        id: { type: 'literal', value: 'region1' },
        name: { type: 'literal', value: 'Tarraconensis' },
        description: { type: 'literal', value: 'Northern region of Roman Hispania' },
        geojson: { type: 'literal', value: '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[0,40],[3,40],[3,43],[0,43],[0,40]]]}}' }
      }
    ];
  }

  /**
   * Helper method to convert an Oxigraph term to a SPARQL JSON result object
   */
  private termToObject(term: any): any {
    // Define result structure with proper TypeScript types
    const obj: {
      type: string;
      value: string;
      datatype?: string;
      "xml:lang"?: string;
    } = {
      type: "literal",
      value: ""
    };

    if (!term) {
      return obj; // Return default object if term is null/undefined
    }
    
    try {
      if (oxigraph && term instanceof oxigraph.NamedNode) {
        obj.type = "uri";
        obj.value = term.value;
      } else if (oxigraph && term instanceof oxigraph.BlankNode) {
        obj.type = "bnode";
        obj.value = term.value;
      } else if (oxigraph && term instanceof oxigraph.Literal) {
        obj.type = "literal";
        obj.value = term.value;
        
        // Safely add datatype if present
        if (term.datatype && typeof term.datatype === 'object' && 'value' in term.datatype) {
          obj.datatype = term.datatype.value;
        }
        
        // Safely add language tag if present
        if (term.language) {
          obj["xml:lang"] = term.language;
        }
      } else if (oxigraph && term instanceof oxigraph.DefaultGraph) {
        obj.type = "uri";
        obj.value = "default";
      } else if (typeof term === 'string') {
        obj.type = "literal";
        obj.value = term;
      } else {
        obj.value = String(term);
      }
    } catch (error) {
      console.error("Error processing term:", error);
      // Return default values in case of error
      obj.type = "literal";
      obj.value = term ? String(term) : "";
    }
    
    return obj;
  }
}

// Create and export a singleton instance
export const mockTriplestore = new MockTriplestore();