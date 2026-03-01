export const getSensors = async (req, res, next) => {
  try {
    // TODO: use sensorService
    res.json({ data: [] });
  } catch (err) {
    next(err);
  }
};

export const getSensorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use sensorService
    res.json({ data: { id } });
  } catch (err) {
    next(err);
  }
};

export const createSensor = async (req, res, next) => {
  try {
    // TODO: use sensorService
    res.status(201).json({ data: req.body });
  } catch (err) {
    next(err);
  }
};

export const updateSensor = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use sensorService
    res.json({ data: { id, ...req.body } });
  } catch (err) {
    next(err);
  }
};

export const deleteSensor = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use sensorService
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
