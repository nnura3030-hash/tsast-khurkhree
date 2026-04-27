require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const productionOrigins = (process.env.CORS_ORIGINS || 'https://byl.mn,https://www.byl.mn')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No origin (mobile/curl/server-to-server) → allow
      if (!origin) return callback(null, true);
      // Any localhost port → allow in development
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      // Production domains
      if (productionOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gers', require('./routes/gerRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/trip-bookings', require('./routes/tripBookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/product-bookings', require('./routes/productBookingRoutes'));
app.use('/api/food-bookings', require('./routes/foodBookingRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/GerConnect')
  .then(() => {
    console.log('-----------------------------------------');
    console.log('MongoDB connection successful');
    console.log(
      `Database Connection: ${process.env.MONGODB_URI ? 'Remote/Env' : 'Local/GerConnect'}`
    );
    console.log('-----------------------------------------');
  })
  .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
