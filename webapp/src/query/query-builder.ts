export namespace QueryBuilder {
    const BASE_START = `
    SELECT ?wkt
    WHERE {
    `
    const BASE_END = "}"
    const BASE_SITES = `
    for:located-sites rdfs:member ?site .

    ?site a geo:Feature ;
        geo:hasGeometry ?geo ;
        .

    ?geo geo:asWKT ?wkt .
    `


    function buildBase(innards: string) {
        return BASE_START + innards + BASE_END
    }

    function buildSiteType(type: string) {
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

    function buildRomanProvinces(province: string) {
        return buildBase(`
            for:roman-provinces rdfs:member ?province .

            ?province a geo:Feature ;
                geo:hasGeometry ?geo ;
                dct:identifier "${province}" ;
                .

            ?geo geo:asWKT ?wkt .
            `)
    }

    function buildMunicipality(municipality: string) {
        return buildBase(`
            for:municipalities rdfs:member ?muni .

            ?muni a geo:Feature ;
                geo:hasGeometry ?geo ;
                rdfs:label "${municipality}" ;
                .

            ?geo geo:asWKT ?wkt .
            `)
    }

    function buildAnalyticRegion(region: string) {
        return buildBase(`
            for:analytic-regions a geo:FeatureCollection ;
                rdfs:member ?reg ;
                .

            ?reg a geo:Feature ;
                skos:prefLabel "${region}" ;
                geo:hasGeometry ?reggeo ;
                .
            ?reggeo geo:asWKT ?wkt .
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
            case "analytic-region":
                return buildAnalyticRegion(value)
            default:
                throw new Error("Not implemented");
                
        }
    }

    export function buildFilteredQuery(filters: IFilter[]) {
        let innards = BASE_SITES
        for (const filter of filters) {
            innards += buildFilter(filter)
        }
        return buildBase(innards)
    }

    export interface IFilter {
        type: "site-type" | "roman-province" | "municipality" | "analytic-region",
        value: string
    }

    function buildFilter(filter: IFilter) {
        switch (filter.type) {
            case "site-type":
                return `
                ?site_type rdf:type skos:Concept ;
                    dct:identifier "${filter.value}"
                    .

                ?site for:siteType ?site_type .
                `
            case "roman-province":
                return `
                for:roman-provinces rdfs:member ?province .

                ?province a geo:Feature ;
                    dct:identifier "${filter.value}" ;
                    geo:hasGeo ?prov_geo ;
                    .
                ?prov_geo geo:asWKT ?prov_wkt .
                
                FILTER(geof:sfWithin(?wkt, ?prov_wkt))
                `
            case "municipality":
                return `
                for:municipalities rdfs:member ?muni .

                ?muni a geo:Feature ;
                    geo:hasGeometry ?muni_geo ;
                    rdfs:label "${filter.value}" ;
                    .

                ?muni_geo geo:asWKT ?muni_wkt .

                FILTER(geof:sfWithin(?wkt, ?muni_wkt))
                `
            case "analytic-region":
                return `
                for:analytic-regions rdfs:member ?reg .

                ?reg a geo:Feature ;
                    geo:hasGeometry ?reg_geo ;
                    skos:prefLabel "${filter.value}" ;
                    .

                ?reg_geo geo:asWKT ?reg_wkt .

                FILTER(geof:sfWithin(?wkt, ?reg_wkt))
                `
            default:
                throw new Error("No type specified");
        }
    }
}