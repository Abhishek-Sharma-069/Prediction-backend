import { predictWithMlService } from '../services/model.service.js';

export async function predict(req, res, next) {
  try {
    // Expect body like: { data_path: "/abs/path/to/file.xlsx", model_path?: string, probabilities?: boolean }
    const result = await predictWithMlService(req.body);
    res.json(result);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      err.statusCode = 502;
      err.message = 'ML service unavailable';
    }
    next(err);
  }
}

