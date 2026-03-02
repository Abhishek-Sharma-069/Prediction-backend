import axios from 'axios';
import config from '../config/config.js';

export async function predictWithMlService(payload) {
  const url = `${config.mlServiceUrl}/predict`;
  const response = await axios.post(url, payload, {
    timeout: 10000,
  });
  return response.data;
}
