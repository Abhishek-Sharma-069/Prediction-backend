import {
  predictWithMlServiceByExcel,
  predictWithMlServiceByValues,
} from '../services/model.service.js';

function handleMlError(err, next) {
  if (err.response) {
    err.statusCode = err.response.status;
    const d = err.response.data;
    err.message = d?.detail ?? d?.message ?? (typeof d === 'string' ? d : JSON.stringify(d ?? {}));
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
    err.statusCode = 502;
    err.message = 'ML service unavailable';
  }
  next(err);
}

/** Predict by feature values (real environment). */
export async function predict(req, res, next) {
  try {
    const result = await predictWithMlServiceByValues(req.body);
    res.json(result);
  } catch (err) {
    handleMlError(err, next);
  }
}

/** Predict by Excel file (testing on dataset). */
export async function predictByExcel(req, res, next) {
  try {
    const result = await predictWithMlServiceByExcel(req.body);
    res.json(result);
  } catch (err) {
    handleMlError(err, next);
  }
}
