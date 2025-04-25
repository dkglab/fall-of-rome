const prefixes: Map<string, string> = new Map(Object.entries({
    for: "https://dkglab.github.io/ns/for/",
    geo: "http://www.opengis.net/ont/geosparql#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    apf: "http://jena.apache.org/ARQ/property#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    dct: "http://purl.org/dc/terms/",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    geof: "http://www.opengis.net/def/function/geosparql/",
    pno: "http://linked.data.gov.au/def/placenames/",
    uom: "http://www.opengis.net/def/uom/OGC/1.0/",
}))

const getPrefixesAsRDF = () => {
    return Array.from(prefixes)
                .map(([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`)
                .join("\n")
}

export {
    prefixes,
    getPrefixesAsRDF
}