export const getPredictions = async (req, res, next) => {
  try {
    // TODO: use predictionService
    res.json({ data: [] });
  } catch (err) {
    next(err);
  }
};

export const getPredictionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use predictionService
    res.json({ data: { id } });
  } catch (err) {
    next(err);
  }
};

export const createPrediction = async (req, res, next) => {
  try {
    // TODO: use predictionService
    res.status(201).json({ data: req.body });
  } catch (err) {
    next(err);
  }
};
