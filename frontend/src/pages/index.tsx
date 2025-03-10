import React, { useState } from 'react';
import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

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

  const onDrop = (acceptedFiles: File[]) => {
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
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
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
      } else {
        setError('Aucun résultat trouvé');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Une erreur est survenue lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Visual Fashion Finder</title>
        <meta name="description" content="Trouvez des vêtements similaires à partir d'une photo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Visual Fashion Finder</h1>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="flex flex-col items-center">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 max-w-full mb-4 rounded" 
                />
                <p className="text-sm text-gray-500">Cliquez ou glissez-déposez pour changer d'image</p>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-2">Glissez-déposez une image de vêtement ici</p>
                <p className="text-sm text-gray-500">ou cliquez pour sélectionner un fichier</p>
              </div>
            )}
          </div>

          <button
            onClick={searchProducts}
            disabled={!file || loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Recherche en cours...' : 'Rechercher des produits similaires'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">Résultats ({results.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <a 
                  key={product.id} 
                  href={product.productUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="font-bold text-blue-600">
                      {product.price} {product.currency}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">{product.source}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Visual Fashion Finder</p>
      </footer>
    </div>
  );
}