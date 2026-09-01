import mongoose from 'mongoose';
import Cart from '../../models/Thaveesha/Cart.js';
import Product from '../../models/Lakna/Product.js';

const isValidObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

const CART_POPULATE = { path: 'items.product', select: 'title price image' };

function formatCartItems(cart) {
  const items = (cart?.items || []).map((item) => ({
    _id: item._id,
    product: item.product
      ? {
          _id: item.product._id,
          title: item.product.title,
          price: item.product.price,
          image: item.product.image,
        }
      : null,
    quantity: item.quantity,
  }));
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  return { items, totalItems };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate({
    ...CART_POPULATE,
    match: { isActive: true },
  });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const validItems = (cart.items || []).filter((item) => item.product);
    if (validItems.length !== (cart.items || []).length) {
      cart.items = validItems;
      await cart.save();
    }
    const result = formatCartItems(cart);
    res.status(200).json(result);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to get cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }
    await cart.save();

    const updated = await Cart.findOne({ user: userId }).populate(CART_POPULATE);
    const { items } = formatCartItems(updated);
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to cart', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Item ID and quantity are required' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    item.quantity = qty;
    await cart.save();

    const updated = await Cart.findOne({ user: userId }).populate(CART_POPULATE);
    const { items } = formatCartItems(updated);
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart', error: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    cart.items.pull(itemId);
    await cart.save();

    const updated = await Cart.findOne({ user: userId }).populate(CART_POPULATE);
    const { items } = formatCartItems(updated);
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item', error: error.message });
  }
};
