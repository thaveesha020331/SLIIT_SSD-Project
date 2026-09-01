import Product from '../../models/Lakna/Product.js';
import mongoose from 'mongoose';
import { validateProductInput } from '../../utils/Lakna/validators.js';
import { calculateEcoImpact } from '../../services/Lakna/ecoImpactService.js';
import { uploadProductImage } from '../../services/Lakna/imageUploadService.js';

/**
 * Create a new product (Admin only)
 * @route POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const validationPayload = {
      ...req.body,
      image: req.body.image || (req.file ? 'uploaded-file' : undefined),
    };

    // Validate input
    const { errors, isValid } = validateProductInput(validationPayload);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    }

    // Handle image upload if provided
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = await uploadProductImage(req.file);
    }

    // Calculate eco-impact using third-party API
    const ecoImpactScore = await calculateEcoImpact({
      category: req.body.category,
      title: req.body.title,
      eco_certification: req.body.ecocertification,
    });

    let manufacturerInfo = req.body.manufacturerInfo;
    if (typeof manufacturerInfo === 'string') {
      try {
        manufacturerInfo = JSON.parse(manufacturerInfo);
      } catch (parseError) {
        manufacturerInfo = { name: '', location: '' };
      }
    }

    if (!manufacturerInfo || typeof manufacturerInfo !== 'object' || Array.isArray(manufacturerInfo)) {
      manufacturerInfo = { name: '', location: '' };
    }

    // Create product object
    const productData = {
      ...req.body,
      manufacturerInfo,
      image: imageUrl,
      imagePath: req.file ? req.file.path : null,
      ecoImpactScore: {
        carbonFootprint: ecoImpactScore.carbonFootprint,
        sustainabilityRating: ecoImpactScore.sustainabilityRating,
        waterUsage: ecoImpactScore.waterUsage,
        recyclabilityScore: ecoImpactScore.recyclabilityScore,
      },
      createdBy: req.user?._id,
    };

    if (!productData.createdBy) {
      delete productData.createdBy;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

/**
 * Get all products with filters
 * @route GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      productCategory,
      ecocertification,
      minPrice = 0,
      maxPrice = Number.MAX_VALUE,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    // Build filter object
    const filters = { isActive: true };

    if (category) {
      filters.category = category;
    }

    if (productCategory) {
      filters.productCategory = productCategory;
    }

    if (ecocertification) {
      filters.ecocertification = ecocertification;
    }

    if (minPrice || maxPrice) {
      filters.price = {
        $gte: parseFloat(minPrice),
        $lte: parseFloat(maxPrice),
      };
    }

    if (search) {
      filters.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filters);

    res.status(200).json({
      status: 'success',
      message: 'Products retrieved successfully',
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve products',
      error: error.message,
    });
  }
};

/**
 * Get single product by ID
 * @route GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve product',
      error: error.message,
    });
  }
};

/**
 * Update product (Admin only)
 * @route PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID',
      });
    }

    // Validate input
    const { errors, isValid } = validateProductInput(req.body, true);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Handle image update if provided
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = await uploadProductImage(req.file);
    }

    let manufacturerInfo = req.body.manufacturerInfo;
    if (typeof manufacturerInfo === 'string') {
      try {
        manufacturerInfo = JSON.parse(manufacturerInfo);
      } catch (parseError) {
        manufacturerInfo = product.manufacturerInfo || { name: '', location: '' };
      }
    }

    if (
      manufacturerInfo !== undefined &&
      (!manufacturerInfo || typeof manufacturerInfo !== 'object' || Array.isArray(manufacturerInfo))
    ) {
      manufacturerInfo = product.manufacturerInfo || { name: '', location: '' };
    }

    // Recalculate eco-impact if category or certification changed
    if (
      req.body.category !== product.category ||
      req.body.ecocertification !== product.ecocertification
    ) {
      const ecoImpactScore = await calculateEcoImpact({
        category: req.body.category || product.category,
        title: req.body.title || product.title,
        eco_certification: req.body.ecocertification || product.ecocertification,
      });

      product.ecoImpactScore = {
        carbonFootprint: ecoImpactScore.carbonFootprint,
        sustainabilityRating: ecoImpactScore.sustainabilityRating,
        waterUsage: ecoImpactScore.waterUsage,
        recyclabilityScore: ecoImpactScore.recyclabilityScore,
      };
    }

    // Update fields
    const allowedFields = [
      'title',
      'description',
      'price',
      'stock',
      'category',
      'productCategory',
      'ecocertification',
      'isActive',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (manufacturerInfo !== undefined) {
      product.manufacturerInfo = manufacturerInfo;
    }

    if (imageUrl) {
      product.image = imageUrl;
      if (req.file) {
        product.imagePath = req.file.path;
      }
    }

    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product update data',
        error: error.message,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

/**
 * Delete product (Admin only)
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

/**
 * Get products by category
 * @route GET /api/products/category/:category
 */
export const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const products = await Product.find({ category, isActive: true })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ category, isActive: true });

    res.status(200).json({
      status: 'success',
      message: `Products in ${category} category retrieved successfully`,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve products by category',
      error: error.message,
    });
  }
};

/**
 * Get products by eco-certification
 * @route GET /api/products/certification/:certification
 */
export const getByCertification = async (req, res) => {
  try {
    const { certification } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const products = await Product.find({ ecocertification: certification, isActive: true })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ ecocertification: certification, isActive: true });

    res.status(200).json({
      status: 'success',
      message: `Products with ${certification} certification retrieved successfully`,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get by certification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve products by certification',
      error: error.message,
    });
  }
};

/**
 * Add review to product (User)
 * @route POST /api/products/:id/reviews
 */
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    const review = {
      userId: req.user._id,
      rating,
      comment,
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Review added successfully',
      data: product,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add review',
      error: error.message,
    });
  }
};
