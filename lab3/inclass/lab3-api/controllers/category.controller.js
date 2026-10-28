// Request handlers for the Category API
const Category = require('../models/category.model');

// 1. GET /api/categories - List categories (pagination & sorting)
exports.getAllCategories = async (req, res, next) => {
  try {
    // Query values are strings: convert them and fall back to safe defaults
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);

    const skip = (page - 1) * limit;
    const totalCategories = await Category.countDocuments({});
    const categories = await Category.find()
      // _id tiebreaker: createdAt has millisecond resolution, so seeded rows can
      // share a timestamp and then skip/limit may repeat or drop documents.
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        totalCategories
      },
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/categories/:id - Get category details by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'No category found with the given ID' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/categories - Create a new category
exports.createCategory = async (req, res, next) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
  } catch (error) {
    next(error);
  }
};

// 4. PATCH /api/categories/:id - Update a category by ID (partial update)
// findByIdAndUpdate only changes the fields that are sent.
// new: true returns the updated document, runValidators: true applies the schema rules.
exports.updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'No category found to update' });
    }
    res.status(200).json({ success: true, message: 'Category updated successfully', data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /api/categories/:id - Delete a category by ID
exports.deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'No category found to delete' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
