import { validationResult } from "express-validator";
import Category from "../models/Category.js";

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      priority: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, description, color, priority } = req.body;

    const category = new Category({
      name,
      description,
      color,
      priority,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { getCategories, createCategory };
