import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminProducts.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');
const REPORT_COMPANY = {
  name: 'EcoLife Marketplace',
  address: 'No. 12, Green Avenue, Colombo, Sri Lanka',
  email: 'support@ecolife.lk',
  phone: '+94 11 234 5678',
};

const AdminProducts = ({ mode = 'both' }) => {
  const [searchParams] = useSearchParams();
  const isAddMode = mode === 'add';
  const isListMode = mode === 'list';
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(isAddMode);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [certificationFilter, setCertificationFilter] = useState('');
  const canShowForm = mode === 'both' || isAddMode || (isListMode && editingId !== null);
  const canShowList = mode === 'both' || isListMode;

  const categories = ['Reusable', 'Organic', 'Handmade', 'Biodegradable', 'Sustainable', 'Ecofriendly'];
  const productCategories = ['Kitchen', 'Personal Care', 'Bags & School Items', 'Home & Living', 'Gifts'];
  const certifications = ['FSC', 'USDA Organic', 'Fair Trade', 'Carbon Neutral', 'B Corp', 'Cradle to Cradle', 'EU Ecolabel', 'Green Seal'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    productCategory: '',
    ecocertification: '',
    image: '',
    manufacturerInfo: {
      name: '',
      location: '',
    },
  });

  const showToast = (message, type = 'success') => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const resetForm = () => {
    setEditingId(null);
    setSelectedFile(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      productCategory: '',
      ecocertification: '',
      image: '',
      manufacturerInfo: {
        name: '',
        location: '',
      },
    });
  };

  useEffect(() => {
    if (mode !== 'both') {
      setShowForm(isAddMode);
      return;
    }

    const view = searchParams.get('view');
    if (view === 'add') {
      setShowForm(true);
      resetForm();
      return;
    }

    if (view === 'list') {
      setShowForm(false);
    }
  }, [searchParams, mode, isAddMode]);

  // Fetch products
  useEffect(() => {
    if (!canShowList) {
      return;
    }
    fetchProducts();
  }, [page, categoryFilter, productCategoryFilter, certificationFilter, canShowList]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/products?page=${page}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (productCategoryFilter) url += `&productCategory=${productCategoryFilter}`;
      if (certificationFilter) url += `&ecocertification=${certificationFilter}`;

      const response = await axios.get(url);
      const productList = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data?.products)
          ? response.data.products
          : [];

      setProducts(productList);
      setFilteredProducts(productList);
    } catch (err) {
      setError('Failed to fetch products');
      setProducts([]);
      setFilteredProducts([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('manufacturerInfo.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        manufacturerInfo: {
          ...formData.manufacturerInfo,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        image: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();
    const priceValue = Number(formData.price);
    const stockValue = Number(formData.stock);

    if (!trimmedTitle || !trimmedDescription || formData.price === '' || formData.stock === '' || !formData.category || !formData.productCategory || !formData.ecocertification) {
      setError('All required fields must be filled');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (trimmedDescription.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (Number.isNaN(stockValue) || stockValue < 0) {
      setError('Stock cannot be negative');
      return;
    }

    if (!editingId && !selectedFile) {
      setError('Please select a product image');
      return;
    }

    try {
      setError(null);

      if (editingId) {
        if (selectedFile) {
          const data = new FormData();
          Object.keys(formData).forEach((key) => {
            if (key === 'manufacturerInfo') {
              data.append(key, JSON.stringify(formData.manufacturerInfo));
            } else if (key === 'image') {
              data.append('image', selectedFile);
            } else {
              data.append(key, formData[key]);
            }
          });
          await axios.put(`${API_URL}/products/${editingId}`, data);
        } else {
          await axios.put(`${API_URL}/products/${editingId}`, {
            ...formData,
            manufacturerInfo: formData.manufacturerInfo,
            image: formData.image,
          });
        }
        showToast('Product updated successfully');
      } else {
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (key === 'manufacturerInfo') {
            data.append(key, JSON.stringify(formData.manufacturerInfo));
          } else if (key === 'image') {
            if (selectedFile) {
              data.append('image', selectedFile);
            } else if (formData.image && !formData.image.startsWith('blob:')) {
              data.append('image', formData.image);
            }
          } else {
            data.append(key, formData[key]);
          }
        });
        await axios.post(`${API_URL}/products`, data);
        showToast('Product added successfully');
      }

      setShowForm(false);
      if (isAddMode) {
        setShowForm(true);
      }
      resetForm();
      if (canShowList) {
        fetchProducts();
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        const firstValidationError = Object.values(backendErrors)[0];
        setError(firstValidationError || 'Validation failed');
        showToast(firstValidationError || 'Validation failed', 'error');
      } else {
        const message = err.response?.data?.message || err.response?.data?.error || 'Failed to save product';
        setError(message);
        showToast(message, 'error');
      }
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      productCategory: product.productCategory || '',
      ecocertification: product.ecocertification,
      image: product.image,
      manufacturerInfo: product.manufacturerInfo || { name: '', location: '' },
    });
    setSelectedFile(null);
    setEditingId(product._id);
    setShowForm(true);
    showToast('Product loaded for editing', 'info');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`);
      showToast('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
      showToast('Failed to delete product', 'error');
      console.error(err);
    }
  };

  const getProductImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }

    return `${API_BASE_URL}/${imagePath}`;
  };

  const getReportFileName = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `products-report-${stamp}.pdf`;
  };

  const fetchReportProducts = async () => {
    const reportLimit = 100;
    let reportPage = 1;
    let reportPages = 1;
    const allProducts = [];

    while (reportPage <= reportPages) {
      let url = `${API_URL}/products?page=${reportPage}&limit=${reportLimit}`;
      if (categoryFilter) {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      if (productCategoryFilter) {
        url += `&productCategory=${encodeURIComponent(productCategoryFilter)}`;
      }
      if (certificationFilter) {
        url += `&ecocertification=${encodeURIComponent(certificationFilter)}`;
      }

      const response = await axios.get(url);
      const pageProducts = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data?.products)
          ? response.data.products
          : [];

      allProducts.push(...pageProducts);

      const apiPages = Number(response?.data?.pagination?.pages);
      reportPages = Number.isFinite(apiPages) && apiPages > 0
        ? apiPages
        : (pageProducts.length === reportLimit ? reportPage + 1 : reportPage);
      reportPage += 1;
    }

    return allProducts;
  };

  const savePdfWithLocationPicker = async (doc, fileName) => {
    const hasSavePicker = typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';

    if (!hasSavePicker) {
      doc.save(fileName);
      return;
    }

    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(doc.output('blob'));
    await writable.close();
  };

  const handleDownloadReport = async () => {
    setReportLoading(true);
    setError(null);

    try {
      const reportProducts = await fetchReportProducts();

      if (!reportProducts.length) {
        setError('No products available for the selected filters');
        return;
      }

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const generatedAt = new Date();
      const filterSummary = [
        `Eco-Tag: ${categoryFilter || 'All'}`,
        `Category: ${productCategoryFilter || 'All'}`,
        `Certification: ${certificationFilter || 'All'}`,
      ].join('  |  ');

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 92, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(REPORT_COMPANY.name, 40, 38);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(REPORT_COMPANY.address, 40, 56);
      doc.text(`${REPORT_COMPANY.email}  |  ${REPORT_COMPANY.phone}`, 40, 72);

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Product Report', 40, 122);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on: ${generatedAt.toLocaleString()}`, 40, 142);
      doc.text(filterSummary, 40, 158);

      autoTable(doc, {
        startY: 176,
        head: [['Title', 'Eco-Tag', 'Category', 'Certification', 'Price (USD)', 'Stock', 'Manufacturer', 'Location']],
        body: reportProducts.map((product) => ([
          product.title || '-',
          product.category || '-',
          product.productCategory || '-',
          product.ecocertification || '-',
          Number(product.price || 0).toFixed(2),
          String(product.stock ?? 0),
          product.manufacturerInfo?.name || '-',
          product.manufacturerInfo?.location || '-',
        ])),
        styles: {
          font: 'helvetica',
          fontSize: 9,
          textColor: [55, 65, 81],
          cellPadding: 6,
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      });

      const finalY = doc.lastAutoTable?.finalY || 176;
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(`Total Products: ${reportProducts.length}`, 40, finalY + 24);

      await savePdfWithLocationPicker(doc, getReportFileName());
    } catch (err) {
      if (err?.name === 'AbortError') {
        return;
      }

      setError('Failed to generate report');
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="admin-products-container">
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast toast-${toast.type}`} key={toast.id} role="status">
            {toast.message}
          </div>
        )}
      </div>

      <div className="admin-header">
        <h1>Product Management</h1>
        {mode === 'both' && (
          <button className="btn-primary" onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}>
            {showForm ? 'Cancel' : 'Add New Product'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {canShowForm && showForm && (
        <div className="product-form-container">
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Product title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (&gt; 0) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock (≥ 0) *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Eco-Tag *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select eco-tag</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product Category *</label>
                <select
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select product category</option>
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Eco-Certification *</label>
                <select
                  name="ecocertification"
                  value={formData.ecocertification}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select certification</option>
                  {certifications.map((cert) => (
                    <option key={cert} value={cert}>
                      {cert}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Product Image *</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                required={!editingId}
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="image-preview"
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Manufacturer Name</label>
                <input
                  type="text"
                  name="manufacturerInfo.name"
                  value={formData.manufacturerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Company name"
                />
              </div>

              <div className="form-group">
                <label>Manufacturer Location</label>
                <input
                  type="text"
                  name="manufacturerInfo.location"
                  value={formData.manufacturerInfo.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (isAddMode) {
                    resetForm();
                    setShowForm(true);
                    return;
                  }

                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {canShowList && (
        <>
          <div className="filters-section">
            <div className="filter-group">
              <label>Filter by Eco-Tag:</label>
              <select value={categoryFilter} onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}>
                <option value="">All Eco-Tags</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Category:</label>
              <select value={productCategoryFilter} onChange={(e) => {
                setProductCategoryFilter(e.target.value);
                setPage(1);
              }}>
                <option value="">All Categories</option>
                {productCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Certification:</label>
              <select value={certificationFilter} onChange={(e) => {
                setCertificationFilter(e.target.value);
                setPage(1);
              }}>
                <option value="">All Certifications</option>
                {certifications.map((cert) => (
                  <option key={cert} value={cert}>
                    {cert}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group report-action">
              <label>Product Report:</label>
              <button
                type="button"
                className="btn-report"
                onClick={handleDownloadReport}
                disabled={loading || reportLoading}
              >
                {reportLoading ? 'Generating PDF...' : 'Download Report'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state" aria-busy="true" aria-live="polite">
              <div className="loading-header-row">
                <div className="loading-spinner" />
                <div>
                  <h3>Loading products</h3>
                  <p>Fetching the latest inventory and eco metrics.</p>
                </div>
              </div>

              <div className="loading-table-skeleton">
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="loading-row" aria-hidden="true">
                    <div className="skeleton-cell skeleton-title" />
                    <div className="skeleton-cell skeleton-image" />
                    <div className="skeleton-cell" />
                    <div className="skeleton-cell" />
                    <div className="skeleton-cell" />
                    <div className="skeleton-cell" />
                    <div className="skeleton-cell" />
                    <div className="skeleton-cell skeleton-wide" />
                    <div className="skeleton-cell skeleton-actions" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Image</th>
                    <th>Eco-Tag</th>
                    <th>Category</th>
                    <th>Certification</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Eco-Impact Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(filteredProducts) ? filteredProducts : []).map((product) => (
                    <tr key={product._id}>
                      <td>{product.title}</td>
                      <td>
                        {product.image ? (
                          <img
                            src={getProductImageSrc(product.image)}
                            alt={product.title}
                            className="table-product-image"
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </td>
                      <td>{product.category}</td>
                      <td>{product.productCategory || '-'}</td>
                      <td>{product.ecocertification}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="eco-score">
                          <div className="sustainability-rating">
                            {product.ecoImpactScore?.sustainabilityRating || 0}%
                          </div>
                          <small>CO2: {product.ecoImpactScore?.carbonFootprint || 0} kg</small>
                        </div>
                      </td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;
