import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { serve as swaggerServe, setup as swaggerSetup } from 'swagger-ui-express';
import connectDB from './config/db.js';
import { loadOpenApiSpec } from './config/loadOpenApi.js';
import authRoutes from './routes/Tudakshana/authRoutes.js';
import adminRoutes from './routes/Tudakshana/adminRoutes.js';
import productRoutes from './routes/Lakna/productRoutes.js';
import cartRoutes from './routes/Thaveesha/cartRoutes.js';
import orderRoutes from './routes/Thaveesha/orderRoutes.js';
import adminOrderRoutes from './routes/Thaveesha/adminOrderRoutes.js';
import paymentRoutes from './routes/Tudakshana/paymentRoutes.js';
import reviewRoutes from './routes/Senara/reviewRoutes.js';

dotenv.config();

const app = express();

// CORS Configuration
const normalizeOrigin = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value.trim().replace(/\/$/, '');
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sliit-af-backend.vercel.app',
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('uploads')));

// OpenAPI / Swagger UI
try {
  const openApiSpec = loadOpenApiSpec();
  app.get('/api-docs.json', (req, res) => {
    res.json(openApiSpec);
  });
  app.use(
    '/api-docs',
    swaggerServe,
    swaggerSetup(openApiSpec, {
      customSiteTitle: 'EcoMart API — Swagger',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
} catch (err) {
  console.warn('Swagger UI not mounted:', err.message);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/senara/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Thaama Panapitin Sandamaaali !',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server is running Succefully !',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Do not start server when running integration tests (supertest uses app directly)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;