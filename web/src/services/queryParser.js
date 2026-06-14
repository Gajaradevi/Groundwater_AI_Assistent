/**
 * Smart Query Parser Service (Phase 3)
 * Converts natural language queries into Spring Boot REST API call payloads
 */

const STATES = {
  'maharashtra': 'Maharashtra',
  'karnataka': 'Karnataka',
  'telangana': 'Telangana',
  'rajasthan': 'Rajasthan',
  'uttar pradesh': 'Uttar Pradesh', 
  'up': 'Uttar Pradesh',
  'gujarat': 'Gujarat',
  'bihar': 'Bihar',
  'tamil nadu': 'Tamil Nadu',
  'punjab': 'Punjab',
  'odisha': 'Odisha'
};

const DISTRICTS = {
  'pune': 'Pune',
  'nashik': 'Nashik', 
  'nasik': 'Nashik',
  'ahmednagar': 'Ahmednagar',
  'aurangabad': 'Aurangabad',
  'nagpur': 'Nagpur',
  'solapur': 'Solapur',
  'bengaluru': 'Bengaluru', 
  'bangalore': 'Bengaluru',
  'bengaluru urban': 'Bengaluru Urban',
  'mysore': 'Mysore', 
  'mysuru': 'Mysore',
  'belgaum': 'Belgaum', 
  'belagavi': 'Belgaum',
  'gulbarga': 'Gulbarga', 
  'kalaburagi': 'Gulbarga',
  'hyderabad': 'Hyderabad',
  'ranga reddy': 'Ranga Reddy', 
  'rangareddy': 'Ranga Reddy',
  'medak': 'Medak',
  'warangal': 'Warangal',
  'agra': 'Agra',
  'lucknow': 'Lucknow',
  'kanpur': 'Kanpur',
  'varanasi': 'Varanasi',
  'jaipur': 'Jaipur',
  'jodhpur': 'Jodhpur',
  'udaipur': 'Udaipur',
  'kolar': 'Kolar',
  'chennai': 'Chennai',
  'ahmedabad': 'Ahmedabad',
  'patna': 'Patna',
  'amritsar': 'Amritsar',
  'bhubaneswar': 'Bhubaneswar'
};

const CATEGORIES = {
  'safe': 'SAFE',
  'semi-critical': 'SEMI_CRITICAL',
  'semi critical': 'SEMI_CRITICAL',
  'critical': 'CRITICAL',
  'over-exploited': 'OVER_EXPLOITED',
  'over exploited': 'OVER_EXPLOITED'
};

