const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ML Service URL (default: http://localhost:5000)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Backend Server',
    ml_service_url: ML_SERVICE_URL
  });
});

// Predict endpoint - forwards request to ML service
app.post('/api/predict', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data) {
      return res.status(400).json({
        error: 'No data provided',
        message: 'Please provide JSON data in request body'
      });
    }

    // Forward request to ML service
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = response.data;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calling ML service:', error);
    if (error.response) {
      // ML service returned an error
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Batch predict endpoint
app.post('/api/predict/batch', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Invalid data format',
        message: 'Please provide an array of records'
      });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/predict/batch`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = response.data;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calling ML service:', error);
    if (error.response) {
      // ML service returned an error
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get prediction with probabilities
app.post('/api/predict/with-probabilities', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data) {
      return res.status(400).json({
        error: 'No data provided',
        message: 'Please provide JSON data in request body'
      });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/predict?probabilities=true`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = response.data;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calling ML service:', error);
    if (error.response) {
      // ML service returned an error
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Backend Server running on http://${HOST}:${PORT}`);
  console.log(`ML Service URL: ${ML_SERVICE_URL}`);
});

