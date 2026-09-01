import Order from '../../models/Thaveesha/Order.js';
import Cart from '../../models/Thaveesha/Cart.js';
import Product from '../../models/Lakna/Product.js';

function parseQuantity(value, defaultVal = 1) {
  return Math.max(1, parseInt(value, 10) || defaultVal);
}

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, phone, notes, shippingLat, shippingLng } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }
    if (!shippingAddress?.trim() || !phone) {
      return res.status(400).json({ success: false, message: 'Shipping address and phone are required' });
    }

    const orderItems = [];
    let total = 0;

    for (const line of items) {
      const productId = line.productId || line.product;
      const quantity = parseQuantity(line.quantity);
      const product = await Product.findById(productId).select('price title stock');
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${productId}` });
      }
      if (product.stock != null && product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`,
        });
      }
      orderItems.push({
        product: productId,
        quantity,
        priceSnapshot: product.price,
      });
      total += product.price * quantity;
    }

    const payload = {
      user: userId,
      items: orderItems,
      total,
      status: 'pending',
      shippingAddress: shippingAddress.trim(),
      phone: String(phone).trim(),
      notes: (notes && String(notes).trim()) || '',
    };
    if (shippingLat != null && shippingLng != null) {
      payload.shippingLat = Number(shippingLat);
      payload.shippingLng = Number(shippingLng);
    }

    const order = await Order.create(payload);

    for (const line of orderItems) {
      await Product.findByIdAndUpdate(line.product, { $inc: { stock: -line.quantity } });
    }
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    const populated = await Order.findById(order._id).populate('items.product', 'title price image').lean();
    res.status(201).json({ success: true, message: 'Order placed successfully', order: populated });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'title price image')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'title price image')
      .lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled (current status: ${order.status})`,
      });
    }

    await Order.collection.updateOne(
      { _id: order._id },
      { $set: { status: 'cancelled', cancelledBy: 'user' } }
    );

    for (const line of order.items) {
      await Product.findByIdAndUpdate(line.product, { $inc: { stock: line.quantity } });
    }

    const populated = await Order.findById(order._id)
      .populate('items.product', 'title price image')
      .lean();
    res.status(200).json({ success: true, message: 'Order cancelled', order: populated });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
};
