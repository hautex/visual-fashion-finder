import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Icônes SVG pour une meilleure UI
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 absolute top-2 right-2 transform transition-all duration-300 hover:scale-110 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
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
  const [debug, setDebug] = useState<any>(null);
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
      setDebug(null);
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
    setDebug(null);

    try {
      console.log('Préparation de la recherche avec le fichier:', file.name);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('image', file);

      console.log('Envoi de la requête au backend...');
      // Note: In a real implementation, you'd use your actual API endpoint
      const response = await axios.post('http://localhost:3001/api/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Réponse reçue du backend:', response.data);

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
        setDebug(response.data);
      }
    } catch (err: any) {
      console.error('Error searching products:', err);
      setError('Une erreur est survenue lors de la recherche. Vérifiez que tous les services sont bien démarrés.');
      
      // Capture detailed error info for debugging
      if (err.response) {
        console.error('Error details:', err.response.data);
        setDebug({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      } else if (err.request) {
        console.error('No response received');
        setDebug({
          message: 'Aucune réponse du serveur - vérifiez que le backend est démarré',
          request: 'Request sent but no response'
        });
      } else {
        console.error('Error setting up request');
        setDebug({
          message: 'Erreur lors de la configuration de la requête',
          error: err.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <Head>
        <title>Fashion Finder | Trouvez des vêtements similaires</title>
        <meta name="description" content="Trouvez des vêtements similaires à partir d'une photo" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <header className="border-b border-pink-100 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-900 flex items-center">
            <span className="text-pink-600 mr-2">👗</span> 
            Fashion Finder
          </h1>
          <div className="text-pink-600 font-medium text-sm bg-pink-50 px-3 py-1 rounded-full">
            Trouvez vos vêtements favoris
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto text-center mb-10 bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Trouvez des vêtements similaires en un clic
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Téléchargez simplement la photo d'un vêtement et nous vous aiderons à trouver des produits similaires disponibles à l'achat.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-16 transition-all duration-300 transform hover:shadow-2xl">
          <div className="p-8">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                dropActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 group">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-80 max-w-full rounded-xl shadow-md transition duration-300 group-hover:shadow-lg" 
                    />
                    <div className="absolute inset-0 bg-pink-900 bg-opacity-0 rounded-xl group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                        Changer d'image
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Cliquez ou glissez-déposez pour changer d'image</p>
                </div>
              ) : (
                <div className="py-10">
                  <CameraIcon />
                  <p className="text-xl font-medium text-gray-800 mb-2">
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
              className={`w-full mt-8 flex items-center justify-center font-medium py-4 px-6 rounded-xl transition-all duration-300 text-lg ${
                !file || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg'
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
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span>{error}</span>
                  
                  {debug && (
                    <div className="mt-3 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      <p className="font-semibold mb-1">Informations de débogage:</p>
                      <pre>{JSON.stringify(debug, null, 2)}</pre>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm">
                    <p>Vérifiez que:</p>
                    <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                      <li>Tous les services (frontend, backend, ml-service) sont démarrés</li>
                      <li>Le fichier .env contient les clés API Google</li>
                      <li>L'image est un format valide (JPG, PNG)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div id="results" className="mt-8 scroll-mt-8 mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">Résultats pour votre recherche</span>
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
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
                  className="group block bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x400?text=Image+Non+Disponible';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white">
                      <div className="text-xs font-medium opacity-90">{product.source}</div>
                    </div>
                    <HeartIcon />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-pink-600">{product.brand}</p>
                      <div className="flex items-center">
                        <ShoppingBagIcon />
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">{product.name}</h3>
                    <p className="font-bold text-lg text-pink-900">
                      {product.price} {product.currency}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center text-xs font-medium text-pink-600 group-hover:text-pink-800 transition-colors">
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

      <footer className="bg-gradient-to-r from-pink-900 to-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <span className="text-pink-300 mr-2">👗</span> 
                Fashion Finder
              </h3>
              <p className="text-pink-200 text-sm">
                Trouvez facilement des vêtements similaires grâce à la reconnaissance d'image
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex space-x-4 mb-4 justify-center md:justify-end">
                <a href="#" className="text-pink-200 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-pink-200 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <p className="text-pink-200 text-sm">
                © {new Date().getFullYear()} Fashion Finder. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}