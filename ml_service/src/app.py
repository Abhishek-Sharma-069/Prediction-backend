# Flask API Server for ML Model Predictions
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pathlib import Path

from predict import predict_from_dict

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ML Prediction Service"
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict Flood and Cyclone states from input data.
    
    Expected JSON body:
    {
        "TOTRF": float,
        "RD": float,
        "RH": float,
        "DBT": float,
        "MWS": float,
        "MSLP": float,
        ... (other features)
    }
    
    Or for multiple records:
    [
        {"TOTRF": float, ...},
        {"TOTRF": float, ...}
    ]
    
    Query parameters:
    - probabilities: true/false (default: false) - include probability scores
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "No data provided",
                "message": "Please provide JSON data in request body"
            }), 400
        
        # Get probabilities parameter
        probabilities = request.args.get('probabilities', 'false').lower() == 'true'
        
        # Make prediction
        result = predict_from_dict(data, probabilities=probabilities)
        
        return jsonify({
            "success": True,
            "predictions": result
        }), 200
        
    except FileNotFoundError as e:
        return jsonify({
            "error": "Model not found",
            "message": str(e)
        }), 404
    except Exception as e:
        return jsonify({
            "error": "Prediction failed",
            "message": str(e)
        }), 500


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict for multiple records at once.
    
    Expected JSON body:
    [
        {"TOTRF": float, "RD": float, ...},
        {"TOTRF": float, "RD": float, ...}
    ]
    """
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({
                "error": "Invalid data format",
                "message": "Please provide a list of records"
            }), 400
        
        probabilities = request.args.get('probabilities', 'false').lower() == 'true'
        result = predict_from_dict(data, probabilities=probabilities)
        
        return jsonify({
            "success": True,
            "count": len(result),
            "predictions": result
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "Batch prediction failed",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    print(f"Starting ML Prediction Service on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

