const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy file from source to destination
function copyFile(source, destination) {
  try {
    ensureDirectoryExists(path.dirname(destination));
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`Copied ${source} to ${destination}`);
    } else {
      console.warn(`Warning: ${source} does not exist`);
    }
  } catch (err) {
    console.error(`Error copying ${source} to ${destination}:`, err);
  }
}

// Create index.html
function createIndexHtml() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iberian Peninsula Ceramic Distribution Time Series Visualization</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script src="index.js"></script>
</body>
</html>`;

  fs.writeFileSync('webapp/dist/index.html', html);
  console.log('Created index.html');
}

// Main build process
function build() {
  // Ensure dist directory exists
  ensureDirectoryExists('webapp/dist');
  
  // Ensure data directories exist
  ensureDirectoryExists('webapp/dist/data/located-sites');
  ensureDirectoryExists('webapp/dist/data/roman-provinces');
  ensureDirectoryExists('webapp/dist/data/site-types');
  ensureDirectoryExists('webapp/dist/data/ceramic-types');
  
  // Copy data files
  // Located sites
  copyFile('data/located-sites/located-sites.csv', 'webapp/dist/data/located-sites/located-sites.csv');
  copyFile('data/located-sites/located-sites-TS_any.csv', 'webapp/dist/data/located-sites/located-sites-TS_any.csv');
  
  // Roman provinces
  copyFile('data/roman-provinces/Spain-Late-Antique-Provinces.geojson', 'webapp/dist/data/roman-provinces/Spain-Late-Antique-Provinces.geojson');
  copyFile('data/roman-provinces/roman-provinces.csv', 'webapp/dist/data/roman-provinces/roman-provinces.csv');
  
  // Site types
  copyFile('data/site-types/site-types.csv', 'webapp/dist/data/site-types/site-types.csv');
  
  // Ceramic types
  copyFile('data/ceramic-types/Datable.Ceramics.database.2025.xlsx', 'webapp/dist/data/ceramic-types/Datable.Ceramics.database.2025.xlsx');
  copyFile('data/ceramic-types/Specific.ceramics.all.sites.2025.xlsx', 'webapp/dist/data/ceramic-types/Specific.ceramics.all.sites.2025.xlsx');
  
  // Create index.html
  createIndexHtml();
  
  console.log('Build completed successfully');
}

// Execute build
build();