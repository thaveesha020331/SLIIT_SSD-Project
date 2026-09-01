/**
 * Product Helper Utilities
 * Common utility functions for product management
 */

/**
 * Format product data for response
 * @param {Object} product - Product object
 * @returns {Object} Formatted product data
 */
export const formatProductResponse = (product) => {
  return {
    id: product._id,
    title: product.title,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    image: product.image,
    ecocertification: product.ecocertification,
    ecoImpactScore: {
      carbonFootprint: product.ecoImpactScore?.carbonFootprint || 0,
      sustainabilityRating: product.ecoImpactScore?.sustainabilityRating || 0,
      waterUsage: product.ecoImpactScore?.waterUsage || 0,
      recyclabilityScore: product.ecoImpactScore?.recyclabilityScore || 0,
    },
    manufacturerInfo: product.manufacturerInfo || {},
    reviewsCount: product.reviews?.length || 0,
    averageRating: calculateAverageRating(product.reviews),
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/**
 * Calculate average rating from reviews
 * @param {Array} reviews - Array of review objects
 * @returns {number} Average rating
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return parseFloat((total / reviews.length).toFixed(2));
};

/**
 * Get category label and description
 * @param {string} category - Category name
 * @returns {Object} Category info
 */
export const getCategoryInfo = (category) => {
  const categoryInfo = {
    Reusable: {
      label: 'Reusable',
      description: 'Products designed for long-term reuse',
      icon: 'repeat',
    },
    Organic: {
      label: 'Organic',
      description: 'Certified organic products without synthetic chemicals',
      icon: 'leaf',
    },
    Handmade: {
      label: 'Handmade',
      description: 'Artisan handcrafted products',
      icon: 'hand',
    },
    Biodegradable: {
      label: 'Biodegradable',
      description: 'Products that naturally decompose',
      icon: 'sprout',
    },
    Sustainable: {
      label: 'Sustainable',
      description: 'Produced using sustainable practices',
      icon: 'globe',
    },
    Ecofriendly: {
      label: 'Eco-friendly',
      description: 'Environmentally conscious products',
      icon: 'tree',
    },
  };

  return categoryInfo[category] || { label: category, description: '', icon: '' };
};

/**
 * Get all available categories
 * @returns {Array} List of categories
 */
export const getAllCategories = () => {
  return [
    'Reusable',
    'Organic',
    'Handmade',
    'Biodegradable',
    'Sustainable',
    'Ecofriendly',
  ];
};

/**
 * Get all available eco-certifications
 * @returns {Array} List of certifications
 */
export const getAllCertifications = () => {
  return [
    'FSC',
    'USDA Organic',
    'Fair Trade',
    'Carbon Neutral',
    'B Corp',
    'Cradle to Cradle',
    'EU Ecolabel',
    'Green Seal',
  ];
};

/**
 * Format price for display
 * @param {number} price - Price amount
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });

  return formatter.format(price);
};

/**
 * Check if product is in stock
 * @param {Object} product - Product object
 * @returns {boolean} In stock status
 */
export const isInStock = (product) => {
  return product.stock > 0;
};

/**
 * Get eco-impact badge color based on rating
 * @param {number} rating - Sustainability rating (0-100)
 * @returns {string} Color code or class name
 */
export const getEcoImpactColor = (rating) => {
  if (rating >= 80) return 'green'; // Excellent
  if (rating >= 60) return 'yellow'; // Good
  if (rating >= 40) return 'orange'; // Fair
  return 'red'; // Poor
};

/**
 * Get eco-impact level description
 * @param {number} rating - Sustainability rating (0-100)
 * @returns {string} Impact level description
 */
export const getEcoImpactLevel = (rating) => {
  if (rating >= 80) return 'Excellent';
  if (rating >= 60) return 'Good';
  if (rating >= 40) return 'Fair';
  return 'Needs Improvement';
};

/**
 * Sort products by eco-impact score
 * @param {Array} products - Array of product objects
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted products
 */
export const sortByEcoImpact = (products, order = 'desc') => {
  return products.sort((a, b) => {
    const scoreA = a.ecoImpactScore?.sustainabilityRating || 0;
    const scoreB = b.ecoImpactScore?.sustainabilityRating || 0;
    return order === 'desc' ? scoreB - scoreA : scoreA - scoreB;
  });
};

/**
 * Filter products by eco-impact threshold
 * @param {Array} products - Array of product objects
 * @param {number} minRating - Minimum sustainability rating
 * @returns {Array} Filtered products
 */
export const filterByEcoImpact = (products, minRating) => {
  return products.filter(
    (product) => (product.ecoImpactScore?.sustainabilityRating || 0) >= minRating
  );
};

/**
 * Get carbon footprint badge text
 * @param {number} carbonFootprint - Carbon footprint in kg CO2e
 * @returns {string} Badge text
 */
export const getCarbonFootprintBadge = (carbonFootprint) => {
  if (carbonFootprint <= 0.5) return 'Very Low Carbon Footprint';
  if (carbonFootprint <= 1) return 'Low Carbon Footprint';
  if (carbonFootprint <= 2) return 'Moderate Carbon Footprint';
  return 'High Carbon Footprint';
};
