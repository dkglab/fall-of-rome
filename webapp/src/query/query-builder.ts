export namespace QueryBuilder {
    const BASE_START = `
    SELECT ?wkt
    WHERE {
    `
    const BASE_END = "}"

    function buildBase(innards: string) {
        return BASE_START + innards + BASE_END
    }

    export function buildSiteType(type: string) {
        return buildBase(`
            ?site_type rdf:type skos:Concept ;
                dct:identifier "${type}"
                .
            
            for:located-sites rdfs:member ?site .

            ?site a geo:Feature ;
                geo:hasGeometry ?geo ;
                for:siteType ?site_type;
                .

            ?geo geo:asWKT ?wkt .
            `)
    }

    export function buildRomanProvinces(province: string) {
        return buildBase(`
            for:roman-provinces rdfs:member ?province .

            ?province a geo:Feature ;
                geo:hasGeometry ?geo ;
                dct:identifier "${province}" ;
                .

            ?geo geo:asWKT ?wkt .
            `)
    }

    export function buildMunicipality(municipality: string) {
        return buildBase(`
            for:municipalities rdfs:member ?muni .

            ?muni a geo:Feature ;
                geo:hasGeometry ?geo ;
                rdfs:label "${municipality}" ;
                .

            ?geo geo:asWKT ?wkt .
            `)
    }

    export function buildQueryFor(type: string, value: string) {
        switch (type) {
            case "site-type":
                return buildSiteType(value)
            case "roman-province":
                return buildRomanProvinces(value)
            case "municipality":
                return buildMunicipality(value)
            default:
                throw new Error("Not implemented");
                
        }
    }
}