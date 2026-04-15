const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const issueRoutes = require('./routes/issueRoutes');
const indentRoutes = require('./routes/indentRoutes');
const poRoutes = require('./routes/poRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const gateEntryRoutes = require('./routes/gateEntryRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/indent', indentRoutes);
app.use('/api/purchase-order', poRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/gate-entry', gateEntryRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
