# Quick Start Guide

## Step 1: Start ML Service (Python)

```bash
# Terminal 1
cd ml_service
pip install -r requirements.txt
cd src
python app.py
```

✅ ML Service running on `http://localhost:5000`

## Step 2: Start Backend Server (Node.js)

```bash
# Terminal 2
cd backend-server
npm install
npm start
```

✅ Backend Server running on `http://localhost:3000`

## Step 3: Test the API

### Using Browser/Postman:
```
POST http://localhost:3000/api/predict
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

### Using cURL:
```bash
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

### Expected Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "predictions": {
      "Flood_State": 1,
      "Cyclone_State": 2,
      "Flood_Severity": 0.65,
      "Cyclone_Severity": 0.82
    }
  }
}
```

## Troubleshooting

- **ML Service not starting**: Check if port 5000 is available
- **Backend Server error**: Make sure ML Service is running first
- **Model not found**: Ensure `ml_service/model/model_*.pkl` exists
- **Module not found**: Run `pip install -r requirements.txt` and `npm install`

