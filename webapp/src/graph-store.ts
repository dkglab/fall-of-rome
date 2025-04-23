// graph-store.ts
import { mockTriplestore } from "./mock-triplestore";

// Attempt to dynamically import oxigraph
let oxigraph: any;
try {
  import('oxigraph/web.js').then(module => {
    oxigraph = module;
    console.log("Oxigraph module loaded successfully in graph-store");
  }).catch(error => {
    console.error("Failed to load oxigraph module in graph-store:", error);
  });
} catch (error) {
  console.error("Error importing oxigraph in graph-store:", error);
}

// Define a type for Term
export type Term = any;

export default class GraphStore {
  store: any = null;
  private endpoint: string;
  private useMock: boolean;

  constructor(endpoint: string = "http://localhost:3030/sites/query", useMock: boolean = true) {
    this.endpoint = endpoint;
    this.useMock = useMock;
    
    // Try to create store if oxigraph is available
    setTimeout(() => {
      try {
        if (oxigraph) {
          console.log("Creating oxigraph store in GraphStore");
          this.store = new oxigraph.Store();
          console.log("Successfully created oxigraph store in GraphStore");
        }
      } catch (error) {
        console.error("Failed to create oxigraph store in GraphStore:", error);
      }
    }, 500); // Delay store creation to allow for dynamic import

    // Initialize mock triplestore if using mock
    if (this.useMock) {
      console.log("Initializing mock triplestore in GraphStore");
      mockTriplestore.initialize("/data.ttl").catch(error => {
        console.error("Failed to initialize mock triplestore:", error);
      });
    }
  }

  async query(sparqlQuery: string, params: Record<string, string> = {}): Promise<Map<string, Term>[]> {
    try {
      // Replace parameters in the query if any
      let processedQuery = sparqlQuery;
      for (const [key, value] of Object.entries(params)) {
        const paramPlaceholder = `?${key}Param`;
        processedQuery = processedQuery.replace(new RegExp(paramPlaceholder, 'g'), `"${value}"`);
      }

      let results;

      if (this.useMock) {
        // Use mock triplestore
        console.log("Using mock triplestore for query");
        results = mockTriplestore.executeQuery(processedQuery);
      } else {
        // Use real SPARQL endpoint
        try {
          console.log("Using real SPARQL endpoint");
          const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/sparql-query',
              'Accept': 'application/sparql-results+json'
            },
            body: processedQuery
          });

          if (!response.ok) {
            throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
          }

          results = await response.json();
        } catch (endpointError) {
          console.error("Error with SPARQL endpoint, falling back to mock:", endpointError);
          results = mockTriplestore.executeQuery(processedQuery);
        }
      }

      const bindings: Map<string, Term>[] = [];

      // Convert SPARQL results to the expected format
      if (results.results && results.results.bindings) {
        for (const binding of results.results.bindings) {
          const bindingMap = new Map<string, Term>();
          
          for (const [key, value] of Object.entries(binding)) {
            bindingMap.set(key, value);
          }
          
          bindings.push(bindingMap);
        }
      }

      return bindings;
    } catch (error) {
      console.error("Error executing SPARQL query:", error);
      return []; // Return empty array on error
    }
  }
}