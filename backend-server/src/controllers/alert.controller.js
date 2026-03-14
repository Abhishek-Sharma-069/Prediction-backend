import * as alertService from '../services/alert.service.js';

export const getAlerts = async (req, res, next) => {
  try {
    const data = await alertService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getAlertLevels = async (req, res, next) => {
  try {
    const data = await alertService.findAlertLevels();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createAlertLevel = async (req, res, next) => {
  try {
    const data = await alertService.createAlertLevel(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateAlertLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await alertService.updateAlertLevel(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteAlertLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    await alertService.removeAlertLevel(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getRegions = async (req, res, next) => {
  try {
    const data = await alertService.findRegions();
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

export const sendAlert = async (req, res, next) => {
  try {
    const data = await alertService.sendAlertToUsers(req.body);
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

export const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    await alertService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const resendAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await alertService.resendToUsers(id);
    if (!data) return res.status(404).json({ error: 'Alert not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};
