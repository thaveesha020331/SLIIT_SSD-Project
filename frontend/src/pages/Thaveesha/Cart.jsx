import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ShoppingBag, Minus, Plus, Trash2, MapPin, Loader2, ArrowRight, PackageOpen } from 'lucide-react';
import { cartAPI, orderAPI } from '../../services/Thaveesha';
import { authAPI } from '../../services/Tudakshana/authService';
import MapAddressPicker from '../../components/Thaveesha/MapAddressPicker';
import './Order.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

function getImageSrc(path) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}

function formatProfileAddress(addr) {
  if (!addr || typeof addr !== 'object') return '';
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.join(', ');
}

function buildAddressObject(rawAddress) {
  const text = String(rawAddress || '').trim();
  if (!text) return undefined;
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean);
  return {
    street: parts[0] || text,
    city: parts[1] || '',
    state: parts[2] || '',
    zipCode: parts[3] || '',
    country: parts[4] || '',
  };
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [shippingLat, setShippingLat] = useState(null);
  const [shippingLng, setShippingLng] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    shippingAddress: '',
    phone: '',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (!cart.length) return;
    authAPI.getProfile().then((res) => {
      const user = res?.data?.user;
      if (!user) return;
      setCheckoutForm((prev) => ({
        ...prev,
        ...(user.phone && { phone: user.phone }),
        ...(user.address && { shippingAddress: formatProfileAddress(user.address) || prev.shippingAddress }),
      }));
    }).catch(() => {});
  }, [cart.length]);

  async function fetchCart() {
    setLoading(true);
    setError(null);
    try {
      const { items } = await cartAPI.getCart();
      setCart(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || err.message || 'Failed to load cart');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(itemId, delta) {
    const item = cart.find((i) => i._id === itemId);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    if (newQty === item.quantity) return;
    setError(null);
    setUpdating(itemId);
    try {
      const data = await cartAPI.updateItem(itemId, newQty);
      if (data?.items) setCart(data.items);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(itemId) {
    setError(null);
    setUpdating(itemId);
    try {
      const data = await cartAPI.removeItem(itemId);
      if (data?.items) setCart(data.items);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setUpdating(null);
    }
  }

  const subtotal = cart.reduce((sum, item) => {
    const p = item.product || item;
    return sum + (p.price ?? 0) * (item.quantity ?? 1);
  }, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const itemCount = cart.reduce((s, i) => s + (i.quantity ?? 1), 0);

  function validateCheckout() {
    const errs = {};
    const addr = (checkoutForm.shippingAddress || '').trim();
    const phone = (checkoutForm.phone || '').trim();
    if (addr.length < 10) errs.shippingAddress = 'Please enter a full address (at least 10 characters).';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9) errs.phone = 'Please enter a valid phone number (at least 9 digits).';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (!validateCheckout()) return;
    setPlacing(true);
    setError(null);
    setFieldErrors({});
    try {
      // Keep profile address/phone in sync with latest checkout values.
      await authAPI.updateProfile({
        phone: checkoutForm.phone.trim(),
        address: buildAddressObject(checkoutForm.shippingAddress),
      }).catch(() => {});

      const response = await orderAPI.createOrder({
        items: cart.map((item) => ({
          productId: (item.product && item.product._id) || item._id,
          quantity: item.quantity || 1,
        })),
        shippingAddress: checkoutForm.shippingAddress.trim(),
        phone: checkoutForm.phone.trim(),
        notes: checkoutForm.notes.trim(),
        ...(shippingLat != null && shippingLng != null && { shippingLat, shippingLng }),
      });

      const orderId =
        response?.order?._id ||
        response?._id ||
        response?.data?.order?._id ||
        response?.data?._id;
      if (orderId) {
        setOrderSuccess(true);
        setCart([]);
        navigate(`/checkout/${orderId}`);
      } else {
        setError('Order created but ID not found. Please try again.');
        setOrderSuccess(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Checkout failed.');
      if (err.response?.status !== 401) setOrderSuccess(false);
    } finally {
      setPlacing(false);
    }
  }

  /* ── Loading ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-12 max-w-8xl mx-auto">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400 px-8 py-12">
            <div className="pointer-events-none absolute top-0 right-0 w-2/3 h-full bg-white/10 rounded-l-full blur-3xl transform translate-x-1/4" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-300/20 blur-3xl rounded-full" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800 backdrop-blur-sm">
                  <Leaf size={13} className="text-lime-700" />
                  Eco.Mart
                </span>
                <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Your Cart</h1>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Loader2 size={22} className="animate-spin text-lime-700" strokeWidth={2} />
                <span className="text-sm font-medium">Loading…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero banner ─────────────────────────────── */}
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-12 max-w-8xl mx-auto">
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400 px-8 py-12">
          <div className="pointer-events-none absolute top-0 right-0 w-2/3 h-full bg-white/10 rounded-l-full blur-3xl transform translate-x-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-300/20 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800 backdrop-blur-sm">
                <Leaf size={13} className="text-lime-700" />
                Eco.Mart
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Your Cart</h1>
              {cart.length > 0 ? (
                <p className="mt-1 text-sm text-gray-700">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} — ready to checkout
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-700">Review items and proceed to checkout</p>
              )}
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
            >
              Continue shopping <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Banners ─────────────────────────────────── */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mt-5 flex flex-col gap-3">
        {orderSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-lime-300 bg-lime-50 px-5 py-4 text-sm font-medium text-lime-800">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-200 text-lime-700">✓</span>
            Order placed! Redirecting to payment…&nbsp;
            <Link to="/my-orders" className="underline font-bold">View orders</Link>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">!</span>
            {error}
          </div>
        )}
      </div>

      {/* ── Empty state ─────────────────────────────── */}
      {cart.length === 0 && !orderSuccess && (
        <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mt-10">
          <div className="mx-auto max-w-md rounded-2xl border border-lime-200 bg-gradient-to-br from-white via-lime-50 to-lime-100 px-8 py-14 text-center shadow-[0_8px_30px_rgba(132,204,22,0.1)]">
            <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-lime-300/25 blur-2xl" />
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D0D0D] text-lime-300 shadow-lg">
              <PackageOpen size={30} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500">Explore our eco-friendly products and add items you love.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
            >
              Browse products
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Cart + Checkout layout ───────────────────── */}
      {cart.length > 0 && !orderSuccess && (
        <div className="px-4 md:px-6 lg:px-8 pt-6 pb-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">

            {/* ── Left: cart items ──────────────────── */}
            <section className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] overflow-hidden">
              {/* header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-lime-100">
                <h2 className="text-base font-bold text-gray-900">
                  Cart items&nbsp;
                  <span className="ml-1 rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-bold text-lime-800">
                    {itemCount}
                  </span>
                </h2>
              </div>

              {/* items */}
              <ul className="divide-y divide-lime-50">
                {cart.map((item) => {
                  const p = item.product || item;
                  const price = p.price ?? 0;
                  const qty = item.quantity ?? 1;
                  const busy = updating === item._id;

                  return (
                    <li
                      key={item._id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 transition-colors ${busy ? 'opacity-60 pointer-events-none' : 'hover:bg-lime-50/40'}`}
                    >
                      {/* image */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-lime-100 bg-lime-50">
                        {getImageSrc(p.image) ? (
                          <img
                            src={getImageSrc(p.image)}
                            alt={p.title}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lime-300">
                            <ShoppingBag size={28} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{p.title}</p>
                        <p className="mt-1 text-xs text-gray-500">${price.toFixed(2)} each</p>
                      </div>

                      {/* qty stepper */}
                      <div className="flex items-center gap-1 rounded-full border border-lime-200 bg-lime-50 p-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item._id, -1)}
                          disabled={busy || qty <= 1}
                          aria-label="Decrease"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-colors hover:bg-lime-100 hover:text-lime-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="min-w-[28px] text-center text-sm font-bold text-gray-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item._id, 1)}
                          disabled={busy}
                          aria-label="Increase"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-colors hover:bg-lime-100 hover:text-lime-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* line total */}
                      <p className="w-20 text-right font-bold text-lime-700 text-sm shrink-0">
                        ${(price * qty).toFixed(2)}
                      </p>

                      {/* remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(item._id)}
                        disabled={busy}
                        aria-label="Remove"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ── Right: order summary + checkout ──── */}
            <aside className="sticky top-24 rounded-2xl border border-lime-200/80 bg-gradient-to-b from-white to-lime-50 shadow-[0_10px_35px_rgba(132,204,22,0.1)] overflow-hidden">

              {/* price summary */}
              <div className="px-6 pt-6 pb-5 border-b border-lime-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">Order summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (5%)</span>
                    <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-lime-200 pt-3">
                    <span>Total</span>
                    <span className="text-lime-700 text-base">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* checkout form */}
              <div className="px-6 py-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#0D0D0D] text-lime-300">
                    <MapPin size={13} />
                  </span>
                  Shipping details
                </h3>

                {showMapPicker && (
                  <MapAddressPicker
                    onSelect={({ address, lat, lng }) => {
                      setCheckoutForm((f) => ({ ...f, shippingAddress: address }));
                      setShippingLat(lat);
                      setShippingLng(lng);
                      setShowMapPicker(false);
                    }}
                    onClose={() => setShowMapPicker(false)}
                  />
                )}

                <form className="space-y-4" onSubmit={handleCheckout}>
                  {/* Shipping address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Shipping address *
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.shippingAddress}
                      onChange={(e) => { setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value }); setFieldErrors((f) => ({ ...f, shippingAddress: undefined })); }}
                      placeholder="Street, city, postal code"
                      required
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-200 ${fieldErrors.shippingAddress ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    {fieldErrors.shippingAddress && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.shippingAddress}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-lime-700 hover:text-lime-900 transition-colors"
                    >
                      <MapPin size={13} />
                      Pick location on map
                    </button>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={checkoutForm.phone}
                      onChange={(e) => { setCheckoutForm({ ...checkoutForm, phone: e.target.value }); setFieldErrors((f) => ({ ...f, phone: undefined })); }}
                      placeholder="+94 7x xxx xxxx"
                      required
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-200 ${fieldErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Notes
                    </label>
                    <textarea
                      value={checkoutForm.notes}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                      placeholder="Delivery instructions (optional)"
                      rows="2"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-200 resize-none"
                    />
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={placing}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                        Placing order…
                      </>
                    ) : (
                      <>
                        Place order
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* eco note */}
              <div className="mx-6 mb-5 rounded-xl border border-lime-200 bg-lime-50/70 px-4 py-3 flex items-center gap-3">
                <Leaf size={16} className="text-lime-600 shrink-0" fill="currentColor" />
                <p className="text-xs text-lime-800 leading-relaxed">
                  Every order supports local sustainable vendors and low-waste packaging.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ── Post-order continue ──────────────────────── */}
      {orderSuccess && (
        <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mt-6 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
          >
            Continue shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
