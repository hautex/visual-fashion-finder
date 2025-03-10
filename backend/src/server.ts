import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
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

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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
    console.log(`Image reçue: ${req.file.path}`);
    
    // 1. Send the image to the ML service for analysis
    let features;
    try {
      // Create a FormData object for Node.js
      const formData = new FormData();
      // Append the file from disk
      formData.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      
      console.log('Envoi de l\'image au service ML...');
      
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/extract-features`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      
      features = mlResponse.data;
      console.log('Caractéristiques extraites:', JSON.stringify(features, null, 2));
      
    } catch (mlError) {
      console.error('Erreur lors de l\'analyse de l\'image:', mlError.message);
      
      // Fallback to mock data if ML service is not working
      console.log('Utilisation de données fictives pour les caractéristiques...');
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
      console.log('Recherche de produits similaires...');
      const products = await searchProductsFromImage({
        category: features.category,
        color: features.features.color,
        pattern: features.features.pattern,
        style: features.features.style
      });

      console.log(`${products.length} produits trouvés`);
      res.json({ products });
      
    } catch (searchError) {
      console.error('Erreur lors de la recherche de produits:', searchError.message);
      
      // Fallback to mock products if search fails
      console.log('Utilisation de produits fictifs...');
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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`ML Service URL: ${ML_SERVICE_URL}`);
});