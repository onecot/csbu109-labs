// Parses a route :id into a positive integer, or returns null when malformed
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = parseId;
