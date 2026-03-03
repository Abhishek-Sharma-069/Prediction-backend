import axios from 'axios';
import config from '../config/config.js';

const baseUrl = config.mlServiceUrl;
const timeout = 10000;

/** Call ML service: predict by Excel file (for testing on dataset). */
export async function predictWithMlServiceByExcel(payload) {
  const response = await axios.post(`${baseUrl}/predict-by-excel`, payload, { timeout });
  return response.data;
}

/** Call ML service: predict by feature values (for real environment). */
export async function predictWithMlServiceByValues(payload) {
  const response = await axios.post(`${baseUrl}/predict-by-value`, payload, { timeout });
  return response.data;
}
