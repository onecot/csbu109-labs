// Input-validation middleware for Category payloads.
// Rejects a name that is empty or shorter than 3 characters (req 2).
// A missing name is skipped so PATCH can update other fields;
// the schema's `required` rule still rejects a POST without name.

const validateCategoryName = (req, res, next) => {
  const { name } = req.body;

  if (name === undefined) return next();

  if (typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Category name must be at least 3 characters long'
    });
  }

  next();
};

module.exports = validateCategoryName;
