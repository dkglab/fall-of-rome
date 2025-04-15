n// build.js
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'webapp', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}


const dataDirs = [
  path.join(distDir, 'data', 'located-sites'),
  path.join(distDir, 'data', 'site-types'),
  path.join(distDir, 'data', 'roman-provinces'),
  path.join(distDir, 'data', 'ceramics')
];

dataDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 复制数据文件 - 调整为从根目录的data文件夹读取
function copyDataFiles() {
  // 复制位置数据文件
  const locatedSitesFiles = [
    'locatedsites.csv',
    'locatedsitesTS_any.csv',
  ];
  
  locatedSitesFiles.forEach(file => {
    const sourcePath = path.join(__dirname, 'data', 'located-sites', file);
    const destPath = path.join(distDir, 'data', 'located-sites', file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to dist/data/located-sites/`);
    } else {
      console.warn(`Warning: ${sourcePath} does not exist`);
    }
  });
  
  // 复制遗址类型数据
  const siteTypeFile = path.join(__dirname, 'data', 'site-types', 'site-types.csv');
  const siteTypeDestPath = path.join(distDir, 'data', 'site-types', 'site-types.csv');
  if (fs.existsSync(siteTypeFile)) {
    fs.copyFileSync(siteTypeFile, siteTypeDestPath);
    console.log('Copied site-types.csv to dist/data/site-types/');
  } else {
    console.warn(`Warning: ${siteTypeFile} does not exist`);
  }
  
  // 复制罗马省份数据
  const provincesFile = path.join(__dirname, 'data', 'roman-provinces', 'Spain Late Antique Provinces.geojson');
  const provincesDestPath = path.join(distDir, 'data', 'roman-provinces', 'Spain Late Antique Provinces.geojson');
  if (fs.existsSync(provincesFile)) {
    fs.copyFileSync(provincesFile, provincesDestPath);
    console.log('Copied Spain Late Antique Provinces.geojson to dist/data/roman-provinces/');
  } else {
    console.warn(`Warning: ${provincesFile} does not exist`);
  }
  
  // 复制陶瓷数据库文件
  const ceramicsFiles = [
    'Datable.Ceramics.database.2025.xlsx',
    'Specific.ceramics.all.sites.2025.xlsx'
  ];
  
  ceramicsFiles.forEach(file => {
    const sourcePath = path.join(__dirname, 'data', 'ceramics', file);
    const destPath = path.join(distDir, 'data', 'ceramics', file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to dist/data/ceramics/`);
    } else {
      console.warn(`Warning: ${sourcePath} does not exist`);
    }
  });
}

// 创建HTML文件
function createHtmlFile() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>伊比利亚半岛陶瓷分布时间序列可视化</title>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.2.0/dist/maplibre-gl.css">
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: Arial, sans-serif;
    }
    
    ceramic-explorer {
      display: block;
      height: 100vh;
      width: 100%;
    }
  </style>
</head>
<body>
  <ceramic-explorer></ceramic-explorer>
  <script src="index.js"></script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
  console.log('Created index.html');
}

// 执行构建步骤
copyDataFiles();
createHtmlFile();
console.log('Build completed successfully');