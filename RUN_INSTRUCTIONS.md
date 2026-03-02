# 🚀 Project चलाने के लिए Instructions

## Windows पर Run करने के तरीके:

### **Method 1: Batch Files (सबसे आसान)** ⭐

1. **ML Service चलाएं:**
   - `run-ml-service.bat` file पर double-click करें
   - या Command Prompt में: `run-ml-service.bat`
   - यह `http://localhost:5000` पर चलेगा

2. **Backend Server चलाएं:**
   - नया Command Prompt/Terminal खोलें
   - `run-backend.bat` file पर double-click करें
   - या Command Prompt में: `run-backend.bat`
   - यह `http://localhost:3000` पर चलेगा

---

### **Method 2: Manual Commands (Step by Step)**

#### **Step 1: ML Service Start करें**

```powershell
# Terminal 1 में
cd "C:\Users\Muskan Singh\Desktop\final year\Prediction-backend\ml_service"
pip install -r requirements.txt
cd src
python app.py
```

✅ **Success Message:** `Starting ML Prediction Service on 0.0.0.0:5000`

---

#### **Step 2: Backend Server Start करें**

**नया Terminal खोलें** और:

```powershell
# Terminal 2 में
cd "C:\Users\Muskan Singh\Desktop\final year\Prediction-backend\backend-server"
npm install
npm start
```

✅ **Success Message:** 
```
Backend Server running on http://0.0.0.0:3000
ML Service URL: http://localhost:5000
```

---

## ✅ Test करें:

### Browser में:
1. `http://localhost:3000/health` खोलें - Backend Server check
2. `http://localhost:5000/health` खोलें - ML Service check

### PowerShell में Test:

```powershell
# Health Check
curl http://localhost:3000/health
curl http://localhost:5000/health

# Prediction Test
curl -X POST http://localhost:3000/api/predict `
  -H "Content-Type: application/json" `
  -d '{\"TOTRF\": 150.5, \"RD\": 12.3, \"RH\": 85.2, \"DBT\": 28.5, \"MWS\": 45.0, \"MSLP\": 980.5}'
```

### Postman में Test:

**URL:** `POST http://localhost:3000/api/predict`

**Body (JSON):**
```json
{
  "TOTRF": 150.5,
  "RD": 12.3,
  "RH": 85.2,
  "DBT": 28.5,
  "MWS": 45.0,
  "MSLP": 980.5
}
```

---

## ⚠️ Common Issues और Solutions:

### 1. **Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
- Port 5000 या 3000 को use कर रही कोई और application बंद करें
- या `.env` file में different port set करें

### 2. **Module Not Found (Python)**
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:**
```powershell
pip install -r ml_service\requirements.txt
```

### 3. **Module Not Found (Node.js)**
```
Cannot find module 'axios'
```
**Solution:**
```powershell
cd backend-server
npm install
```

### 4. **Model Not Found**
```
FileNotFoundError: No model_*.pkl found
```
**Solution:** 
- Check करें कि `ml_service\model\` folder में `model_*.pkl` file है
- अगर नहीं है तो model train करें:
```powershell
cd ml_service\src
python train.py
```

### 5. **Python Command Not Found**
```
'python' is not recognized
```
**Solution:**
- `python` की जगह `py` या `python3` try करें
- या Python को PATH में add करें

---

## 📋 Quick Checklist:

- [ ] Python installed है (Python 3.8+)
- [ ] Node.js installed है (Node.js 18+)
- [ ] ML Service dependencies install की हैं (`pip install -r requirements.txt`)
- [ ] Backend Server dependencies install की हैं (`npm install`)
- [ ] Model file exists (`ml_service/model/model_*.pkl`)
- [ ] ML Service पहले start किया है (Port 5000)
- [ ] Backend Server बाद में start किया है (Port 3000)

---

## 🎯 Expected Output:

### ML Service Response:
```json
{
  "status": "healthy",
  "service": "ML Prediction Service"
}
```

### Backend Server Response:
```json
{
  "status": "healthy",
  "service": "Backend Server",
  "ml_service_url": "http://localhost:5000"
}
```

### Prediction Response:
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

---

## 💡 Tips:

1. **दोनों services अलग-अलग terminals में चलाएं**
2. **पहले ML Service start करें, फिर Backend Server**
3. **अगर error आए तो terminal में full error message देखें**
4. **Ports check करने के लिए:** `netstat -ano | findstr :5000` और `netstat -ano | findstr :3000`

---

**Happy Coding! 🎉**

