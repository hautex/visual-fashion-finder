import os
import io
import numpy as np
import logging
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("fashion-ml-service")

# In a real application, you would import TensorFlow/PyTorch here
# import tensorflow as tf
# from tensorflow.keras.applications import ResNet50, preprocess_input
# from tensorflow.keras.preprocessing.image import img_to_array

app = FastAPI(title="Fashion Recognition Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model would be loaded here in a real application
# model = ResNet50(weights='imagenet', include_top=False, pooling='avg')

class FeatureResponse(BaseModel):
    features: Dict[str, Any]
    category: str
    confidence: float

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Fashion Recognition Service is running"}

@app.post("/extract-features", response_model=FeatureResponse)
async def extract_features(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename}, content-type: {file.content_type}")
    
    if not file.content_type.startswith("image/"):
        logger.error(f"Invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="File provided is not an image")

    try:
        # Read image
        logger.info("Reading image data")
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        logger.info(f"Image size: {image.size}, mode: {image.mode}")
        
        # In a real application, you would process the image and extract features here
        # image = image.resize((224, 224))
        # img_array = img_to_array(image)
        # img_array = np.expand_dims(img_array, axis=0)
        # img_array = preprocess_input(img_array)
        # features = model.predict(img_array)

        # Simple color analysis (very basic)
        logger.info("Analyzing image colors")
        try:
            # Convert to RGB if not already
            if image.mode != "RGB":
                image = image.convert("RGB")
                
            # Get average color
            image_array = np.array(image)
            avg_color = np.mean(image_array, axis=(0, 1))
            
            # Very simple color categorization
            r, g, b = avg_color
            
            # Identify primary color (extremely simplified)
            if r > g and r > b:
                primary_color = "red"
            elif g > r and g > b:
                primary_color = "green"
            elif b > r and b > g:
                primary_color = "blue"
            else:
                if r > 200 and g > 200 and b > 200:
                    primary_color = "white"
                elif r < 50 and g < 50 and b < 50:
                    primary_color = "black"
                else:
                    primary_color = "mixed"
                    
            logger.info(f"Detected primary color: {primary_color}")
            
            # For demonstration, we'll use a basic feature set
            mock_features = {
                "color": {
                    "primary": primary_color,
                    "secondary": "white" if primary_color != "white" else "black"
                },
                "pattern": "solid",
                "style": "casual",
                "neckline": "round",
                "sleeve": "short"
            }
            
        except Exception as color_error:
            logger.error(f"Error analyzing colors: {str(color_error)}")
            # Fallback to mock data
            mock_features = {
                "color": {
                    "primary": "blue",
                    "secondary": "white"
                },
                "pattern": "solid",
                "style": "casual",
                "neckline": "round",
                "sleeve": "short"
            }

        logger.info("Generating response")
        response = {
            "features": mock_features,
            "category": "t-shirt",
            "confidence": 0.92
        }
        
        logger.info(f"Response: {response}")
        return response

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting Fashion Recognition Service")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)