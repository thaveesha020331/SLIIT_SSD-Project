import Review from "../../models/Senara/Review.js";
import Product from "../../models/Lakna/Product.js";
import Order from "../../models/Thaveesha/Order.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const getSentimentFromAPI = async (text, rating) => {
  try {
    const sentimentRes = await axios.get(
      "https://api.api-ninjas.com/v1/sentiment",
      {
        params: { text },
        headers: { "X-Api-Key": process.env.SENTIMENT_API_KEY },
        timeout: 5000,
      }
    );

    const score = sentimentRes.data?.score ?? null;

    if (score !== null) {
      if (rating <= 2 && score < 0.3)  return "Negative";
      if (rating >= 4 && score > -0.3) return "Positive";
      if (score >= 0.3)                return "Positive";
      if (score <= -0.3)               return "Negative";
      return "Neutral";
    }

    const label = sentimentRes.data?.sentiment || "";
    if (label.toUpperCase().includes("POSITIVE")) return "Positive";
    if (label.toUpperCase().includes("NEGATIVE")) return "Negative";
    return "Neutral";

  } catch (err) {
    console.error("Sentiment API failed:", err.response?.status, err.message);
    return "Neutral";
  }
};

/**
 * Get all reviews (admin only)
 */
export const getAllReviews = async (req, res) => {
  try {
    const { sentiment } = req.query;
    const filter = {};
    if (sentiment) filter.sentiment = sentiment;

    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "title image category")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = reviews.map((r) => ({
      _id: r._id,
      id: r._id,
      userName: r.user?.name || "Unknown",
      userEmail: r.user?.email || "",
      productTitle: r.product?.title || "Unknown",
      productCategory: r.product?.category || "",
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      sentiment: r.sentiment,
      createdAt: r.createdAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get my reviews (current user)
 */
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ user: userId })
      .populate("product", "title image price category")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = reviews.map((r) => ({
      _id: r._id,
      id: r._id,
      authorName: r.user?.name || "Anonymous",
      title: r.title,
      comment: r.comment,
      rating: r.rating,
      createdAt: r.createdAt,
      userId: r.user?._id != null ? String(r.user._id) : undefined,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product reviews",
      error: error.message,
    });
  }
};

/**
 * Check if user can add review for product (delivered order, no existing review)
 */
export const checkCanReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { orderId } = req.query;

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: "You have already reviewed this product",
        existingReviewId: existingReview._id,
      });
    }

    const orderFilter = { user: userId, status: "delivered" };
    if (orderId) {
      orderFilter._id = orderId;
    }

    const deliveredOrder = await Order.findOne(orderFilter)
      .populate("items.product")
      .lean();
    if (!deliveredOrder) {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: "You can only review products from delivered orders",
      });
    }

    const hasProduct = (deliveredOrder.items || []).some(
      (i) => String(i.product?._id || i.product) === String(productId),
    );
    if (!hasProduct) {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: "This product is not in your delivered orders",
      });
    }

    res.status(200).json({
      success: true,
      canReview: true,
      orderId: deliveredOrder._id,
    });
  } catch (error) {
    console.error("Check can review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check review eligibility",
      error: error.message,
    });
  }
};

/**
 * Add review (customer only, delivered order, one per product)
 */
export const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, orderId, rating, title, comment } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
    if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters",
      });
    }
    if (comment.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters",
      });
    }

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const orderFilter = { user: userId, status: "delivered" };
    if (orderId) {
      orderFilter._id = orderId;
    }
    const deliveredOrder =
      await Order.findOne(orderFilter).populate("items.product");
    if (!deliveredOrder) {
      return res.status(400).json({
        success: false,
        message: "You can only review products from delivered orders",
      });
    }

    const hasProduct = (deliveredOrder.items || []).some(
      (i) => String(i.product?._id || i.product) === String(productId),
    );
    if (!hasProduct) {
      return res.status(400).json({
        success: false,
        message: "This product is not in your delivered orders",
      });
    }

    
    const sentiment = await getSentimentFromAPI(comment.trim(), Math.round(rating));

    const review = await Review.create({
      user: userId,
      product: productId,
      order: deliveredOrder._id,
      rating: Math.round(rating),
      title: (title || "").trim().slice(0, 100),
      comment: comment.trim(),
      sentiment: sentiment || "Neutral",
    });

    await Product.findByIdAndUpdate(productId, {
      $push: {
        reviews: {
          userId: userId,
          rating: review.rating,
          comment: review.comment,
          createdAt: new Date(),
        },
      },
    });

    const populated = await Review.findById(review._id)
      .populate("product", "title image")
      .lean();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};

/**
 * Update own review
 */
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined && rating !== null && rating !== "") {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = Math.round(r);
    }
    if (title !== undefined) {
      review.title = String(title).trim().slice(0, 100);
    }
    if (comment !== undefined) {
      const c = String(comment).trim();
      if (c.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Comment must be at least 10 characters",
        });
      }
      if (c.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot exceed 1000 characters",
        });
      }
      review.comment = c;

      
      review.sentiment = await getSentimentFromAPI(c, review.rating);
    }

    await review.save();

    const populated = await Review.findById(review._id)
      .populate("product", "title image")
      .lean();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

/**
 * Delete own review
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(id);

    await Product.findByIdAndUpdate(review.product, {
      $pull: {
        reviews: { userId: userId },
      },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

/**
 * Get single review by ID (for edit form)
 */
export const getReviewById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const review = await Review.findOne({ _id: id, user: userId })
      .populate("product", "title image")
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};

/**
 * Admin delete any review
 */
export const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    await Review.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};