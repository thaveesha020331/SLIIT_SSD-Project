import {
  calculateEcoImpact,
  getCertificationInfo,
} from '../../services/Lakna/ecoImpactService.js';

describe('Eco-Impact Service', () => {
  describe('calculateEcoImpact', () => {
    test('should calculate eco-impact for Reusable + Carbon Neutral', async () => {
      const productData = {
        category: 'Reusable',
        title: 'Eco Bottle',
        eco_certification: 'Carbon Neutral',
      };

      const result = await calculateEcoImpact(productData);

      expect(result).toHaveProperty('carbonFootprint');
      expect(result).toHaveProperty('sustainabilityRating');
      expect(result).toHaveProperty('waterUsage');
      expect(result).toHaveProperty('recyclabilityScore');

      expect(typeof result.carbonFootprint).toBe('number');
      expect(result.carbonFootprint).toBeGreaterThan(0);
      expect(typeof result.sustainabilityRating).toBe('number');
      expect(result.sustainabilityRating).toBeGreaterThanOrEqual(0);
      expect(result.sustainabilityRating).toBeLessThanOrEqual(100);
    });

    test('should calculate lower carbon footprint for certified products', async () => {
      const uncertifiedData = {
        category: 'Organic',
        title: 'Organic Cotton',
        eco_certification: 'Fair Trade',
      };

      const certifiedData = {
        category: 'Organic',
        title: 'Organic Cotton',
        eco_certification: 'Carbon Neutral',
      };

      const uncertifiedResult = await calculateEcoImpact(uncertifiedData);
      const certifiedResult = await calculateEcoImpact(certifiedData);

      expect(certifiedResult.carbonFootprint).toBeLessThan(uncertifiedResult.carbonFootprint);
    });

    test('should calculate higher sustainability rating for better certifications', async () => {
      const fairTradeData = {
        category: 'Organic',
        title: 'Product',
        eco_certification: 'Fair Trade',
      };

      const carbonNeutralData = {
        category: 'Organic',
        title: 'Product',
        eco_certification: 'Carbon Neutral',
      };

      const fairTradeResult = await calculateEcoImpact(fairTradeData);
      const carbonNeutralResult = await calculateEcoImpact(carbonNeutralData);

      expect(carbonNeutralResult.sustainabilityRating).toBeGreaterThan(
        fairTradeResult.sustainabilityRating
      );
    });

    test('should return different water usage for different categories', async () => {
      const reuseableData = {
        category: 'Reusable',
        title: 'Bottle',
        eco_certification: 'FSC',
      };

      const organicData = {
        category: 'Organic',
        title: 'Cotton',
        eco_certification: 'FSC',
      };

      const reuseableResult = await calculateEcoImpact(reuseableData);
      const organicResult = await calculateEcoImpact(organicData);

      expect(reuseableResult.waterUsage).not.toBe(organicResult.waterUsage);
    });

    test('should handle invalid category gracefully', async () => {
      const invalidData = {
        category: 'InvalidCategory',
        title: 'Product',
        eco_certification: 'FSC',
      };

      const result = await calculateEcoImpact(invalidData);

      expect(result.carbonFootprint).toBeDefined();
      expect(result.sustainabilityRating).toBeDefined();
      expect(result.waterUsage).toBeDefined();
      expect(result.recyclabilityScore).toBeDefined();
    });

    test('should have high recyclability for Cradle to Cradle', async () => {
      const c2cData = {
        category: 'Sustainable',
        title: 'Product',
        eco_certification: 'Cradle to Cradle',
      };

      const result = await calculateEcoImpact(c2cData);

      expect(result.recyclabilityScore).toBeGreaterThanOrEqual(85);
    });
  });

  describe('getCertificationInfo', () => {
    test('should return info for FSC certification', () => {
      const info = getCertificationInfo('FSC');

      expect(info).toBeDefined();
      expect(info.name).toBe('Forest Stewardship Council');
      expect(info.description).toBeDefined();
      expect(info.website).toBeDefined();
    });

    test('should return info for all valid certifications', () => {
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
        const info = getCertificationInfo(cert);
        expect(info).not.toBeNull();
        expect(info.name).toBeDefined();
        expect(info.description).toBeDefined();
        expect(info.website).toBeDefined();
      });
    });

    test('should return null for invalid certification', () => {
      const info = getCertificationInfo('InvalidCert');
      expect(info).toBeNull();
    });
  });
});
