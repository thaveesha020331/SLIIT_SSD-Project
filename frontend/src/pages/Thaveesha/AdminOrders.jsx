/**
 * Admin Order Management - Thaveesha
 * Admin can view all orders and update status via dropdown.
 * When order is delivered, the cancelled option is disabled in the dropdown.
 * When order is cancelled by user, admin cannot change the stage.
 * Search by customer name, email, or order ID.
 * Styled to match AdminReviewsPage.
 */
import React, { useState, useEffect } from 'react';
import { adminOrderAPI } from '../../services/Thaveesha/adminOrderService';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:    'bg-amber-900 text-amber-50 ring-1 ring-amber-700/60',
  processing: 'bg-slate-800 text-slate-50 ring-1 ring-slate-600/80',
  shipped:    'bg-indigo-900 text-indigo-50 ring-1 ring-indigo-700/60',
  delivered:  'bg-emerald-900 text-emerald-50 ring-1 ring-emerald-700/60',
  cancelled:  'bg-red-900 text-red-50 ring-1 ring-red-700/60',
};

const PAGE_SIZE = 20;

export default function AdminOrders() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [successMsg, setSuccessMsg]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm]     = useState('');
  const [updatingId, setUpdatingId]     = useState(null);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [pages, setPages]               = useState(0);

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, page]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (filterStatus) params.status = filterStatus;
      const data = await adminOrderAPI.getAllOrders(params);
      setOrders(data.orders || []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    setError(null);
    try {
      const data = await adminOrderAPI.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.order : o))
      );
      showSuccess(`Order status updated to "${newStatus}"`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-LK', { dateStyle: 'medium' });
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch  = order.user?.name?.toLowerCase().includes(term);
    const emailMatch = order.user?.email?.toLowerCase().includes(term);
    const idMatch    = order._id?.toLowerCase().includes(term);
    return nameMatch || emailMatch || idMatch;
  });

  if (loading) {
    return (
      <div className="product-review-container">
        <div className="orders-loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="product-review-container">

      {/* Header */}
      <div className="product-review-header">
        <div className="product-review-header-title">
          <h1>Order Management</h1>
          <p>View and manage all customer orders</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          color: '#dc2626', padding: '12px 16px', borderRadius: '8px',
          marginBottom: '16px', fontSize: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
        }}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => { setError(null); fetchOrders(); }}
            style={{
              padding: '6px 12px', border: '1px solid #dc2626', background: 'transparent',
              color: '#dc2626', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          color: '#16a34a', padding: '12px 16px', borderRadius: '8px',
          marginBottom: '16px', fontSize: '14px',
        }}>
          {successMsg}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-gray-500">
          {total} order{total !== 1 ? 's' : ''} total
          {searchTerm ? ` · ${filteredOrders.length} match in page` : ''}
        </span>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages || loading}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-gray-500">
          {searchTerm ? `No orders found for "${searchTerm}"` : 'No orders found.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Change Status'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const busy = updatingId === order._id;
                const statusClass = STATUS_COLORS[order.status] || 'bg-gray-800 text-gray-100 ring-1 ring-gray-600';

                // Lock dropdown when order was cancelled by the user
                const lockedByUser = order.status === 'cancelled' && order.cancelledBy === 'user';

                return (
                  <tr key={order._id} className={busy ? 'bg-gray-50' : 'bg-white'}>

                    {/* Order ID */}
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-xs text-gray-500">
                        ...{order._id.slice(-8)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 align-top text-gray-900">
                      <div className="font-medium">{order.user?.name || 'Unknown'}</div>
                      {order.user?.email && (
                        <div className="text-xs text-gray-500">{order.user.email}</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 align-top text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 align-top text-gray-900">
                      {(order.items || []).slice(0, 2).map((line) => (
                        <div key={line._id} className="text-xs text-gray-700">
                          {line.product?.title || 'Item'} x {line.quantity}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{order.items.length - 2} more
                        </div>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 align-top font-semibold text-gray-900 whitespace-nowrap">
                      LKR {(order.total ?? 0).toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusClass}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={busy || lockedByUser}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          style={{
                            cursor: (busy || lockedByUser) ? 'not-allowed' : 'pointer',
                            opacity: (busy || lockedByUser) ? 0.5 : 1,
                            width: '155px',
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => {
                            // When delivered, disallow switching to cancelled
                            const isDisabled = order.status === 'delivered' && s === 'cancelled';
                            return (
                              <option key={s} value={s} disabled={isDisabled}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                {isDisabled ? ' (not allowed)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {busy && (
                          <span className="text-xs text-gray-500">Saving...</span>
                        )}
                        {lockedByUser && !busy && (
                          <span className="text-xs text-red-400 whitespace-nowrap">
                            Cancelled by customer
                          </span>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}