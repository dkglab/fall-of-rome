import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"
import { join } from "lit/directives/join.js"
import { map } from "lit/directives/map.js"
import { prefixes } from "./prefix"

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