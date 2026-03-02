export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.code === 'P2002') {
    status = 409;
    message = 'A record with this value already exists';
  }
  if (err.code === 'P2025') {
    status = 404;
    message = 'Record not found';
  }
  res.status(status).json({ error: message });
};
