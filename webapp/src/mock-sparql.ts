// mock-sparql.ts
console.log("Mock SPARQL module loading...");

// Global fetch interception
const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  // Check if it's a SPARQL request
  if (typeof input === 'string' && input.includes('/api/sparql')) {
    console.log('Intercepting SPARQL request:', input);
    
    try {
      // Parse the request to determine what data is needed
      const body = init?.body?.toString() || '';
      console.log('Request body:', body);
      
      // Determine what data to return based on the query content
      if (body.includes('ArchaeologicalSite') || body.includes('site') || !body) {
        console.log('Request for site data detected');
        return handleSiteDataRequest();
      } else if (body.includes('Province') || body.includes('province')) {
        console.log('Request for province data detected');
        return handleProvinceDataRequest();
      } else if (body.includes('SiteType') || body.includes('siteType')) {
        console.log('Request for site type data detected');
        return handleSiteTypeDataRequest();
      } else {
        // Default to site data
        console.log('Unknown request type, defaulting to site data');
        return handleSiteDataRequest();
      }
    } catch (error) {
      console.error('Error processing SPARQL request:', error);
      // Return empty result on error
      return new Response(JSON.stringify({
        results: { bindings: [] }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Use original fetch for other requests
  return originalFetch(input, init);
};

// Handle requests for site data
async function handleSiteDataRequest() {
  console.log('Loading site data from CSV...');
  try {
    // Try to load the CSV file
    const response = await originalFetch('/data/located-sites/located-sites.csv');
    
    if (!response.ok) {
      console.error('Failed to load site CSV:', response.status, response.statusText);
      console.log('Trying alternative CSV path...');
      
      // Try alternative path
      const altResponse = await originalFetch('/data/located-sites/located-sites-TS_any.csv');
      
      if (!altResponse.ok) {
        console.error('Failed to load alternative site CSV:', altResponse.status, altResponse.statusText);
        throw new Error('Could not load site data from any source');
      }
      
      return processSiteCSV(await altResponse.text());
    }
    
    const csvText = await response.text();
    console.log('Site CSV loaded, length:', csvText.length, 'bytes');
    return processSiteCSV(csvText);
  } catch (error) {
    console.error('Error loading site data:', error);
    // Fall back to generating mock data
    return new Response(JSON.stringify({
      results: { bindings: generateMockSiteData() }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Process site CSV data and convert to SPARQL result format
function processSiteCSV(csvText: string) {
  console.log('Processing site CSV data...');
  const lines = csvText.split('\n');
  if (lines.length <= 1) {
    console.error('CSV data has too few lines:', lines.length);
    return new Response(JSON.stringify({
      results: { bindings: generateMockSiteData() }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  console.log('CSV headers:', headers);
  
  // Find important column indices
  const idIndex = headers.indexOf('HLLG #') >= 0 ? headers.indexOf('HLLG #') : headers.indexOf('id');
  const nameIndex = headers.indexOf('Site Name') >= 0 ? headers.indexOf('Site Name') : headers.indexOf('name');
  const latIndex = headers.indexOf('Latitude') >= 0 ? headers.indexOf('Latitude') : headers.indexOf('lat');
  const longIndex = headers.indexOf('Longitude') >= 0 ? headers.indexOf('Longitude') : headers.indexOf('long');
  const siteTypeIndex = headers.indexOf('Site type') >= 0 ? headers.indexOf('Site type') : headers.indexOf('siteType');
  
  // 确保在header中查找region和provincia
  const regionIndex = headers.indexOf('Region') >= 0 ? headers.indexOf('Region') : headers.indexOf('region');
  const provinciaIndex = headers.indexOf('Provincia') >= 0 ? headers.indexOf('Provincia') : headers.indexOf('provincia');
  
  console.log('Column indices:', { idIndex, nameIndex, latIndex, longIndex, siteTypeIndex, regionIndex, provinciaIndex });
  
  if (idIndex === -1 || nameIndex === -1 || latIndex === -1 || longIndex === -1) {
    console.error('Missing required columns in CSV');
    return new Response(JSON.stringify({
      results: { bindings: generateMockSiteData() }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const bindings = [];
  
  // Process each CSV line starting from line 1 (skipping header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    if (values.length < Math.max(idIndex, nameIndex, latIndex, longIndex) + 1) {
      console.warn(`Line ${i} has too few columns:`, values.length);
      continue;
    }
    
    // Extract basic site data
    const id = values[idIndex];
    const name = values[nameIndex];
    const latitude = values[latIndex];
    const longitude = values[longIndex];
    
    if (!id || !name || !latitude || !longitude) {
      console.warn(`Line ${i} has missing required data`);
      continue;
    }
    
    // Validate coordinates - filter out points outside Iberia
    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    
    // Iberian Peninsula range - filter out clearly wrong coordinates
    const validLongRange = [-10, 5];
    const validLatRange = [36, 44];
    
    if (isNaN(lat) || isNaN(long) || 
        lat < validLatRange[0] || lat > validLatRange[1] || 
        long < validLongRange[0] || long > validLongRange[1]) {
      console.warn(`Line ${i} has coordinates outside of Iberia: [${long}, ${lat}]`);
      continue;
    }
    
    // Create a binding object for this site
    const binding: any = {
      id: { type: 'literal', value: id },
      name: { type: 'literal', value: name },
      latitude: { type: 'literal', value: latitude },
      longitude: { type: 'literal', value: longitude }
    };
    
    // Extract and normalize site type
    let siteType = "Unknown";
    if (siteTypeIndex !== -1 && siteTypeIndex < values.length) {
      siteType = values[siteTypeIndex].trim();
      // Normalize site type to match predefined types
      if (siteType.toLowerCase().includes('villa')) siteType = "Villa";
      else if (siteType.toLowerCase().includes('urban')) siteType = "Urban";
      else if (siteType.toLowerCase().includes('rural')) siteType = "Rural";
      else if (siteType.toLowerCase().includes('settlement')) siteType = "Settlement";
      else if (siteType.toLowerCase().includes('necropolis')) siteType = "Necropolis";
      else if (siteType.toLowerCase().includes('fort') && !siteType.toLowerCase().includes('hill')) siteType = "Fort";
      else if (siteType.toLowerCase().includes('hillfort')) siteType = "Hillfort";
      else if (siteType.toLowerCase().includes('industr')) siteType = "Industrial";
      else if (siteType.toLowerCase().includes('port')) siteType = "Port";
      else if (siteType.toLowerCase().includes('relig')) siteType = "Religious";
    }
    binding.siteType = { type: 'literal', value: siteType };
    
    // 确保每个binding都有region和provincia属性
    if (regionIndex !== -1 && regionIndex < values.length) {
      binding.region = { type: 'literal', value: values[regionIndex].trim() || "Unknown Region" };
    } else {
      // 如果CSV中没有区域数据，则使用随机值
      const regions = ["Lusitania", "Baetica", "Tarraconensis"];
      binding.region = { type: 'literal', value: regions[Math.floor(Math.random() * regions.length)] };
    }
    
    if (provinciaIndex !== -1 && provinciaIndex < values.length) {
      binding.provincia = { type: 'literal', value: values[provinciaIndex].trim() || "Unknown Provincia" };
    } else {
      // 如果CSV中没有省份数据，则使用随机值
      const provincias = ["Gallecia", "Carthaginensis", "Baleares", "Hispania Ulterior", "Hispania Citerior"];
      binding.provincia = { type: 'literal', value: provincias[Math.floor(Math.random() * provincias.length)] };
    }
    
    // Add other available columns to the binding
    headers.forEach((header, index) => {
      if (index !== idIndex && index !== nameIndex && 
          index !== latIndex && index !== longIndex &&
          index !== siteTypeIndex && index !== regionIndex && index !== provinciaIndex &&
          index < values.length && values[index]) {
        // Process ceramic presence data (1/0)
        if (['TSH', 'TSHT', 'TSHTB', 'TSHTM', 'TSG', 'DSP', 
             'ARSA', 'ARSC', 'ARSD', 'LRC', 'LRD', 'PRCW',
             'TS_any', 'TS_early', 'TS_late', 'ARS_325', 'ARS_400',
             'ARS_450', 'ARS_525', 'ARS_600'].includes(header)) {
          binding[header] = { type: 'literal', value: values[index] };
        } else {
          binding[header.replace(/\s+/g, '_')] = { type: 'literal', value: values[index] };
        }
      }
    });
    
    // Add period data
    const periods: string[] = [];
    
    // Check if there's specific period data to extract
    if (binding['TS_early'] && binding['TS_early'].value === '1') periods.push('early-roman');
    if (binding['TS_late'] && binding['TS_late'].value === '1') periods.push('late-roman');
    if ((binding['ARS_450'] && binding['ARS_450'].value === '1') || 
        (binding['ARS_525'] && binding['ARS_525'].value === '1') || 
        (binding['ARS_600'] && binding['ARS_600'].value === '1')) {
      periods.push('post-roman');
    }
    
    // If no period specified but has TS_any, add to early-roman
    if (periods.length === 0 && binding['TS_any'] && binding['TS_any'].value === '1') {
      periods.push('early-roman');
    }
    
    // Default to early-roman if still no periods
    if (periods.length === 0) {
      periods.push('early-roman');
    }
    
    // Add periods as a JSON string to maintain array format
    binding.periods = { type: 'literal', value: JSON.stringify(periods) };
    
    bindings.push(binding);
  }
  
  console.log(`Processed ${bindings.length} valid sites from CSV`);
  
  // If no valid sites were found, fall back to mock data
  if (bindings.length === 0) {
    console.warn('No valid sites found in CSV, using mock data');
    return new Response(JSON.stringify({
      results: { bindings: generateMockSiteData() }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    results: { bindings }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle requests for province data
async function handleProvinceDataRequest() {
  console.log('Loading province data from GeoJSON...');
  try {
    // Try to load the GeoJSON file
    const response = await originalFetch('/data/roman-provinces/Spain-Late-Antique-Provinces.geojson');
    
    if (!response.ok) {
      console.error('Failed to load province GeoJSON:', response.status, response.statusText);
      throw new Error('Could not load province data');
    }
    
    const geojson = await response.json();
    console.log('Province GeoJSON loaded, features:', geojson.features?.length);
    
    if (!geojson.features || !Array.isArray(geojson.features) || geojson.features.length === 0) {
      throw new Error('Invalid GeoJSON format or no features found');
    }
    
    const bindings = geojson.features.map((feature: any, index: number) => ({
      id: { type: 'literal', value: feature.properties?.id || `province-${index}` },
      name: { type: 'literal', value: feature.properties?.name || `Province ${index + 1}` },
      geojson: { type: 'literal', value: JSON.stringify(feature) }
    }));
    
    console.log(`Processed ${bindings.length} provinces from GeoJSON`);
    
    return new Response(JSON.stringify({
      results: { bindings }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error loading province data:', error);
    // Fall back to generating mock data
    return new Response(JSON.stringify({
      results: { bindings: generateMockProvinceData() }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle requests for site type data
async function handleSiteTypeDataRequest() {
  console.log('Loading site type data from CSV...');
  try {
    // Try to load the CSV file
    const response = await originalFetch('/data/site-types/site-types.csv');
    
    if (!response.ok) {
      console.error('Failed to load site types CSV:', response.status, response.statusText);
      throw new Error('Could not load site type data');
    }
    
    const csvText = await response.text();
    console.log('Site types CSV loaded, length:', csvText.length, 'bytes');
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const idIndex = headers.indexOf('ID');
    const nameIndex = headers.indexOf('Site_Type');
    const labelIndex = headers.indexOf('prefLabel');
    
    if (idIndex === -1 || nameIndex === -1) {
      throw new Error('Missing required columns in site types CSV');
    }
    
    const bindings = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      if (values.length < Math.max(idIndex, nameIndex) + 1) continue;
      
      const id = values[idIndex];
      const name = values[nameIndex];
      const label = labelIndex >= 0 && labelIndex < values.length ? values[labelIndex] : name;
      
      bindings.push({
        id: { type: 'literal', value: id },
        name: { type: 'literal', value: name },
        label: { type: 'literal', value: label }
      });
    }
    
    console.log(`Processed ${bindings.length} site types from CSV`);
    
    if (bindings.length === 0) {
      throw new Error('No valid site types found in CSV');
    }
    
    return new Response(JSON.stringify({
      results: { bindings }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error loading site type data:', error);
    // Fall back to generating mock data
    return new Response(JSON.stringify({
      results: { bindings: generateMockSiteTypeData() }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Generate mock site data as fallback
function generateMockSiteData() {
  console.log('Generating mock site data...');
  const regions = ["Lusitania", "Baetica", "Tarraconensis"];
  const provincias = ["Gallecia", "Carthaginensis", "Baleares", "Hispania Ulterior", "Hispania Citerior"];
  const siteTypes = ["Villa", "Urban", "Rural", "Settlement", "Necropolis", "Fort", "Hillfort", "Industrial", "Port", "Religious"];
  const bindings = [];
  
  // Create 50 random sites
  for (let i = 0; i < 50; i++) {
    // Random location in Iberian Peninsula
    const longitude = -9 + Math.random() * 10; // -9 to 1
    const latitude = 36 + Math.random() * 8;   // 36 to 44
    
    // Select site type
    const siteType = siteTypes[Math.floor(Math.random() * siteTypes.length)];
    
    // 确保每个站点都有region和provincia属性
    const region = regions[Math.floor(Math.random() * regions.length)];
    const provincia = provincias[Math.floor(Math.random() * provincias.length)];
    
    const binding: any = {
      id: { type: 'literal', value: `MOCK-${i+1}` },
      name: { type: 'literal', value: `Archaeological Site ${i+1}` },
      latitude: { type: 'literal', value: latitude.toString() },
      longitude: { type: 'literal', value: longitude.toString() },
      region: { type: 'literal', value: region },
      provincia: { type: 'literal', value: provincia },
      siteType: { type: 'literal', value: siteType },
      // Also add analysisType to ensure filters work properly
      analysisType: { type: 'literal', value: siteType }
    };
    
    // Random ceramic types
    ['TSH', 'TSHT', 'TSHTB', 'TSHTM', 'TSG', 'DSP', 
     'ARSA', 'ARSC', 'ARSD', 'LRC', 'LRD', 'PRCW',
     'TS_any', 'TS_early', 'TS_late'].forEach(type => {
      binding[type] = { type: 'literal', value: Math.random() > 0.7 ? '1' : '0' };
    });
    
    // Ensure at least one ceramic type
    if (Object.keys(binding).every(key => 
      !['TSH', 'TSHT', 'TSHTB', 'TSHTM', 'TSG', 'DSP', 
        'ARSA', 'ARSC', 'ARSD', 'LRC', 'LRD', 'PRCW'].includes(key) || 
      binding[key].value === '0')
    ) {
      binding['TSH'] = { type: 'literal', value: '1' };
      binding['TS_any'] = { type: 'literal', value: '1' };
    }
    
    // Determine periods
    const periods: string[] = [];
    if (binding['TS_early'] && binding['TS_early'].value === '1') periods.push('early-roman');
    if (binding['TS_late'] && binding['TS_late'].value === '1') periods.push('late-roman');
    
    // Add post-roman period randomly
    if (Math.random() > 0.7) periods.push('post-roman');
    
    // If no period specified but has TS_any, add to early-roman
    if (periods.length === 0) periods.push('early-roman');
    
    binding.periods = { type: 'literal', value: JSON.stringify(periods) };
    
    bindings.push(binding);
  }
  
  console.log(`Generated ${bindings.length} mock sites with regions and provincias`);
  return bindings;
}

// Generate mock province data as fallback
function generateMockProvinceData() {
  console.log('Generating mock province data...');
  
  return [
    {
      id: { type: 'literal', value: 'lusitania' },
      name: { type: 'literal', value: 'Lusitania' },
      geojson: { type: 'literal', value: JSON.stringify({
        type: "Feature",
        properties: { id: "lusitania", name: "Lusitania" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-9, 37], [-7, 37], [-7, 41], [-9, 41], [-9, 37]
          ]]
        }
      })}
    },
    {
      id: { type: 'literal', value: 'baetica' },
      name: { type: 'literal', value: 'Baetica' },
      geojson: { type: 'literal', value: JSON.stringify({
        type: "Feature",
        properties: { id: "baetica", name: "Baetica" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-7, 36], [-3, 36], [-3, 39], [-7, 39], [-7, 36]
          ]]
        }
      })}
    },
    {
      id: { type: 'literal', value: 'tarraconensis' },
      name: { type: 'literal', value: 'Tarraconensis' },
      geojson: { type: 'literal', value: JSON.stringify({
        type: "Feature",
        properties: { id: "tarraconensis", name: "Tarraconensis" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-3, 36], [1, 36], [1, 44], [-7, 44], [-7, 39], [-3, 39], [-3, 36]
          ]]
        }
      })}
    }
  ];
}

// Generate mock site type data as fallback
function generateMockSiteTypeData() {
  console.log('Generating mock site type data...');
  
  return [
    { id: { type: 'literal', value: 'Villa' }, name: { type: 'literal', value: 'Villa' }, label: { type: 'literal', value: 'Villa' } },
    { id: { type: 'literal', value: 'Urban' }, name: { type: 'literal', value: 'Urban' }, label: { type: 'literal', value: 'Urban' } },
    { id: { type: 'literal', value: 'Rural' }, name: { type: 'literal', value: 'Rural' }, label: { type: 'literal', value: 'Rural' } },
    { id: { type: 'literal', value: 'Settlement' }, name: { type: 'literal', value: 'Settlement' }, label: { type: 'literal', value: 'Settlement' } },
    { id: { type: 'literal', value: 'Necropolis' }, name: { type: 'literal', value: 'Necropolis' }, label: { type: 'literal', value: 'Necropolis' } },
    { id: { type: 'literal', value: 'Fort' }, name: { type: 'literal', value: 'Fort' }, label: { type: 'literal', value: 'Fort' } },
    { id: { type: 'literal', value: 'Hillfort' }, name: { type: 'literal', value: 'Hillfort' }, label: { type: 'literal', value: 'Hillfort' } },
    { id: { type: 'literal', value: 'Industrial' }, name: { type: 'literal', value: 'Industrial' }, label: { type: 'literal', value: 'Industrial' } },
    { id: { type: 'literal', value: 'Port' }, name: { type: 'literal', value: 'Port' }, label: { type: 'literal', value: 'Port' } },
    { id: { type: 'literal', value: 'Religious' }, name: { type: 'literal', value: 'Religious' }, label: { type: 'literal', value: 'Religious' } }
  ];
}

// Export function to initialize the mock SPARQL interceptor
export function initMockSparql() {
  console.log('Mock SPARQL processor initialized');
  
  // Optionally pre-load CSV data cache
  setTimeout(() => {
    console.log('Pre-loading CSV data...');
    originalFetch('/data/located-sites/located-sites.csv')
      .then(r => r.text())
      .then(text => console.log('Pre-loaded site data, length:', text.length))
      .catch(e => console.warn('Failed to pre-load site data:', e));
  }, 1000);
}