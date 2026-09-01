import {
  formatProductResponse,
  calculateAverageRating,
  getCategoryInfo,
  getAllCategories,
  getAllCertifications,
  formatPrice,
  isInStock,
  getEcoImpactColor,
  getEcoImpactLevel,
  sortByEcoImpact,
  filterByEcoImpact,
  getCarbonFootprintBadge,
} from '../../utils/Lakna/helpers.js';

describe('Lakna Helper Utilities', () => {
  test('should format product response with defaults', () => {
    const response = formatProductResponse({
      _id: 'p1',
      title: 'Bottle',
      description: 'Reusable bottle for daily hydration',
      price: 2500,
      stock: 7,
      category: 'Reusable',
      image: 'img.png',
      ecocertification: 'FSC',
      reviews: [],
      isActive: true,
    });

    expect(response.id).toBe('p1');
    expect(response.ecoImpactScore.sustainabilityRating).toBe(0);
    expect(response.reviewsCount).toBe(0);
    expect(response.averageRating).toBe(0);
  });

  test('should calculate average rating with two decimals', () => {
    expect(calculateAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.33);
    expect(calculateAverageRating([])).toBe(0);
  });

  test('should return category info and fallback for unknown', () => {
    expect(getCategoryInfo('Organic').label).toBe('Organic');
    expect(getCategoryInfo('UnknownCategory')).toEqual({
      label: 'UnknownCategory',
      description: '',
      icon: '',
    });
  });

  test('should expose category and certification lists', () => {
    expect(getAllCategories()).toContain('Reusable');
    expect(getAllCertifications()).toContain('Carbon Neutral');
  });

  test('should format price and check stock', () => {
    expect(formatPrice(1234.5, 'USD')).toContain('$1,234.50');
    expect(isInStock({ stock: 1 })).toBe(true);
    expect(isInStock({ stock: 0 })).toBe(false);
  });

  test('should map eco impact values to color and level', () => {
    expect(getEcoImpactColor(82)).toBe('green');
    expect(getEcoImpactColor(65)).toBe('yellow');
    expect(getEcoImpactColor(45)).toBe('orange');
    expect(getEcoImpactColor(20)).toBe('red');

    expect(getEcoImpactLevel(82)).toBe('Excellent');
    expect(getEcoImpactLevel(65)).toBe('Good');
    expect(getEcoImpactLevel(45)).toBe('Fair');
    expect(getEcoImpactLevel(20)).toBe('Needs Improvement');
  });

  test('should sort and filter products by eco impact score', () => {
    const products = [
      { id: 'a', ecoImpactScore: { sustainabilityRating: 30 } },
      { id: 'b', ecoImpactScore: { sustainabilityRating: 90 } },
      { id: 'c', ecoImpactScore: { sustainabilityRating: 65 } },
    ];

    const desc = sortByEcoImpact([...products], 'desc').map((p) => p.id);
    const asc = sortByEcoImpact([...products], 'asc').map((p) => p.id);
    const filtered = filterByEcoImpact(products, 60).map((p) => p.id);

    expect(desc).toEqual(['b', 'c', 'a']);
    expect(asc).toEqual(['a', 'c', 'b']);
    expect(filtered).toEqual(['b', 'c']);
  });

  test('should return carbon footprint badge text', () => {
    expect(getCarbonFootprintBadge(0.4)).toBe('Very Low Carbon Footprint');
    expect(getCarbonFootprintBadge(1)).toBe('Low Carbon Footprint');
    expect(getCarbonFootprintBadge(1.8)).toBe('Moderate Carbon Footprint');
    expect(getCarbonFootprintBadge(2.5)).toBe('High Carbon Footprint');
  });
});
