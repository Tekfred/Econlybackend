function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const statusCode = error.statusCode || error.status || (error.name === 'CastError' ? 400 : 500);
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = statusCode >= 500 ? 'An unexpected server error occurred.' : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({ error: { code, message } });
}

module.exports = { errorHandler };
