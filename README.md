# Visual Fashion Finder

Application web permettant de retrouver des vêtements similaires à partir d'une photo.

## Fonctionnalités

- Téléchargement de photos de vêtements
- Reconnaissance des caractéristiques du vêtement (couleur, motif, style, etc.)
- Recherche de produits similaires sur différentes plateformes e-commerce
- Interface responsive pour mobile et desktop

## Architecture technique

### Frontend
- React.js avec Next.js
- Tailwind CSS
- Axios pour les requêtes API

### Backend
- Node.js avec Express
- Python avec FastAPI (microservice de traitement d'image)
- MongoDB

### Reconnaissance d'image
- TensorFlow/Keras
- Modèles pré-entraînés (ResNet, EfficientNet)

### Recherche de produits
- API Google Shopping
- APIs e-commerce spécifiques

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/hautex/visual-fashion-finder.git
cd visual-fashion-finder

# Installation des dépendances frontend
cd frontend
npm install

# Installation des dépendances backend
cd ../backend
npm install

# Installation des dépendances Python pour le traitement d'image
cd ../ml-service
pip install -r requirements.txt
```

## Lancement du projet en développement

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd ../backend
npm run dev

# Service ML
cd ../ml-service
python app.py
```

## Structure du projet

```
visual-fashion-finder/
├── frontend/                 # Application React/Next.js
├── backend/                  # API Node.js/Express
├── ml-service/               # Service Python/FastAPI pour l'IA
├── docs/                     # Documentation
└── docker/                   # Configuration Docker
```

## Roadmap

1. MVP avec reconnaissance basique et recherche limitée
2. Amélioration du modèle de reconnaissance
3. Intégration de plus de plateformes e-commerce
4. Fonctionnalités utilisateur avancées (historique, favoris)
5. Recommandations de style personnalisées