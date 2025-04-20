// index.ts
import "./ceramic-explorer";
import { initMockSparql } from './mock-sparql';

// Initialize mock SPARQL processor before DOM content loaded
initMockSparql();

// Ensure application initializes after page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Iberian Peninsula Ceramic Distribution Time Series Visualization App Loaded");
  console.log("确保region-filter组件正常工作...");
  
  // Check if ceramic-explorer element already exists
  const existingExplorer = document.querySelector("ceramic-explorer");
  
  // If not exists, create one
  if (!existingExplorer) {
    const explorer = document.createElement("ceramic-explorer");
    document.body.appendChild(explorer);
    console.log("创建了ceramic-explorer组件");
  } else {
    console.log("已存在ceramic-explorer组件");
  }
});