export const parseQuery = (text) => {
  if (!text) return null;
  const normalized = text.toLowerCase().trim();

  // 0. Detect AI Compare Queries (checked first so it is not intercepted by single district rules)
  if (normalized.includes('compare') || normalized.includes('comparison')) {
    let year = 2023;
    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    // First, check for States Comparison
    const sortedStateKeys = Object.keys(STATES).sort((a, b) => b.length - a.length);
    const stateMatches = [];
    for (const key of sortedStateKeys) {
      const idx = normalized.indexOf(key);
      if (idx !== -1) {
        stateMatches.push({ index: idx, value: STATES[key], keyLength: key.length });
      }
    }
    stateMatches.sort((a, b) => a.index - b.index);

    const finalStates = [];
    let lastStateEnd = -1;
    for (const match of stateMatches) {
      if (match.index >= lastStateEnd) {
        finalStates.push(match.value);
        lastStateEnd = match.index + match.keyLength;
      }
    }

    if (finalStates.length >= 2) {
      return {
        type: 'ai-compare-states',
        params: {
          state1: finalStates[0],
          state2: finalStates[1],
          year
        }
      };
    }

    // Second, check for Districts Comparison
    const sortedDistrictKeys = Object.keys(DISTRICTS).sort((a, b) => b.length - a.length);
    const districtMatches = [];
    for (const key of sortedDistrictKeys) {
      const idx = normalized.indexOf(key);
      if (idx !== -1) {
        districtMatches.push({ index: idx, value: DISTRICTS[key], keyLength: key.length });
      }
    }
    districtMatches.sort((a, b) => a.index - b.index);
    
    const finalDistricts = [];
    let lastDistrictEnd = -1;
    for (const match of districtMatches) {
      if (match.index >= lastDistrictEnd) {
        finalDistricts.push(match.value);
        lastDistrictEnd = match.index + match.keyLength;
      }
    }

    if (finalDistricts.length >= 2) {
      return {
        type: 'ai-compare',
        params: {
          district1: finalDistricts[0],
          district2: finalDistricts[1],
          year
        }
      };
    }
  }

  // 0.5 Detect AI Conservation Recommendations Queries
  // Must be checked before stress queries to avoid misrouting "improve sustainability" etc.
  if (
    normalized.includes('recommend') ||
    normalized.includes('recommendation') ||
    normalized.includes('recommendations') ||
    normalized.includes('conservation') ||
    normalized.includes('sustainability') ||
    (normalized.includes('action') && normalized.includes('taken')) ||
    (normalized.includes('improve') && normalized.includes('groundwater')) ||
    (normalized.includes('what') && normalized.includes('should') && normalized.includes('done'))
  ) {
    let district = null;
    // Sort by key length descending so longer names match first (e.g. "bengaluru urban" before "bengaluru")
    const sortedKeys = Object.keys(DISTRICTS).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (normalized.includes(key)) {
        district = DISTRICTS[key];
        break;
      }
    }

    let year = 2023; // default year
    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    if (district) {
      return { type: 'ai-recommendations', params: { district, year } };
    }
  }

  // 1. Detect AI Stress Explanation Queries (checked first so it is not intercepted as a simple district-year query)
  const isAiAnalysisIntent =
    (normalized.includes('explain') && normalized.includes('stress')) ||
    (normalized.includes('stress') && normalized.includes('why')) ||
    normalized.includes('stress explanation') ||
    (normalized.includes('analyze') && normalized.includes('groundwater')) ||
    (normalized.includes('analyse') && normalized.includes('groundwater')) ||
    (normalized.includes('explain') && (normalized.includes('condition') || normalized.includes('groundwater'))) ||
    /why\s+is\s+/.test(normalized) ||
    (normalized.includes('what') && normalized.includes('groundwater') && normalized.includes('situation')) ||
    (normalized.includes('groundwater') && (normalized.includes('status') || normalized.includes('condition') || normalized.includes('situation')));

  if (isAiAnalysisIntent) {
    // Sort by key length descending so longer names match first (e.g. "bengaluru urban" before "bengaluru")
    const sortedKeys = Object.keys(DISTRICTS).sort((a, b) => b.length - a.length);
    let district = null;
    for (const key of sortedKeys) {
      if (normalized.includes(key)) {
        district = DISTRICTS[key];
        break;
      }
    }

    let year = 2023;
    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    if (district) {
      return { type: 'ai-explain-stress', params: { district, year } };
    }
  }

  // 2. Detect Critical Areas Queries
  const isCriticalAreasIntent =
    normalized.includes('critical area') ||
    normalized.includes('critical areas') ||
    normalized.includes('over-exploited areas') ||
    normalized.includes('over exploited areas') ||
    normalized.includes('critical district') ||
    normalized.includes('critical districts') ||
    normalized.includes('over-exploited district') ||
    normalized.includes('over-exploited districts') ||
    normalized.includes('over exploited district') ||
    normalized.includes('over exploited districts') ||
    normalized.includes('high risk groundwater') ||
    normalized.includes('groundwater stress areas') ||
    normalized.includes('stress areas') ||
    (normalized.includes('which') && normalized.includes('district') && normalized.includes('critical'));

  if (isCriticalAreasIntent) {
    // Extract State if specified, default to Maharashtra
    let state = 'Maharashtra';
    for (const [key, val] of Object.entries(STATES)) {
      if (normalized.includes(key)) {
        state = val;
        break;
      }
    }

    // Extract Year if specified, default to 2023
    let year = 2023;
    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    return { type: 'critical-areas', params: { state, year } };
  }

  // 2. Detect Trend/Historical Queries
  if (normalized.includes('trend') || normalized.includes('trends') || normalized.includes('historical') || normalized.includes('history')) {
    // Extract District, default to Pune
    let district = 'Pune';
    for (const [key, val] of Object.entries(DISTRICTS)) {
      if (normalized.includes(key)) {
        district = val;
        break;
      }
    }

    // Extract Year Range
    let startYear = 2020;
    let endYear = 2023;
    const yearMatches = normalized.match(/\b(20\d{2})\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const sorted = yearMatches.map(y => parseInt(y, 10)).sort();
      startYear = sorted[0];
      endYear = sorted[sorted.length - 1];
    } else if (yearMatches && yearMatches.length === 1) {
      endYear = parseInt(yearMatches[0], 10);
      startYear = endYear - 3;
    }

    return { type: 'trends', params: { district, startYear, endYear } };
  }

  // 3. Detect Category Queries
  for (const [key, val] of Object.entries(CATEGORIES)) {
    if (normalized.includes(key)) {
      // Ensure we don't accidentally intercept a "critical areas" request here
      if (key === 'critical' && (normalized.includes('area') || normalized.includes('areas'))) {
        continue;
      }
      return { type: 'category', params: { category: val } };
    }
  }

  // 4. Extract Assessment Year (2000-2099)
  let year = null;
  const yearMatch = normalized.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // 5. Detect District + Year or District only Queries
  for (const [key, val] of Object.entries(DISTRICTS)) {
    if (normalized.includes(key)) {
      if (year) {
        return { type: 'district-year', params: { district: val, year } };
      }
      return { type: 'district', params: { district: val } };
    }
  }

  // 6. Detect State Summary or State list Queries
  for (const [key, val] of Object.entries(STATES)) {
    if (normalized.includes(key)) {
      if (year) {
        return { type: 'state-year-summary', params: { state: val, year } };
      }
      return { type: 'state', params: { state: val } };
    }
  }

  // 7. Year-only Query fallback
  if (year) {
    return { type: 'year', params: { year } };
  }

  return null;
};
export default parseQuery;
