const CategoryModel = require('../models/categoryModel');
const { categorySchema } = require('../utils/validation');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.getAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const newCategory = await CategoryModel.create(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Fetch existing record to preserve is_active unless explicitly changed
    const existing = await CategoryModel.getById(id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    // Only overwrite is_active if the client explicitly sends a new value
    const is_active = req.body.hasOwnProperty('is_active')
      ? req.body.is_active
      : existing.is_active;

    const updatedCategory = await CategoryModel.update(id, { name, description, is_active });
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });

    res.json(updatedCategory);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.delete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
