/**
 * Product Validators
 * Validates product input data according to business rules
 */

/**
 * Validate product input data
 * @param {Object} data - Product data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with errors array
 */
export const validateProductInput = (data, isUpdate = false) => {
  const errors = {};
  let isValid = true;

  // Title validation
  if (!isUpdate || data.title !== undefined) {
    if (!data.title) {
      errors.title = 'Title is required';
      isValid = false;
    } else if (typeof data.title !== 'string') {
      errors.title = 'Title must be a string';
      isValid = false;
    } else if (data.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
      isValid = false;
    } else if (data.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
      isValid = false;
    }
  }

  // Description validation
  if (!isUpdate || data.description !== undefined) {
    if (!data.description) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
      isValid = false;
    } else if (data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
      isValid = false;
    } else if (data.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
      isValid = false;
    }
  }

  // Price validation
  if (!isUpdate || data.price !== undefined) {
    if (data.price === undefined) {
      errors.price = 'Price is required';
      isValid = false;
    } else if (typeof data.price !== 'number' && typeof data.price !== 'string') {
      errors.price = 'Price must be a number';
      isValid = false;
    } else {
      const price = parseFloat(data.price);
      if (isNaN(price)) {
        errors.price = 'Price must be a valid number';
        isValid = false;
      } else if (price <= 0) {
        errors.price = 'Price must be greater than 0';
        isValid = false;
      }
    }
  }

  // Stock validation
  if (!isUpdate || data.stock !== undefined) {
    if (data.stock === undefined) {
      errors.stock = 'Stock is required';
      isValid = false;
    } else if (typeof data.stock !== 'number' && typeof data.stock !== 'string') {
      errors.stock = 'Stock must be a number';
      isValid = false;
    } else {
      const stock = parseInt(data.stock);
      if (isNaN(stock)) {
        errors.stock = 'Stock must be a valid number';
        isValid = false;
      } else if (stock < 0) {
        errors.stock = 'Stock cannot be negative';
        isValid = false;
      }
    }
  }

  // Category validation
  if (!isUpdate || data.category !== undefined) {
    const validCategories = ['Reusable', 'Organic', 'Handmade', 'Biodegradable', 'Sustainable', 'Ecofriendly'];
    
    if (!data.category) {
      errors.category = 'Category is required';
      isValid = false;
    } else if (!validCategories.includes(data.category)) {
      errors.category = `Category must be one of: ${validCategories.join(', ')}`;
      isValid = false;
    }
  }

  // Product category validation
  if (!isUpdate || data.productCategory !== undefined) {
    const validProductCategories = ['Kitchen', 'Personal Care', 'Bags & School Items', 'Home & Living', 'Gifts'];

    if (!data.productCategory) {
      errors.productCategory = 'Product category is required';
      isValid = false;
    } else if (!validProductCategories.includes(data.productCategory)) {
      errors.productCategory = `Product category must be one of: ${validProductCategories.join(', ')}`;
      isValid = false;
    }
  }

  // Eco-certification validation
  if (!isUpdate || data.ecocertification !== undefined) {
    const validCertifications = [
      'FSC',
      'USDA Organic',
      'Fair Trade',
      'Carbon Neutral',
      'B Corp',
      'Cradle to Cradle',
      'EU Ecolabel',
      'Green Seal',
    ];

    if (!data.ecocertification) {
      errors.ecocertification = 'Eco-certification is required';
      isValid = false;
    } else if (!validCertifications.includes(data.ecocertification)) {
      errors.ecocertification = `Eco-certification must be one of: ${validCertifications.join(', ')}`;
      isValid = false;
    }
  }

  // Image validation
  if (!isUpdate || data.image !== undefined) {
    if (!data.image && !isUpdate) {
      errors.image = 'Product image is required';
      isValid = false;
    } else if (data.image && typeof data.image !== 'string') {
      errors.image = 'Image must be a string (URL)';
      isValid = false;
    }
  }

  return { errors, isValid };
};

/**
 * Validate product price
 * @param {number} price - Price to validate
 * @returns {Object} Validation result
 */
export const validatePrice = (price) => {
  const errors = [];

  if (typeof price !== 'number') {
    errors.push('Price must be a number');
  }

  if (price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!Number.isFinite(price)) {
    errors.push('Price must be a finite number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate product stock
 * @param {number} stock - Stock quantity to validate
 * @returns {Object} Validation result
 */
export const validateStock = (stock) => {
  const errors = [];

  if (typeof stock !== 'number') {
    errors.push('Stock must be a number');
  }

  if (stock < 0) {
    errors.push('Stock cannot be negative');
  }

  if (!Number.isInteger(stock)) {
    errors.push('Stock must be an integer');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate eco-certification
 * @param {string} certification - Certification to validate
 * @returns {Object} Validation result
 */
export const validateEcoCertification = (certification) => {
  const validCertifications = [
    'FSC',
    'USDA Organic',
    'Fair Trade',
    'Carbon Neutral',
    'B Corp',
    'Cradle to Cradle',
    'EU Ecolabel',
    'Green Seal',
  ];

  const isValid = validCertifications.includes(certification);

  return {
    isValid,
    errors: isValid ? [] : [`Certification must be one of: ${validCertifications.join(', ')}`],
  };
};

/**
 * Validate product category
 * @param {string} category - Category to validate
 * @returns {Object} Validation result
 */
export const validateCategory = (category) => {
  const validCategories = [
    'Reusable',
    'Organic',
    'Handmade',
    'Biodegradable',
    'Sustainable',
    'Ecofriendly',
  ];

  const isValid = validCategories.includes(category);

  return {
    isValid,
    errors: isValid ? [] : [`Category must be one of: ${validCategories.join(', ')}`],
  };
};

/**
 * Validate review data
 * @param {Object} reviewData - Review data to validate
 * @returns {Object} Validation result
 */
export const validateReview = (reviewData) => {
  const errors = {};
  let isValid = true;

  // Rating validation
  if (reviewData.rating === undefined) {
    errors.rating = 'Rating is required';
    isValid = false;
  } else if (
    typeof reviewData.rating !== 'number' ||
    reviewData.rating < 1 ||
    reviewData.rating > 5 ||
    !Number.isInteger(reviewData.rating)
  ) {
    errors.rating = 'Rating must be an integer between 1 and 5';
    isValid = false;
  }

  // Comment validation (optional but validate if provided)
  if (reviewData.comment !== undefined && reviewData.comment) {
    if (typeof reviewData.comment !== 'string') {
      errors.comment = 'Comment must be a string';
      isValid = false;
    } else if (reviewData.comment.trim().length > 500) {
      errors.comment = 'Comment cannot exceed 500 characters';
      isValid = false;
    }
  }

  return { errors, isValid };
};
