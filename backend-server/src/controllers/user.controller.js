import * as userService from '../services/user.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const data = await userService.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await userService.findById(id);
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = await userService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await userService.update(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getUserRoles = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const data = await userService.findUserRoles(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const addUserRole = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { role_id: roleId } = req.body;
    if (roleId == null) return res.status(400).json({ error: 'role_id is required' });
    const data = await userService.addUserRole(userId, roleId);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const removeUserRole = async (req, res, next) => {
  try {
    const { id: userId, roleId } = req.params;
    await userService.removeUserRole(userId, roleId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
