// index.ts
import "./ceramic-explorer";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Iberian Peninsula Ceramic Distribution Time Series Visualization App Loaded");

  // Check if ceramic-explorer element already exists
  const existingExplorer = document.querySelector("ceramic-explorer");

  // If not exists, create one
  if (!existingExplorer) {
    const explorer = document.createElement("ceramic-explorer");
    document.body.appendChild(explorer);
    console.log("Created ceramic-explorer component");
  } else {
    console.log("Ceramic-explorer component already exists");
  }
});