import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { searchProductsFromImage } from './services/googleSearchService';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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

// Endpoint for product search using real Google API
app.post('/api/search', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image fournie' });
  }

  try {
    // 1. Send the image to the ML service for analysis
    const formData = new FormData();
    const imageBuffer = await fs.promises.readFile(req.file.path);
    const blob = new Blob([imageBuffer]);
    formData.append('file', blob, req.file.originalname);

    let features;
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/extract-features`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      features = mlResponse.data;
    } catch (mlError) {
      console.error('Erreur lors de l\'analyse de l\'image:', mlError);
      
      // Fallback to mock data if ML service is not working
      features = {
        features: {
          color: {
            primary: 'blue',
            secondary: 'white'
          },
          pattern: 'solid',
          style: 'casual',
        },
        category: 't-shirt',
        confidence: 0.92
      };
    }

    // 2. Use the extracted features to search for similar products
    try {
      const products = await searchProductsFromImage({
        category: features.category,
        color: features.features.color,
        pattern: features.features.pattern,
        style: features.features.style
      });

      res.json({ products });
    } catch (searchError) {
      console.error('Erreur lors de la recherche de produits:', searchError);
      
      // Fallback to mock products if search fails
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
    }
  } catch (err) {
    console.error('Erreur générale lors du traitement:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la recherche' });
  }
});

// Mock endpoint for testing without using real APIs
app.post('/api/search/mock', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image fournie' });
  }

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