import express from "express";
// import body from "express-validator";
import { body } from "express-validator";
import authMiddleware from "../middleware/auth.js";
import { login, getProfile } from "../controllers/authController.js";

const router = express.Router();

// Login validation
const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

router.post("/login", loginValidation, login);
router.get("/profile", authMiddleware, getProfile);

export default router;
