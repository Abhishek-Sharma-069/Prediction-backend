import axios from 'axios';
import config from '../config/config.js';

// Normalize: no trailing slash so path concatenation doesn't produce double slash
const baseUrl = config.mlServiceUrl ? config.mlServiceUrl.replace(/\/+$/, '') : '';
const timeout = 20000;

function ensureMlUrl() {
  if (!baseUrl) {
    const err = new Error('ML service URL not configured (set ML_SERVICE_URL in env)');
    err.statusCode = 503;
    throw err;
  }
}

/** Call ML service: predict by Excel file (for testing on dataset). */
export async function predictWithMlServiceByExcel(payload) {
  ensureMlUrl();
  const response = await axios.post(`${baseUrl}/predict-by-excel`, payload, { timeout });
  return response.data;
}

/** Call ML service: predict by feature values (for real environment). */
export async function predictWithMlServiceByValues(payload) {
  ensureMlUrl();
  const response = await axios.post(`${baseUrl}/predict-by-value`, payload, { timeout });
  return response.data;
}
