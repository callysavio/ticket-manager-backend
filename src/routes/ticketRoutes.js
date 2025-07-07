import express from "express";
import { body } from "express-validator";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
} from "../controllers/ticketController.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

// Ticket creation validation
const createTicketValidation = [
  body("title").trim().isLength({ min: 1, max: 200 }),
  body("description").trim().isLength({ min: 1 }),
  body("category").isMongoId(),
  body("customerEmail").isEmail().normalizeEmail(),
  body("customerName").trim().isLength({ min: 1 }),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
];

// Update ticket validation
const updateTicketValidation = [
  body("status").optional().isIn(["open", "in-progress", "resolved", "closed"]),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
];

router.post("/", createTicketValidation, createTicket);
router.get("/", authMiddleware, getTickets);
router.get("/:id", authMiddleware, getTicketById);
router.put("/:id", authMiddleware, updateTicketValidation, updateTicket);
router.post("/:id/comments", authMiddleware, addComment);

export default router;
