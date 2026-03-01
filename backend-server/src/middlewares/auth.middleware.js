export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // TODO: verify JWT and set req.user
  req.user = { id: token };
  next();
};
