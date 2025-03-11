import axios from 'axios';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Extraire les clés API des variables d'environnement
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Vérifier que les clés API sont présentes
if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
  console.error('Erreur: Les clés API Google sont manquantes dans le fichier .env');
}

// Interface pour les caractéristiques du vêtement
interface ClothingFeatures {
  category: string;
  color: {
    primary: string;
    secondary?: string;
  };
  pattern?: string;
  style?: string;
  [key: string]: any;
}

// Interface pour les résultats de recherche
interface SearchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  source: string;
}

/**
 * Convertir les caractéristiques du vêtement en termes de recherche
 */
const buildSearchQuery = (features: ClothingFeatures): string => {
  console.log('Construction de la requête de recherche à partir des caractéristiques:', features);
  
  let query = `${features.color.primary} ${features.category}`;
  
  if (features.pattern) {
    query += ` ${features.pattern}`;
  }
  
  if (features.style) {
    query += ` ${features.style}`;
  }

  if (features.color.secondary) {
    query += ` ${features.color.secondary}`;
  }

  // Ajouter des termes supplémentaires pour améliorer les résultats
  query += ' acheter vêtement';
  
  console.log('Requête de recherche construite:', query);
  return query;
};

/**
 * Rechercher des produits similaires avec l'API Google Custom Search
 */
export const searchSimilarProducts = async (features: ClothingFeatures): Promise<SearchResult[]> => {
  try {
    console.log('Démarrage de la recherche de produits similaires...');
    console.log('Clé API Google utilisée:', GOOGLE_API_KEY ? 'Présente' : 'Manquante');
    console.log('ID de moteur de recherche Google utilisé:', GOOGLE_SEARCH_ENGINE_ID ? 'Présent' : 'Manquant');
    
    // Construire la requête de recherche à partir des caractéristiques
    const query = buildSearchQuery(features);
    
    // Appeler l'API Google Custom Search
    console.log('Appel de l\'API Google Search...');
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: 10
      },
    });

    console.log('Réponse reçue de Google Search:', 
      response.data.items ? `${response.data.items.length} résultats trouvés` : 'Aucun résultat');

    // Vérifier si nous avons des résultats
    if (!response.data.items || response.data.items.length === 0) {
      console.log('Aucun résultat trouvé pour la requête:', query);
      return [];
    }

    // Transformer les résultats en format standard
    const products: SearchResult[] = response.data.items.map((item: any, index: number) => {
      // Extraire les informations pertinentes
      // Note: Dans un cas réel, ces informations seraient extraites des métadonnées des produits
      const nameMatch = item.title.split('|')[0] || item.title.split('-')[0] || item.title;
      const brandMatch = (item.title.split('|')[1] || '').trim();
      
      // Objet résultat
      const result = {
        id: `google-${index}-${Date.now()}`,
        name: nameMatch.trim(),
        brand: brandMatch || 'Marque inconnue',
        price: Math.floor(Math.random() * 80) + 20, // Prix aléatoire pour la démonstration
        currency: '€',
        imageUrl: item.pagemap?.cse_image?.[0]?.src || 
                 item.pagemap?.cse_thumbnail?.[0]?.src || 
                 'https://via.placeholder.com/300x400?text=Image+Non+Disponible',
        productUrl: item.link,
        source: item.displayLink || 'Google Shopping'
      };
      
      return result;
    });

    console.log(`${products.length} produits transformés et prêts à être affichés`);
    return products;
  } catch (error: any) {
    console.error('Erreur lors de la recherche de produits similaires:', error.message);
    if (error.response) {
      console.error('Détails de l\'erreur:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('Échec de la recherche de produits');
  }
};

/**
 * Rechercher des produits similaires à partir d'une image
 * Cette fonction serait appelée après l'analyse de l'image par le service ML
 */
export const searchProductsFromImage = async (imageFeatures: ClothingFeatures): Promise<SearchResult[]> => {
  console.log('Recherche de produits à partir des caractéristiques de l\'image:', imageFeatures);
  return searchSimilarProducts(imageFeatures);
};