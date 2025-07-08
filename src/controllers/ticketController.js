import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      category,
      priority,
      customerEmail,
      customerName,
    } = req.body;

    // Find an admin for the selected category
    const admin = await User.findOne({
      category: category,
      role: "admin",
      isActive: true,
    });

    const ticket = new Ticket({
      title,
      description,
      category,
      priority: priority || "medium",
      customerEmail,
      customerName,
      assignedTo: admin ? admin._id : null,
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("category")
      .populate("assignedTo", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: { ticket: populatedTicket },
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const user = req.user;

    let query = {};

    if (user.role === "admin" && user.category) {
      query.category =
        typeof user.category === "object" ? user.category._id : user.category;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .populate("category")
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let query = { _id: id };
    if (user.role === "admin") {
      query.assignedTo = user.userId;
    }

    const ticket = await Ticket.findOne(query)
      .populate("category")
      .populate("assignedTo", "firstName lastName email")
      .populate("comments.author", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    console.error("Get ticket by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, priority } = req.body;
    const user = req.user;

    let query = { _id: id };
    if (user.role === "admin") {
      query.assignedTo = user.userId;
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "resolved") {
        updateData.resolvedAt = new Date();
      } else if (status === "closed") {
        updateData.closedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;

    const ticket = await Ticket.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category")
      .populate("assignedTo", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    let query = { _id: id };
    if (user.role === "admin") {
      query.assignedTo = user.userId;
    }

    const ticket = await Ticket.findOneAndUpdate(
      query,
      {
        $push: {
          comments: {
            content,
            author: user.userId,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate("category")
      .populate("assignedTo", "firstName lastName email")
      .populate("comments.author", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { createTicket, getTickets, getTicketById, updateTicket, addComment };
