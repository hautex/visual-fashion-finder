import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont acceptées'));
    }
    cb(null, true);
  },
});

// Routes
app.get('/', (req, res) => {
  res.send('Visual Fashion Finder API is running');
});

// Mock endpoint for product search
app.post('/api/search', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image fournie' });
  }

  // In a real application, this would call the ML service
  // and then search for products using external APIs

  // Mock response for demonstration
  setTimeout(() => {
    res.json({
      products: [
        {
          id: '1',
          name: 'T-shirt premium coton bio',
          brand: 'EcoFashion',
          price: 29.99,
          currency: '€',
          imageUrl: 'https://via.placeholder.com/300x400?text=T-shirt',
          productUrl: 'https://example.com/product/1',
          source: 'EcoFashion Store'
        },
        {
          id: '2',
          name: 'T-shirt col rond classique',
          brand: 'BasicWear',
          price: 19.99,
          currency: '€',
          imageUrl: 'https://via.placeholder.com/300x400?text=T-shirt+2',
          productUrl: 'https://example.com/product/2',
          source: 'Fashion Marketplace'
        },
        {
          id: '3',
          name: 'T-shirt à motif graphique',
          brand: 'UrbanStyle',
          price: 24.99,
          currency: '€',
          imageUrl: 'https://via.placeholder.com/300x400?text=T-shirt+3',
          productUrl: 'https://example.com/product/3',
          source: 'UrbanStyle Official'
        },
        {
          id: '4',
          name: 'T-shirt oversize coupe moderne',
          brand: 'TrendyBrands',
          price: 34.99,
          currency: '€',
          imageUrl: 'https://via.placeholder.com/300x400?text=T-shirt+4',
          productUrl: 'https://example.com/product/4',
          source: 'TrendyBrands Outlet'
        }
      ]
    });
  }, 1500); // Simulate network delay
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});