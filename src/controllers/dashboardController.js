import Ticket from "../models/Ticket.js";
import Category from "../models/Category.js";

const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;

    // Build query based on user role
    let ticketQuery = {};
    if (user.role === "admin") {
      ticketQuery.assignedTo = user.userId;
    }

    // Get ticket statistics
    const totalTickets = await Ticket.countDocuments(ticketQuery);
    const openTickets = await Ticket.countDocuments({
      ...ticketQuery,
      status: "open",
    });
    const inProgressTickets = await Ticket.countDocuments({
      ...ticketQuery,
      status: "in-progress",
    });
    const resolvedTickets = await Ticket.countDocuments({
      ...ticketQuery,
      status: "resolved",
    });
    const closedTickets = await Ticket.countDocuments({
      ...ticketQuery,
      status: "closed",
    });

    // ✅ Get total categories (active ones only)
    const totalCategories = await Category.countDocuments({ isActive: true });

    // Priority distribution
    const priorityStats = await Ticket.aggregate([
      { $match: ticketQuery },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Recent tickets
    const recentTickets = await Ticket.find(ticketQuery)
      .populate("category")
      .populate("assignedTo", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Category stats (only for superadmin)
    let categoryStats = [];
    if (user.role === "superadmin") {
      categoryStats = await Ticket.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $project: { name: "$category.name", count: 1 } },
      ]);
    }

    // Return stats
    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
          totalCat: totalCategories,
        },
        priorityStats,
        categoryStats,
        recentTickets,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { getDashboardStats };
