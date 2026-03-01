export const getUsers = async (req, res, next) => {
  try {
    // TODO: use userService
    res.json({ data: [] });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use userService
    res.json({ data: { id } });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    // TODO: use userService
    res.status(201).json({ data: req.body });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use userService
    res.json({ data: { id, ...req.body } });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use userService
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
