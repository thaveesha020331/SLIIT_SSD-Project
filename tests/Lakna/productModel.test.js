import Product from '../../models/Lakna/Product.js';

const validProductPayload = {
  title: 'Eco Bottle',
  description: 'Sustainable reusable bottle for daily hydration.',
  price: 19.99,
  stock: 10,
  category: 'Reusable',
  productCategory: 'Kitchen',
  image: 'https://example.com/bottle.jpg',
  ecocertification: 'FSC',
};

describe('Lakna Product Model', () => {
  test('should validate a product with required valid fields', () => {
    const product = new Product(validProductPayload);
    const error = product.validateSync();
    expect(error).toBeUndefined();
  });

  test('should fail when required fields are missing', () => {
    const product = new Product({ title: 'Only title' });
    const error = product.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.productCategory).toBeDefined();
    expect(error.errors.image).toBeDefined();
    expect(error.errors.ecocertification).toBeDefined();
  });

  test('should fail validation for non-positive price', () => {
    const product = new Product({ ...validProductPayload, price: 0 });
    const error = product.validateSync();
    expect(error.errors.price).toBeDefined();
  });

  test('should fail validation for invalid category enum', () => {
    const product = new Product({ ...validProductPayload, category: 'Unknown' });
    const error = product.validateSync();
    expect(error.errors.category).toBeDefined();
  });

  test('should fail validation for invalid certification enum', () => {
    const product = new Product({ ...validProductPayload, ecocertification: 'Unknown Cert' });
    const error = product.validateSync();
    expect(error.errors.ecocertification).toBeDefined();
  });

  test('should fail validation for invalid product category enum', () => {
    const product = new Product({ ...validProductPayload, productCategory: 'Unknown' });
    const error = product.validateSync();
    expect(error.errors.productCategory).toBeDefined();
  });

  test('should apply schema defaults for stock, isActive and ecoImpactScore fields', () => {
    const product = new Product({
      ...validProductPayload,
      stock: undefined,
    });

    expect(product.stock).toBe(0);
    expect(product.isActive).toBe(true);
    expect(product.ecoImpactScore.carbonFootprint).toBe(0);
    expect(product.ecoImpactScore.sustainabilityRating).toBe(0);
    expect(product.ecoImpactScore.waterUsage).toBe(0);
    expect(product.ecoImpactScore.recyclabilityScore).toBe(0);
  });

  test('should enforce review rating bounds when review is provided', () => {
    const product = new Product({
      ...validProductPayload,
      reviews: [{ rating: 6, comment: 'Too high rating', userId: '507f1f77bcf86cd799439011' }],
    });
    const error = product.validateSync();
    expect(error.errors['reviews.0.rating']).toBeDefined();
  });

  test('should define expected indexes', () => {
    const indexes = Product.schema.indexes();
    const hasCategoryIndex = indexes.some(([fields]) => fields.category === 1 && fields.isActive === 1);
    const hasProductCategoryIndex = indexes.some(([fields]) => fields.productCategory === 1 && fields.isActive === 1);
    const hasTextIndex = indexes.some(([fields]) => fields.title === 'text' && fields.description === 'text');
    const hasCertIndex = indexes.some(([fields]) => fields.ecocertification === 1);

    expect(hasCategoryIndex).toBe(true);
    expect(hasProductCategoryIndex).toBe(true);
    expect(hasTextIndex).toBe(true);
    expect(hasCertIndex).toBe(true);
  });
});
