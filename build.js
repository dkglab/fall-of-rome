const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure dist directory exists
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy SPARQL query files to dist directory
const queriesDir = path.join(__dirname, "queries");
const distQueriesDir = path.join(distDir, "queries");

if (!fs.existsSync(distQueriesDir)) {
  fs.mkdirSync(distQueriesDir, { recursive: true });
}

// Copy query files
if (fs.existsSync(queriesDir)) {
  fs.readdirSync(queriesDir).forEach(file => {
    if (file.endsWith('.rq')) {
      fs.copyFileSync(
        path.join(queriesDir, file),
        path.join(distQueriesDir, file)
      );
    }
  });
}

// Copy TTL data file
const dataSource = path.join(__dirname, "graph", "inferred.ttl");
const dataTarget = path.join(distDir, "data.ttl");
if (fs.existsSync(dataSource)) {
  fs.copyFileSync(dataSource, dataTarget);
  console.log(`Copied ${dataSource} to ${dataTarget}`);
} else {
  console.warn(`Warning: ${dataSource} does not exist`);
}

// Build webapp
try {
  console.log("Building web application...");
  execSync('cd webapp && npm run build', { stdio: 'inherit' });
  
  // Copy webapp build files to dist
  const webappBuildDir = path.join(__dirname, "webapp", "build");
  if (fs.existsSync(webappBuildDir)) {
    fs.readdirSync(webappBuildDir).forEach(file => {
      fs.copyFileSync(
        path.join(webappBuildDir, file),
        path.join(distDir, file)
      );
    });
    console.log("Copied webapp build files to dist");
  } else {
    console.warn("Warning: webapp build directory does not exist");
  }
} catch (error) {
  console.error("Error building webapp:", error);
}

// Create index.html if it doesn't exist
const indexFile = path.join(distDir, "index.html");
if (!fs.existsSync(indexFile)) {
  const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iberian Peninsula Ceramic Distribution</title>
  <link rel="stylesheet" href="maplibre-gl.css">
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
  <ceramic-explorer></ceramic-explorer>
  <script src="ceramic-explorer.js"></script>
</body>
</html>
  `;
  fs.writeFileSync(indexFile, indexContent);
  console.log("Created index.html");
}

console.log("Build completed successfully!");