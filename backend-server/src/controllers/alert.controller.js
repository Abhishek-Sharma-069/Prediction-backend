export const getAlerts = async (req, res, next) => {
  try {
    // TODO: use alertService
    res.json({ data: [] });
  } catch (err) {
    next(err);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use alertService
    res.json({ data: { id } });
  } catch (err) {
    next(err);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    // TODO: use alertService
    res.status(201).json({ data: req.body });
  } catch (err) {
    next(err);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: use alertService
    res.json({ data: { id, ...req.body } });
  } catch (err) {
    next(err);
  }
};
