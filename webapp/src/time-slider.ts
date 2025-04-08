// Create the src/time-slider.ts file

import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"

export const TIME_PERIODS = [
  { id: "all", label: "All periods" },
  { id: "early-roman", label: "Early Rome (1st - 3rd centuries)" },
  { id: "late-roman", label: "Late Rome (4th - 5th centuries)" },
  { id: "post-roman", label: "Post-roman (5th-7th centuries)" }
]

@customElement("time-slider")
export class TimeSlider extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .time-labels {
      display: flex;
      justify-content: space-between;
    }
    
    .time-label {
      flex: 1;
      text-align: center;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
    }
    
    .time-label.selected {
      background: #0078ff;
      color: white;
    }
  `

  @property({ type: String })
  selected = "all"

  render() {
    return html`
      <div class="slider-container">
        <div class="time-labels">
          ${TIME_PERIODS.map(period => html`
            <div 
              class="time-label ${period.id === this.selected ? 'selected' : ''}"
              @click=${() => this.handlePeriodClick(period.id)}
            >
              ${period.label}
            </div>
          `)}
        </div>
      </div>
    `
  }

  handlePeriodClick(periodId: string) {
    this.selected = periodId
    this.dispatchEvent(new CustomEvent("period-change", {
      detail: { period: periodId },
      bubbles: true,
      composed: true
    }))
  }
}