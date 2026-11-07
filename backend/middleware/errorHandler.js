const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Error interno del servidor';

  // Manejo de errores específicos de Mongoose
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Recurso no encontrado con el ID: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    const campo = Object.keys(err.keyValue)[0];
    message = `Valor duplicado detectado para el campo: ${campo}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;

