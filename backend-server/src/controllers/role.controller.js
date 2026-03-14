import * as roleService from '../services/role.service.js';

export const getRoles = async (req, res, next) => {
  try {
    const data = await roleService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await roleService.findById(id);
    if (!data) return res.status(404).json({ error: 'Role not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const data = await roleService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await roleService.update(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    await roleService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
