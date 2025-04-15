// index.ts
import "./ceramic-explorer"


document.addEventListener("DOMContentLoaded", () => {
  console.log("Visualization of the time series of ceramic distribution in the Iberian Peninsula Done")
  
  const existingExplorer = document.querySelector("ceramic-explorer")
  

  if (!existingExplorer) {
    const explorer = document.createElement("ceramic-explorer")
    document.body.appendChild(explorer)
  }
})