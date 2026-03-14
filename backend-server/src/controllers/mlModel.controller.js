import * as mlModelService from '../services/mlModel.service.js';

export const getModels = async (req, res, next) => {
  try {
    const data = await mlModelService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getModelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await mlModelService.findById(id);
    if (!data) return res.status(404).json({ error: 'Model not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createModel = async (req, res, next) => {
  try {
    const data = await mlModelService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await mlModelService.update(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    await mlModelService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
