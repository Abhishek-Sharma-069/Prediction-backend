import * as sensorService from '../services/sensor.service.js';

export const getSensors = async (req, res, next) => {
  try {
    const data = await sensorService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getSensorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await sensorService.findById(id);
    if (!data) return res.status(404).json({ error: 'Sensor not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createSensor = async (req, res, next) => {
  try {
    const data = await sensorService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateSensor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await sensorService.update(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteSensor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await sensorService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
