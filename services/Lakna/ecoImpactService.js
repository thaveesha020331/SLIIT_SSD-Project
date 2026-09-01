import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Eco-Impact Score Service
 * Integrates with third-party environmental APIs to calculate carbon footprint
 * and sustainability metrics
 */

// Category to carbon emission mapping (baseline estimates in kg CO2e)
const CATEGORY_CARBON_BASELINE = {
  Reusable: 0.5,
  Organic: 0.3,
  Handmade: 0.8,
  Biodegradable: 0.4,
  Sustainable: 0.2,
  Ecofriendly: 0.25,
};

// Certification impact multipliers
const CERTIFICATION_MULTIPLIER = {
  'FSC': 0.85,
  'USDA Organic': 0.8,
  'Fair Trade': 0.9,
  'Carbon Neutral': 0.5,
  'B Corp': 0.88,
  'Cradle to Cradle': 0.75,
  'EU Ecolabel': 0.82,
  'Green Seal': 0.87,
};

/**
 * Calculate eco-impact score using third-party API
 * Third-Party API: Carbon Intensity API - https://carbonintensity.org/
 * Falls back to local calculation if API is unavailable
 *
 * @param {Object} productData - Product information
 * @param {string} productData.category - Product category
 * @param {string} productData.title - Product title
 * @param {string} productData.eco_certification - Eco-certification type
 * @returns {Object} Eco-impact scores
 */
export const calculateEcoImpact = async (productData) => {
  try {
    const { category, title, eco_certification } = productData;

    // Get carbon baseline for category
    const baseCarbonFootprint = CATEGORY_CARBON_BASELINE[category] || 0.5;

    // Apply certification multiplier
    const certMultiplier = CERTIFICATION_MULTIPLIER[eco_certification] || 1.0;
    let carbonFootprint = baseCarbonFootprint * certMultiplier;

    // Try to fetch real carbon intensity data from third-party API
    let realWorldCarbonData = null;
    if (!isTestEnv) {
      try {
        realWorldCarbonData = await fetchCarbonIntensityData();
        if (realWorldCarbonData) {
          // Adjust carbon footprint based on real data
          carbonFootprint = baseCarbonFootprint * (realWorldCarbonData.intensity / 100) * certMultiplier;
        }
      } catch (apiError) {
        console.warn('Third-party API unavailable, using baseline calculation:', apiError.message);
        // Continue with baseline calculations
      }
    }

    // Calculate sustainability rating (0-100)
    const sustainabilityRating = calculateSustainabilityRating(
      eco_certification,
      category
    );

    // Estimate water usage based on category (liters)
    const waterUsage = estimateWaterUsage(category);

    // Calculate recyclability score
    const recyclabilityScore = calculateRecyclabilityScore(
      category,
      eco_certification
    );

    return {
      carbonFootprint: parseFloat(carbonFootprint.toFixed(2)),
      sustainabilityRating,
      waterUsage: parseFloat(waterUsage.toFixed(2)),
      recyclabilityScore,
    };
  } catch (error) {
    console.error('Error calculating eco-impact:', error);
    // Return default safe values
    return {
      carbonFootprint: 0.5,
      sustainabilityRating: 50,
      waterUsage: 100,
      recyclabilityScore: 50,
    };
  }
};

/**
 * Fetch real carbon intensity data from third-party API
 * Using Carbon Intensity API: https://api.carbonintensity.org/
 */
async function fetchCarbonIntensityData() {
  try {
    const response = await axios.get('https://api.carbonintensity.org/intensity', {
      timeout: 5000, // 5 second timeout
    });

    if (response.data && response.data.data) {
      const { intensity } = response.data.data;
      return { intensity: intensity.actual };
    }

    return null;
  } catch (error) {
    console.warn('Carbon Intensity API error:', error.message);
    throw error;
  }
}

/**
 * Calculate sustainability rating based on certification and category
 * @param {string} certification - Eco-certification type
 * @param {string} category - Product category
 * @returns {number} Rating 0-100
 */
function calculateSustainabilityRating(certification, category) {
  let rating = 50; // Base rating

  // Add points for certification
  const certPoints = {
    'FSC': 15,
    'USDA Organic': 20,
    'Fair Trade': 18,
    'Carbon Neutral': 25,
    'B Corp': 16,
    'Cradle to Cradle': 22,
    'EU Ecolabel': 17,
    'Green Seal': 16,
  };

  rating += certPoints[certification] || 10;

  // Add points for category
  const categoryPoints = {
    Reusable: 15,
    Organic: 18,
    Handmade: 10,
    Biodegradable: 12,
    Sustainable: 16,
    Ecofriendly: 14,
  };

  rating += categoryPoints[category] || 5;

  // Cap at 100
  return Math.min(rating, 100);
}

/**
 * Estimate water usage based on product category
 * @param {string} category - Product category
 * @returns {number} Estimated water usage in liters
 */
function estimateWaterUsage(category) {
  const waterUsageMap = {
    Reusable: 50,
    Organic: 200,
    Handmade: 100,
    Biodegradable: 75,
    Sustainable: 80,
    Ecofriendly: 60,
  };

  return waterUsageMap[category] || 100;
}

/**
 * Calculate recyclability score
 * @param {string} category - Product category
 * @param {string} certification - Eco-certification
 * @returns {number} Recyclability score 0-100
 */
function calculateRecyclabilityScore(category, certification) {
  let score = 0;

  // Base scores by category
  const categoryScores = {
    Reusable: 95,
    Organic: 85,
    Handmade: 60,
    Biodegradable: 90,
    Sustainable: 80,
    Ecofriendly: 75,
  };

  score = categoryScores[category] || 50;

  // Bonus for Cradle to Cradle certification
  if (certification === 'Cradle to Cradle') {
    score = Math.min(score + 10, 100);
  }

  return score;
}

/**
 * Get eco-certification requirements description
 * @param {string} certification - Certification type
 * @returns {Object} Certification details
 */
export const getCertificationInfo = (certification) => {
  const certificationInfo = {
    'FSC': {
      name: 'Forest Stewardship Council',
      description: 'Ensures sustainable forest management',
      website: 'https://www.fsc.org',
    },
    'USDA Organic': {
      name: 'USDA Organic',
      description: 'Certified organic production with no synthetic inputs',
      website: 'https://www.usda.gov/organic',
    },
    'Fair Trade': {
      name: 'Fair Trade Certified',
      description: 'Ensures fair wages and ethical trading',
      website: 'https://www.fairtradecertified.org',
    },
    'Carbon Neutral': {
      name: 'Carbon Neutral Certified',
      description: 'Net zero carbon emissions',
      website: 'https://www.carbonneutralnow.com',
    },
    'B Corp': {
      name: 'B Corporation Certified',
      description: 'Certified to meet rigorous social and environmental standards',
      website: 'https://bcorporation.net',
    },
    'Cradle to Cradle': {
      name: 'Cradle to Cradle Certified',
      description: 'Designed for material reutilization',
      website: 'https://www.c2ccertified.org',
    },
    'EU Ecolabel': {
      name: 'EU Ecolabel',
      description: 'European environmental excellence award',
      website: 'https://ec.europa.eu/environment/ecolabel',
    },
    'Green Seal': {
      name: 'Green Seal Certified',
      description: 'Third-party certified for environmental performance',
      website: 'https://www.greenseal.org',
    },
  };

  return certificationInfo[certification] || null;
};
