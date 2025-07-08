import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

//CORS setup for Vercel & localhost
const allowedOrigins = [
  "https://ticket-manager-nu.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tickets", ticketRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Ticket Manager Backend is live.");
});

// ✅ Start server with your custom DB function
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await connectDB(); // your existing DB connection function
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to database", err);
  }
});
