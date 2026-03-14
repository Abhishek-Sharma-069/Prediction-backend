import * as regionService from '../services/region.service.js';

export const getRegions = async (req, res, next) => {
  try {
    const data = await regionService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getRegionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await regionService.findById(id);
    if (!data) return res.status(404).json({ error: 'Region not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createRegion = async (req, res, next) => {
  try {
    const data = await regionService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateRegion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await regionService.update(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteRegion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await regionService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
