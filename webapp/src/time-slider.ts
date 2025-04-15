// time-slider.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export const TIME_PERIODS = [
  { id: "all", label: "All Periods", years: "1st-7th Century CE" },
  { id: "early-roman", label: "Early Roman", years: "1st-3rd Century CE" },
  { id: "late-roman", label: "Late Roman", years: "4th-5th Century CE" },
  { id: "post-roman", label: "Post-Roman", years: "5th-7th Century CE" }
];

@customElement("time-slider")
export class TimeSlider extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .time-labels {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    
    .time-label {
      flex: 1;
      min-width: 120px;
      text-align: center;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0.25rem;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    
    .time-label:hover {
      background: #e0e0e0;
    }
    
    .time-label.selected {
      background: #4b6cb7;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .slider-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #4b6cb7;
    }
    
    .years {
      display: block;
      font-size: 0.8rem;
      margin-top: 0.2rem;
      opacity: 0.8;
    }
    
    .timeline {
      position: relative;
      height: 5px;
      background: #e0e0e0;
      margin: 1rem 0;
      border-radius: 5px;
    }
    
    .timeline-marker {
      position: absolute;
      width: 15px;
      height: 15px;
      background: #4b6cb7;
      border-radius: 50%;
      top: -5px;
      transform: translateX(-50%);
      cursor: pointer;
    }
    
    .timeline-period {
      position: absolute;
      height: 5px;
      background: #b0c4de;
      border-radius: 5px;
    }
    
    .timeline-period.selected {
      background: #4b6cb7;
    }
    
    .timeline-label {
      position: absolute;
      top: -25px;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
    }
  `;

  @property({ type: String })
  selected = "all";

  render() {
    return html`
      <div class="slider-container">
        <div class="slider-title">Time Filter</div>
        
        <div class="time-labels">
          ${TIME_PERIODS.map(period => html`
            <div 
              class="time-label ${period.id === this.selected ? 'selected' : ''}"
              @click=${() => this.handlePeriodClick(period.id)}
            >
              ${period.label}
              <span class="years">${period.years}</span>
            </div>
          `)}
        </div>
        
        <div class="timeline">
          <!-- Early Roman Period -->
          <div 
            class="timeline-period ${this.selected === 'early-roman' || this.selected === 'all' ? 'selected' : ''}" 
            style="left: 10%; width: 30%"
            @click=${() => this.handlePeriodClick('early-roman')}
          ></div>
          
          <!-- Late Roman Period -->
          <div 
            class="timeline-period ${this.selected === 'late-roman' || this.selected === 'all' ? 'selected' : ''}" 
            style="left: 40%; width: 20%"
            @click=${() => this.handlePeriodClick('late-roman')}
          ></div>
          
          <!-- Post-Roman Period -->
          <div 
            class="timeline-period ${this.selected === 'post-roman' || this.selected === 'all' ? 'selected' : ''}" 
            style="left: 60%; width: 30%"
            @click=${() => this.handlePeriodClick('post-roman')}
          ></div>
          
          <!-- Time Markers -->
          <div class="timeline-marker" style="left: 10%">
            <div class="timeline-label">1st Century CE</div>
          </div>
          <div class="timeline-marker" style="left: 40%">
            <div class="timeline-label">4th Century CE</div>
          </div>
          <div class="timeline-marker" style="left: 60%">
            <div class="timeline-label">5th Century CE</div>
          </div>
          <div class="timeline-marker" style="left: 90%">
            <div class="timeline-label">7th Century CE</div>
          </div>
        </div>
      </div>
    `;
  }

  handlePeriodClick(periodId: string) {
    this.selected = periodId;
    this.dispatchEvent(new CustomEvent("period-change", {
      detail: { period: periodId },
      bubbles: true,
      composed: true
    }));
  }
}