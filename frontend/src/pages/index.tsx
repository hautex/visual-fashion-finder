import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Icônes SVG pour une meilleure UI
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  source: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      // Reset states
      setResults([]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDragEnter: () => setDropActive(true),
    onDragLeave: () => setDropActive(false),
    onDropAccepted: () => setDropActive(false),
    onDropRejected: () => setDropActive(false),
  });

  const searchProducts = async () => {
    if (!file) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('image', file);

      // Note: In a real implementation, you'd use your actual API endpoint
      const response = await axios.post('http://localhost:3001/api/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.products) {
        setResults(response.data.products);
        
        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('results');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        setError('Aucun résultat trouvé');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Une erreur est survenue lors de la recherche. Vérifiez que tous les services sont bien démarrés.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Head>
        <title>Fashion Finder | Trouvez des vêtements similaires</title>
        <meta name="description" content="Trouvez des vêtements similaires à partir d'une photo" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="border-b border-indigo-100 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-900 flex items-center">
            <span className="text-indigo-600 mr-2">👗</span> 
            Fashion Finder
          </h1>
          <div className="text-indigo-600 font-medium text-sm">
            Trouvez vos vêtements favoris
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Trouvez des vêtements similaires en un clic
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Téléchargez simplement la photo d'un vêtement et nous vous aiderons à trouver des produits similaires disponibles à l'achat.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden mb-16 transition-all duration-300 transform hover:shadow-2xl">
          <div className="p-8">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                dropActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 group">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-64 max-w-full rounded-lg shadow-md transition duration-300 group-hover:shadow-lg" 
                    />
                    <div className="absolute inset-0 bg-indigo-900 bg-opacity-0 rounded-lg group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                        Changer d'image
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Cliquez ou glissez-déposez pour changer d'image</p>
                </div>
              ) : (
                <div className="py-6">
                  <CameraIcon />
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    Glissez-déposez une image de vêtement ici
                  </p>
                  <p className="text-sm text-gray-500">
                    ou cliquez pour sélectionner un fichier (JPG, PNG, WEBP)
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={searchProducts}
              disabled={!file || loading}
              className={`w-full mt-6 flex items-center justify-center font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
                !file || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <SearchIcon />
                  Rechercher des produits similaires
                </>
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div id="results" className="mt-8 scroll-mt-8 mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">Résultats pour votre recherche</span>
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {results.length} trouvés
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <a 
                  key={product.id} 
                  href={product.productUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent text-white">
                      <div className="text-xs font-medium opacity-90">{product.source}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-indigo-600">{product.brand}</p>
                      <div className="flex items-center">
                        <ShoppingBagIcon />
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">{product.name}</h3>
                    <p className="font-bold text-lg text-indigo-900">
                      {product.price} {product.currency}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center text-xs font-medium text-indigo-600 group-hover:text-indigo-800 transition-colors">
                        Voir le produit
                        <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-indigo-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Fashion Finder</h3>
              <p className="text-indigo-200 text-sm">
                Trouvez facilement des vêtements similaires grâce à la reconnaissance d'image
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-indigo-200 text-sm">
                © {new Date().getFullYear()} Fashion Finder. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}