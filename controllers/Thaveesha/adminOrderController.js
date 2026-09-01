import mongoose from 'mongoose';
import Order from '../../models/Thaveesha/Order.js';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const ORDER_POPULATE = [
  { path: 'user', select: 'name email' },
  { path: 'items.product', select: 'title price image' },
];

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && VALID_STATUSES.includes(status) ? { status } : {};
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const [orders, total] = await Promise.all([
      Order.find(filter).populate(ORDER_POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (error) {
    console.error('Admin get all orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(ORDER_POPULATE).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Admin get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const orderId = new mongoose.Types.ObjectId(req.params.id);
    const rawOrder = await Order.collection.findOne({ _id: orderId });

    if (!rawOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (rawOrder.status === 'delivered' && status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }
    if (rawOrder.status === 'cancelled' && rawOrder.cancelledBy === 'user') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change an order that was cancelled by the customer',
      });
    }

    const updateFields = { status };
    updateFields.cancelledBy = status === 'cancelled' ? 'admin' : null;

    await Order.collection.updateOne({ _id: orderId }, { $set: updateFields });

    const populated = await Order.findById(orderId).populate(ORDER_POPULATE).lean();
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: populated,
    });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};
