const DepartmentModel = require('../models/departmentModel');

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await DepartmentModel.getAllActive();
    res.json(departments);
  } catch (err) {
    next(err);
  }
};
