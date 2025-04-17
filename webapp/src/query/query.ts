import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"
import { getPrefixesAsRDF } from "../prefixes/prefix"

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

    render() {
        return html`
        <div class="inner-container">
            <textarea id="text-${this._id}"></textarea>
            <div>
                <button id="run-${this._id}" onclick="${this.runQuery}">Run</button>
                <button id="remove-${this._id}">Remove</button>
            </div>
        </div>
        `;
    }

    runQuery() {
        console.log("clicked")
        let textarea = document.getElementById(`text-${this._id}`)! as HTMLTextAreaElement
        let userInput = textarea.value
        console.log(userInput)
        let query = getPrefixesAsRDF() + userInput
        alert(query)
    }
}