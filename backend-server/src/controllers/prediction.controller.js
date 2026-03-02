import * as predictionService from '../services/prediction.service.js';

export const getPredictions = async (req, res, next) => {
  try {
    const data = await predictionService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getPredictionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await predictionService.findById(id);
    if (!data) return res.status(404).json({ error: 'Prediction not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createPrediction = async (req, res, next) => {
  try {
    const data = await predictionService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};
