import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"
import { getPrefixesAsRDF } from "../prefixes/prefix"
import type { QueryUpdatedEvent } from "./query-updated-event"

@customElement("query-holder")
export default class Query extends LitElement {
    static id = 0
    static styles = css`
    .inner-container {
        padding: 0.25em;
    }
    textarea {
        width: 15em;
    }
    `;

    _id: number

    constructor() {
        super()
        this._id = Query.id++
    }

    connectedCallback(): void {
        super.connectedCallback()
        this.id = `query-${this._id}`
    }

    render() {
        return html`
        <div class="inner-container">
            <textarea id="text-${this._id}" rows="10"></textarea>
            <div>
                <button id="run-${this._id}" @click="${this.runQuery}">Run</button>
                <button id="remove-${this._id}" @click="${this.removeQuery}">Remove</button>
            </div>
        </div>
        `;
    }

    runQuery(e: Event) {
        let textarea = this.renderRoot.querySelector(`#text-${this._id}`)! as HTMLTextAreaElement
        let userInput = textarea.value
        let query = getPrefixesAsRDF() + userInput
        let event: QueryUpdatedEvent = new CustomEvent(
            "query-updated",
            {
                detail: {
                    query: query,
                    id: this._id
                },
                bubbles: true,
                composed: true,
            }
        )
        this.dispatchEvent(event)
    }

    removeQuery(e: Event) {
        document.getElementById(this.id)!.remove()
    }
}