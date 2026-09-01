import React, { useEffect, useMemo, useState } from "react";
import reviewService from "../../services/Senara/reviewService";
import "./ProductReviewPage.css";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all"); // new

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    if (token === "admin-token-hardcoded") {
      setError(
        "Reviews require a real backend connection. Please log in with a real admin account.",
      );
      setLoading(false);
      return;
    }

    try {
      // pass sentimentFilter to service
      const res = await reviewService.getAllReviews(sentimentFilter);
      setReviews(res.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log out and log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view reviews.");
      } else {
        setError(err.response?.data?.message || "Failed to load reviews");
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewService.adminDeleteReview(id);
      setSuccess("Review deleted successfully.");
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (ratingFilter !== "all") {
      const rating = Number(ratingFilter);
      list = list.filter((r) => Number(r.rating) === rating);
    }

    if (sentimentFilter !== "all") {
      // filter by sentiment
      list = list.filter((r) => r.sentiment === sentimentFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => {
        return (
          r.userName?.toLowerCase().includes(q) ||
          r.userEmail?.toLowerCase().includes(q) ||
          r.productTitle?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [reviews, search, ratingFilter, sentimentFilter]);

  if (loading) {
    return (
      <div className="product-review-container">
        <div className="orders-loading">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="product-review-container">
      <div className="product-review-header">
        <div className="product-review-header-title">
          <h1>All user reviews</h1>
          <p>
            Admin view of every product review submitted by users. Use filters
            to quickly find specific reviews.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            color: "#16a34a",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by user, product, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All sentiments</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                User
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Product
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Rating
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Sentiment
              </th>{" "}
              {/* new */}
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Title
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Comment
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReviews.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No reviews found.
                </td>
              </tr>
            ) : (
              filteredReviews.map((r) => (
                <tr key={r._id || r.id}>
                  <td className="px-4 py-3 align-top text-gray-900">
                    <div className="font-medium">{r.userName}</div>
                    {r.userEmail && (
                      <div className="text-xs text-gray-500">{r.userEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-900">
                    <div className="font-medium">{r.productTitle}</div>
                    {r.productCategory && (
                      <div className="text-xs text-gray-500">
                        {r.productCategory}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-900">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {r.rating} / 5
                    </span>
                  </td>
                  {/* Sentiment badge */}
                  <td className="px-4 py-3 align-top">
                    {r.sentiment ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          r.sentiment === "Positive"
                            ? "bg-green-100 text-green-800"
                            : r.sentiment === "Neutral"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.sentiment}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-900">
                    {r.title || (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-900">
                    <div className="max-w-xs whitespace-pre-wrap text-xs text-gray-700">
                      {r.comment}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-gray-900">
                    <span className="text-xs text-gray-500">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      onClick={() => handleDelete(r._id || r.id)}
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fca5a5",
                        color: "#dc2626",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
