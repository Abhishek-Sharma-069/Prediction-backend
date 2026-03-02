import * as alertService from '../services/alert.service.js';

export const getAlerts = async (req, res, next) => {
  try {
    const data = await alertService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await alertService.findById(id);
    if (!data) return res.status(404).json({ error: 'Alert not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    const data = await alertService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await alertService.update(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
