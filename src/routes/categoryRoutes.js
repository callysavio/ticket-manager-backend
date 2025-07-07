import express from "express";
import { body } from "express-validator";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

const createCategoryValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }),
  body("description").optional().trim(),
  body("color").optional().isHexColor(),
  body("priority").optional().isInt({ min: 1 }),
];

router.get("/", getCategories);
router.post("/", authMiddleware, createCategoryValidation, createCategory);

export default router;
