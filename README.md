# Flood & Cyclone Risk Prediction System

A hybrid machine learning system for predicting Flood and Cyclone risk states with automatic severity scoring.

## Project Structure

```
Prediction-backend/
├── ml_service/          # Python ML Service (Flask API)
│   ├── src/
│   │   ├── app.py      # Flask API server
│   │   ├── predict.py  # Prediction functions
│   │   ├── train.py    # Model training
│   │   └── primary_prediction_model.py  # Preprocessing & model logic
│   ├── model/          # Trained models (.pkl files)
│   ├── data/           # Training data
│   └── requirements.txt
│
└── backend-server/      # Node.js Backend Server
    ├── index.js        # Express API server
    └── package.json
```

## Features

- **Flood Risk Prediction**: Predicts flood state (0=Low, 1=Medium, 2=High)
- **Cyclone Risk Prediction**: Predicts cyclone state (0=Low, 1=Medium, 2=High)
- **Severity Scoring**: Automatic calculation of flood and cyclone severity scores
- **Probability Scores**: Optional probability scores for predictions
- **RESTful API**: Easy-to-use API endpoints

## Setup Instructions

### Prerequisites

- Python 3.8+ 
- Node.js 18+ (for fetch API support)
- pip (Python package manager)
- npm (Node.js package manager)

### 1. ML Service Setup (Python)

```bash
# Navigate to ml_service directory
cd ml_service

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start ML Service
cd src
python app.py
```

ML Service will run on `http://localhost:5000`

### 2. Backend Server Setup (Node.js)

```bash
# Navigate to backend-server directory
cd backend-server

# Install dependencies
npm install

# Create .env file (optional)
# PORT=3000
# HOST=0.0.0.0
# ML_SERVICE_URL=http://localhost:5000

# Start Backend Server
npm start
```

Backend Server will run on `http://localhost:3000`

## API Documentation

### ML Service Endpoints (Port 5000)

#### Health Check
```http
GET /health
```

#### Single Prediction
```http
POST /predict
Content-Type: application/json

{
  "TOTRF": 150.5,
  "RD": 12.3,
  "RH": 85.2,
  "DBT": 28.5,
  "MWS": 45.0,
  "MSLP": 980.5
}
```

**Response:**
```json
{
  "success": true,
  "predictions": {
    "Flood_State": 1,
    "Cyclone_State": 2,
    "Flood_Severity": 0.65,
    "Cyclone_Severity": 0.82
  }
}
```

#### Prediction with Probabilities
```http
POST /predict?probabilities=true
Content-Type: application/json

{
  "TOTRF": 150.5,
  "RD": 12.3,
  "RH": 85.2,
  "DBT": 28.5,
  "MWS": 45.0,
  "MSLP": 980.5
}
```

**Response:**
```json
{
  "success": true,
  "predictions": {
    "Flood_State": 1,
    "Cyclone_State": 2,
    "Flood_Probability": 0.75,
    "Cyclone_Probability": 0.88,
    "Flood_Severity": 0.65,
    "Cyclone_Severity": 0.82
  }
}
```

#### Batch Prediction
```http
POST /predict/batch
Content-Type: application/json

[
  {
    "TOTRF": 150.5,
    "RD": 12.3,
    "RH": 85.2,
    "DBT": 28.5,
    "MWS": 45.0,
    "MSLP": 980.5
  },
  {
    "TOTRF": 200.0,
    "RD": 15.0,
    "RH": 90.0,
    "DBT": 30.0,
    "MWS": 60.0,
    "MSLP": 970.0
  }
]
```

### Backend Server Endpoints (Port 3000)

#### Health Check
```http
GET /health
```

#### Single Prediction
```http
POST /api/predict
Content-Type: application/json

{
  "TOTRF": 150.5,
  "RD": 12.3,
  "RH": 85.2,
  "DBT": 28.5,
  "MWS": 45.0,
  "MSLP": 980.5
}
```

#### Prediction with Probabilities
```http
POST /api/predict/with-probabilities
Content-Type: application/json

{
  "TOTRF": 150.5,
  "RD": 12.3,
  "RH": 85.2,
  "DBT": 28.5,
  "MWS": 45.0,
  "MSLP": 980.5
}
```

#### Batch Prediction
```http
POST /api/predict/batch
Content-Type: application/json

[
  {
    "TOTRF": 150.5,
    "RD": 12.3,
    "RH": 85.2,
    "DBT": 28.5,
    "MWS": 45.0,
    "MSLP": 980.5
  }
]
```

## Required Input Features

- **TOTRF**: Total Rainfall (mm)
- **RD**: Rainfall Duration (hours)
- **RH**: Relative Humidity (%)
- **DBT**: Dry Bulb Temperature (°C)
- **MWS**: Maximum Wind Speed (km/h)
- **MSLP**: Mean Sea Level Pressure (hPa)

**Note**: Additional features from your training data can also be included. The model will automatically handle them.

## Prediction Output

- **Flood_State**: 0 (Low), 1 (Medium), 2 (High)
- **Cyclone_State**: 0 (Low), 1 (Medium), 2 (High)
- **Flood_Severity**: Severity score (0-1 range)
- **Cyclone_Severity**: Severity score (0-1 range)
- **Flood_Probability**: Probability of flood risk (when requested)
- **Cyclone_Probability**: Probability of cyclone risk (when requested)

## Model Training

To train a new model:

```bash
cd ml_service/src
python train.py
```

The trained model will be saved in `ml_service/model/` with format `model_DD_MM_YY_X.pkl`

## Testing the API

### Using cURL

```bash
# Test ML Service
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "TOTRF": 150.5,
    "RD": 12.3,
    "RH": 85.2,
    "DBT": 28.5,
    "MWS": 45.0,
    "MSLP": 980.5
  }'

# Test Backend Server
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "TOTRF": 150.5,
    "RD": 12.3,
    "RH": 85.2,
    "DBT": 28.5,
    "MWS": 45.0,
    "MSLP": 980.5
  }'
```

### Using Python

```python
import requests

url = "http://localhost:3000/api/predict"
data = {
    "TOTRF": 150.5,
    "RD": 12.3,
    "RH": 85.2,
    "DBT": 28.5,
    "MWS": 45.0,
    "MSLP": 980.5
}

response = requests.post(url, json=data)
print(response.json())
```

## Environment Variables

### ML Service (.env)
```
PORT=5000
HOST=0.0.0.0
DEBUG=false
```

### Backend Server (.env)
```
PORT=3000
HOST=0.0.0.0
ML_SERVICE_URL=http://localhost:5000
```

## Troubleshooting

1. **Model not found**: Ensure `model/model_*.pkl` file exists in `ml_service/model/`
2. **Port already in use**: Change PORT in .env file
3. **ML Service connection error**: Check if ML Service is running on correct port
4. **Missing dependencies**: Run `pip install -r requirements.txt` and `npm install`

## License

ISC

