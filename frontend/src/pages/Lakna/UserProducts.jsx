import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import api from '../../services/Tudakshana/authService';
import { cartAPI } from '../../services/Thaveesha';
import { reviewService } from '../../services/Senara/reviewService';
import './UserProducts.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');
const VIEWPORT = { once: true, amount: 0.2 };

const UserProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('az');

  const categories = ['Reusable', 'Organic', 'Handmade', 'Biodegradable', 'Sustainable', 'Ecofriendly'];
  const productCategories = ['Kitchen', 'Personal Care', 'Bags & School Items', 'Home & Living', 'Gifts'];
  const certifications = ['FSC', 'USDA Organic', 'Fair Trade', 'Carbon Neutral', 'B Corp', 'Cradle to Cradle', 'EU Ecolabel', 'Green Seal'];

  useEffect(() => {
    const preselectedProductCategory = searchParams.get('productCategory');

    if (preselectedProductCategory && productCategories.includes(preselectedProductCategory)) {
      setSelectedProductCategories([preselectedProductCategory]);
      return;
    }

    setSelectedProductCategories([]);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategories, selectedProductCategories, selectedCertifications]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, selectedCategories, selectedProductCategories, selectedCertifications]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/products?page=${page}&limit=12`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (selectedCategories.length === 1) url += `&category=${encodeURIComponent(selectedCategories[0])}`;
      if (selectedProductCategories.length === 1) url += `&productCategory=${encodeURIComponent(selectedProductCategories[0])}`;
      if (selectedCertifications.length === 1) url += `&ecocertification=${encodeURIComponent(selectedCertifications[0])}`;

      const response = await api.get(url, { timeout: 5000 });
      if (response.data?.data && response.data?.pagination) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.pages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      setProducts([]);
      setTotalPages(1);
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart(productId, quantity);
      navigate('/cart');
    } catch (err) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const getEcoRatingColor = (rating) => {
    if (rating >= 80) return '#10b981';
    if (rating >= 60) return '#f59e0b';
    if (rating >= 40) return '#f97316';
    return '#ef4444';
  };

  const getEcoRatingLabel = (rating) => {
    if (rating >= 80) return 'Excellent';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getProductImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://') ||
      imagePath.startsWith('blob:') ||
      imagePath.startsWith('data:')
    ) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }

    return `${API_BASE_URL}/${imagePath}`;
  };

  // Category and Certification filters
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => (
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    ));
  };

  const handleProductCategoryToggle = (category) => {
    setSelectedProductCategories((prev) => (
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    ));
  };

  const handleCertificationToggle = (certification) => {
    setSelectedCertifications((prev) => (
      prev.includes(certification)
        ? prev.filter((item) => item !== certification)
        : [...prev, certification]
    ));
  };

  // Memoized filtered and sorted products
  const displayedProducts = useMemo(() => {
    const categoryFiltered = products.filter((product) => {
      if (!selectedCategories.length) return true;
      return selectedCategories.includes(product.category);
    });

    const certificationFiltered = categoryFiltered.filter((product) => {
      if (!selectedCertifications.length) return true;
      return selectedCertifications.includes(product.ecocertification);
    });

    const productCategoryFiltered = certificationFiltered.filter((product) => {
      if (!selectedProductCategories.length) return true;
      const productCategory = product.productCategory || product.productcategory || '';
      return selectedProductCategories.includes(productCategory);
    });

    return [...productCategoryFiltered].sort((first, second) => {
      if (sortBy === 'za') return String(second.title || '').localeCompare(String(first.title || ''));
      if (sortBy === 'price-low') return Number(first.price || 0) - Number(second.price || 0);
      if (sortBy === 'price-high') return Number(second.price || 0) - Number(first.price || 0);
      return String(first.title || '').localeCompare(String(second.title || ''));
    });
  }, [products, selectedCategories, selectedCertifications, selectedProductCategories, sortBy]);

  const handleViewProduct = async (product) => {
    setSelectedProduct({ ...product, reviews: [] });

    try {
      const res = await reviewService.getProductReviews(product._id);
      setSelectedProduct((prev) => ({
        ...prev,
        reviews: res.data.data || [],
      }));
    } catch (err) {
      console.error('Failed to fetch product reviews', err);
      setSelectedProduct((prev) => ({ ...prev, reviews: [] }));
    }
  };

  const previewReview = selectedProduct?.reviews?.[0] || null;

  return (
    <motion.section
      className="mt-0 px-4 md:px-8 pt-2 pb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="user-products-container">
        <motion.div
          className="products-header"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.05 }}
        >
          <div className="pointer-events-none absolute top-0 right-0 w-2/3 h-full bg-white/10 rounded-l-full blur-3xl transform translate-x-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-300/20 blur-3xl rounded-full" />
          <div className="products-header-content">
          <h1>Eco-Friendly Products</h1>
          <p>Discover sustainable and environmentally conscious products</p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {error}
          </motion.div>
        )}

        {/* Product Modal */}
        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content modal-content-modern" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>

              <div className="modal-hero">
                <div className="modal-hero-image">
                  <img src={getProductImageSrc(selectedProduct.image)} alt={selectedProduct.title} />
                  <div className="modal-hero-image-overlay" />
                </div>

                <div className="modal-hero-copy">
                  <span className="modal-eyebrow">Product Details</span>
                  <h2>{selectedProduct.title}</h2>
                  <div className="product-meta product-meta-modern">
                    <span className="badge badge-category">{selectedProduct.category}</span>
                    <span className="badge badge-category">{selectedProduct.productCategory || 'Uncategorized'}</span>
                    <span className="badge badge-cert">{selectedProduct.ecocertification}</span>
                  </div>

                  <div className="detail-summary-grid">
                    <div className="detail-summary-card">
                      <span>Price</span>
                      <strong>${selectedProduct.price.toFixed(2)}</strong>
                    </div>
                    <div className={`detail-summary-card ${selectedProduct.stock > 0 ? 'summary-in-stock' : 'summary-out-of-stock'}`}>
                      <span>Stock</span>
                      <strong>{selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of stock'}</strong>
                    </div>
                    <div className="detail-summary-card">
                      <span>Manufacturer</span>
                      <strong>{selectedProduct.manufacturerInfo?.name || 'Not listed'}</strong>
                    </div>
                  </div>

                  <p className="product-description">{selectedProduct.description}</p>

                  <div className="modal-actions">
                    <button
                      className="btn-view-details btn-modal-primary"
                      onClick={() => handleAddToCart(selectedProduct._id)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-detail-grid">
                <div className="detail-card eco-impact-section">
                  <h3>Eco-Impact Score</h3>
                  <div className="eco-metrics">
                    <div className="eco-metric">
                      <div className="metric-circle" style={{ borderColor: getEcoRatingColor(selectedProduct.ecoImpactScore?.sustainabilityRating || 0) }}>
                        <div className="metric-value">{selectedProduct.ecoImpactScore?.sustainabilityRating || 0}%</div>
                      </div>
                      <div className="metric-label">Sustainability</div>
                      <div className="metric-subtext">{getEcoRatingLabel(selectedProduct.ecoImpactScore?.sustainabilityRating || 0)}</div>
                    </div>

                    <div className="eco-metric">
                      <div className="metric-value">{selectedProduct.ecoImpactScore?.carbonFootprint || 0}</div>
                      <div className="metric-label">Carbon Footprint</div>
                      <div className="metric-subtext">kg CO2e</div>
                    </div>

                    <div className="eco-metric">
                      <div className="metric-value">{selectedProduct.ecoImpactScore?.waterUsage || 0}</div>
                      <div className="metric-label">Water Usage</div>
                      <div className="metric-subtext">liters</div>
                    </div>

                    <div className="eco-metric">
                      <div className="metric-circle" style={{ borderColor: getEcoRatingColor(selectedProduct.ecoImpactScore?.recyclabilityScore || 0) }}>
                        <div className="metric-value">{selectedProduct.ecoImpactScore?.recyclabilityScore || 0}%</div>
                      </div>
                      <div className="metric-label">Recyclability</div>
                    </div>
                  </div>
                </div>
    
                {/* Reviews */}

                <div className="detail-card reviews-section">
                  <h3>Reviews</h3>
                  {previewReview ? (
                    <div className="review-preview-compact">
                      <div className="review-preview-head">
                        <strong>{previewReview.authorName || 'Anonymous'}</strong>
                        <span>{Number(previewReview.rating) || 0}/5</span>
                      </div>
                      <p>{previewReview.comment || 'No comment provided.'}</p>
                    </div>
                  ) : (
                    <p className="review-empty-text">No reviews yet.</p>
                  )}
                  <button
                    type="button"
                    className="btn-add-review btn-modal-secondary"
                    onClick={() => navigate(`/products/${selectedProduct._id}/all-reviews`)}
                  >
                    View All Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Layout */}
        <motion.div
          className="products-layout"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
        >
          <motion.aside
            className="filters-sidebar"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
          >
            <h3>Filters</h3>

            <div className="sidebar-filter-group">
              <h4>Filter by Eco-Tag</h4>
              {categories.map((category) => (
                <label key={category} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>

            <div className="sidebar-filter-group">
              <h4>Filter by Category</h4>
              {productCategories.map((category) => (
                <label key={category} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedProductCategories.includes(category)}
                    onChange={() => handleProductCategoryToggle(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>

            <div className="sidebar-filter-group">
              <h4>Certification</h4>
              {certifications.map((certification) => (
                <label key={certification} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedCertifications.includes(certification)}
                    onChange={() => handleCertificationToggle(certification)}
                  />
                  <span>{certification}</span>
                </label>
              ))}
            </div>
          </motion.aside>

          <motion.div
            className="products-main-content"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
          >
            <motion.div
              className="top-controls-row"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.16 }}
            >
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="sort-controls">
                <label htmlFor="sortBy">Sort by</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                  <option value="price-low">Price low</option>
                  <option value="price-high">Price high</option>
                </select>
              </div>

              <div className="product-count">Products: {displayedProducts.length}</div>
            </motion.div>

            {loading ? (
                <motion.div
                  className="loading-state"
                  aria-busy="true"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <div className="loading-copy">
                    <div className="loading-spinner" />
                    <div>
                      <h2>Refreshing products</h2>
                      <p>Finding the best sustainable matches for your filters.</p>
                    </div>
                  </div>

                  <div className="loading-skeleton-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="product-card product-card-skeleton" aria-hidden="true">
                        <div className="skeleton skeleton-image" />
                        <div className="product-card-content">
                          <div className="skeleton skeleton-title" />
                          <div className="skeleton skeleton-line" />
                          <div className="skeleton skeleton-line short" />

                          <div className="product-footer">
                            <div className="skeleton skeleton-pill" />
                            <div className="skeleton skeleton-pill small" />
                          </div>

                          <div className="product-card-actions">
                            <div className="skeleton skeleton-button" />
                            <div className="skeleton skeleton-icon-button" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
            ) : (
              <>
                <motion.div
                  className="products-grid"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {displayedProducts.map((product, index) => (
                    <motion.article
                      key={product._id}
                      className="product-card"
                      initial={{ opacity: 0, y: 22, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={VIEWPORT}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: Math.min(index * 0.04, 0.24) }}
                    >
                      <div className="product-image">
                        <img src={getProductImageSrc(product.image)} alt={product.title} />
                        <div className="product-badges">
                          <span className="badge badge-category">{product.category}</span>
                          <span className="badge badge-cert">{product.ecocertification}</span>
                        </div>
                      </div>

                      <div className="product-card-content">
                        <h3>{product.title}</h3>

                        <div className="eco-score-small">
                          <div className="sustainability-score">
                            <div className="score-circle" style={{ borderColor: getEcoRatingColor(product.ecoImpactScore?.sustainabilityRating || 0) }}>
                              {product.ecoImpactScore?.sustainabilityRating || 0}%
                            </div>
                            <span>Eco Rating</span>
                          </div>
                        </div>

                        <div className="product-footer">
                          <div className="price">${product.price.toFixed(2)}</div>
                          <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>

                        <div className="product-card-actions">
                          <button
                            className="btn-view-details btn-view-details-wide"
                            onClick={() => handleViewProduct(product)}
                          >
                            View Details
                          </button>
                          <button
                            className="btn-cart-icon"
                            onClick={() => handleAddToCart(product._id)}
                            aria-label="Add to cart"
                            title="Add to cart"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <motion.div
                    className="pagination"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
                  >
                    <button
                      className="btn-pagination"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </button>

                    <span className="page-info">Page {page} of {totalPages}</span>

                    <button
                      className="btn-pagination"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default UserProducts;