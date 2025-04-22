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
}