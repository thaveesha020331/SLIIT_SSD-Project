import {
  validateProductInput,
  validatePrice,
  validateStock,
  validateEcoCertification,
  validateCategory,
  validateReview,
} from '../../utils/Lakna/validators.js';

describe('Product Validators', () => {
  describe('validateProductInput', () => {
    test('should validate correct product input', () => {
      const validData = {
        title: 'Eco Bottle',
        description: 'A sustainable water bottle for daily use',
        price: 29.99,
        stock: 100,
        category: 'Reusable',
        productCategory: 'Kitchen',
        ecocertification: 'Carbon Neutral',
        image: 'https://example.com/image.jpg',
      };

      const { isValid, errors } = validateProductInput(validData);
      expect(isValid).toBe(true);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should reject product without required fields', () => {
      const invalidData = {
        title: 'Eco Bottle',
      };

      const { isValid, errors } = validateProductInput(invalidData);
      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('description');
      expect(errors).toHaveProperty('price');
      expect(errors).toHaveProperty('stock');
      expect(errors).toHaveProperty('category');
      expect(errors).toHaveProperty('productCategory');
      expect(errors).toHaveProperty('ecocertification');
    });

    test('should reject price <= 0', () => {
      const invalidData = {
        title: 'Eco Bottle',
        description: 'A sustainable water bottle',
        price: -10,
        stock: 100,
        category: 'Reusable',
        productCategory: 'Kitchen',
        ecocertification: 'Carbon Neutral',
      };

      const { isValid, errors } = validateProductInput(invalidData);
      expect(isValid).toBe(false);
      expect(errors.price).toContain('greater than 0');
    });

    test('should reject negative stock', () => {
      const invalidData = {
        title: 'Eco Bottle',
        description: 'A sustainable water bottle',
        price: 29.99,
        stock: -5,
        category: 'Reusable',
        productCategory: 'Kitchen',
        ecocertification: 'Carbon Neutral',
      };

      const { isValid, errors } = validateProductInput(invalidData);
      expect(isValid).toBe(false);
      expect(errors.stock).toContain('negative');
    });

    test('should reject invalid category', () => {
      const invalidData = {
        title: 'Eco Bottle',
        description: 'A sustainable water bottle',
        price: 29.99,
        stock: 100,
        category: 'InvalidCategory',
        productCategory: 'Kitchen',
        ecocertification: 'Carbon Neutral',
      };

      const { isValid, errors } = validateProductInput(invalidData);
      expect(isValid).toBe(false);
      expect(errors.category).toBeDefined();
    });

    test('should reject invalid eco-certification', () => {
      const invalidData = {
        title: 'Eco Bottle',
        description: 'A sustainable water bottle',
        price: 29.99,
        stock: 100,
        category: 'Reusable',
        productCategory: 'Kitchen',
        ecocertification: 'InvalidCert',
      };

      const { isValid, errors } = validateProductInput(invalidData);
      expect(isValid).toBe(false);
      expect(errors.ecocertification).toBeDefined();
    });

    test('should reject invalid product category', () => {
      const invalidData = {
        title: 'Eco Bottle',
        description: 'A sustainable water bottle',
        price: 29.99,
        stock: 100,
        category: 'Reusable',
        productCategory: 'InvalidCategory',
        ecocertification: 'Carbon Neutral',
      };

      const { isValid, errors } = validateProductInput(invalidData);
      expect(isValid).toBe(false);
      expect(errors.productCategory).toBeDefined();
    });

    test('should validate update with partial data', () => {
      const updateData = {
        price: 39.99,
      };

      const { isValid } = validateProductInput(updateData, true);
      expect(isValid).toBe(true);
    });
  });

  describe('validatePrice', () => {
    test('should accept positive price', () => {
      const { isValid, errors } = validatePrice(29.99);
      expect(isValid).toBe(true);
      expect(errors.length).toBe(0);
    });

    test('should reject zero price', () => {
      const { isValid, errors } = validatePrice(0);
      expect(isValid).toBe(false);
      expect(errors[0]).toContain('greater than 0');
    });

    test('should reject negative price', () => {
      const { isValid, errors } = validatePrice(-10);
      expect(isValid).toBe(false);
    });

    test('should reject non-numeric price', () => {
      const { isValid, errors } = validatePrice('abc');
      expect(isValid).toBe(false);
    });
  });

  describe('validateStock', () => {
    test('should accept zero stock', () => {
      const { isValid, errors } = validateStock(0);
      expect(isValid).toBe(true);
    });

    test('should accept positive stock', () => {
      const { isValid, errors } = validateStock(100);
      expect(isValid).toBe(true);
    });

    test('should reject negative stock', () => {
      const { isValid, errors } = validateStock(-5);
      expect(isValid).toBe(false);
    });

    test('should reject decimal stock', () => {
      const { isValid, errors } = validateStock(10.5);
      expect(isValid).toBe(false);
    });
  });

  describe('validateEcoCertification', () => {
    test('should accept valid certifications', () => {
      const validCerts = [
        'FSC',
        'USDA Organic',
        'Fair Trade',
        'Carbon Neutral',
        'B Corp',
        'Cradle to Cradle',
        'EU Ecolabel',
        'Green Seal',
      ];

      validCerts.forEach((cert) => {
        const { isValid } = validateEcoCertification(cert);
        expect(isValid).toBe(true);
      });
    });

    test('should reject invalid certification', () => {
      const { isValid, errors } = validateEcoCertification('InvalidCert');
      expect(isValid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCategory', () => {
    test('should accept valid categories', () => {
      const validCategories = [
        'Reusable',
        'Organic',
        'Handmade',
        'Biodegradable',
        'Sustainable',
        'Ecofriendly',
      ];

      validCategories.forEach((cat) => {
        const { isValid } = validateCategory(cat);
        expect(isValid).toBe(true);
      });
    });

    test('should reject invalid category', () => {
      const { isValid, errors } = validateCategory('InvalidCategory');
      expect(isValid).toBe(false);
    });
  });

  describe('validateReview', () => {
    test('should validate correct review', () => {
      const validReview = {
        rating: 5,
        comment: 'Great product!',
      };

      const { isValid, errors } = validateReview(validReview);
      expect(isValid).toBe(true);
    });

    test('should reject missing rating', () => {
      const invalidReview = {
        comment: 'Great product!',
      };

      const { isValid, errors } = validateReview(invalidReview);
      expect(isValid).toBe(false);
      expect(errors.rating).toBeDefined();
    });

    test('should reject rating outside 1-5 range', () => {
      const invalidReview1 = { rating: 0 };
      const invalidReview2 = { rating: 6 };

      let result = validateReview(invalidReview1);
      expect(result.isValid).toBe(false);

      result = validateReview(invalidReview2);
      expect(result.isValid).toBe(false);
    });

    test('should reject decimal rating', () => {
      const invalidReview = {
        rating: 4.5,
        comment: 'Good product',
      };

      const { isValid, errors } = validateReview(invalidReview);
      expect(isValid).toBe(false);
    });

    test('should accept review without comment', () => {
      const review = { rating: 5 };
      const { isValid } = validateReview(review);
      expect(isValid).toBe(true);
    });
  });
});
