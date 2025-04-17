import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"
import { join } from "lit/directives/join.js"
import { map } from "lit/directives/map.js"

const prefixes: Map<string, string> = new Map(Object.entries({
    for: "https://dkglab.github.io/ns/for/",
    geo: "http://www.opengis.net/ont/geosparql#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    apf: "http://jena.apache.org/ARQ/property#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    dct: "http://purl.org/dc/terms/",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    geof: "http://www.opengis.net/def/function/geosparql/",
}))

@customElement("prefix-list")
class PrefixList extends LitElement {
    static styles = css`
    ul {
        margin: 0;
        padding: 0 1em;
    }
    `
    render() {
        return html`
        <ul>
            ${join(
                map(prefixes, ([prefix, uri]) => html`<li><a href="${uri}">${prefix}</a></li>`),
                html``
            )}
        </ul>
        `;
    }
}

const getPrefixesAsRDF = () => {
    return Array.from(prefixes).map((prefix, uri) => {
        `PREFIX ${prefix}: <${uri}>`
    }).join("\n")
}

export {
    PrefixList as default,
    prefixes,
    getPrefixesAsRDF
}