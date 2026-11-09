// Error carrying an HTTP status, mapped by the global handler in server.js
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = httpError;
